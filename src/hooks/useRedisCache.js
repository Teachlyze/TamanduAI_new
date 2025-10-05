// src/hooks/useRedisCache.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { metrics } from '@/services/metrics';
import redis from '@/services/redis';
import { Logger } from '@/services/logger';
import cacheManager from '@/utils/cacheManager';

// Configurações
const STALE_TIME = 60 * 1000; // 1 minuto para considerar os dados obsoletos
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

// Estratégia de cache: Stale-While-Revalidate
export const useRedisCache = (key, fetchFunction, options = {}) => {
  const {
    ttl = 300, // 5 minutos por padrão
    dependencies = [],
    enabled = true,
    staleTime = STALE_TIME,
    skipInitialFetch = false,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skipInitialFetch);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const isMounted = useRef(true);
  const fetchController = useRef(null);
  const isFetching = useRef(false);
  const cacheKey = typeof key === 'function' ? key() : key;

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (fetchController.current) {
        fetchController.current.abort();
      }
    };
  }, []);

  // Função para buscar dados da API
  const fetchData = useCallback(async (force = false) => {
    if ((!cacheKey && !force) || !enabled) return;
    
    // Se já está buscando, não faz nada
    if (isFetching.current) return;
    
    isFetching.current = true;
    
    // Cria um novo AbortController para a requisição
    fetchController.current = new AbortController();
    
    try {
      // Tenta buscar do cache primeiro (se não for forçado)
      if (!force) {
        const cachedData = await redis.get(cacheKey);
        
        if (cachedData) {
          metrics.cacheHit();
          
          // Verifica se os dados estão obsoletos
          const isStale = !cachedData.timestamp || 
            (Date.now() - new Date(cachedData.timestamp).getTime() > staleTime);
          
          if (isMounted.current) {
            setData(cachedData.data);
            setStale(isStale);
            setLastUpdated(new Date(cachedData.timestamp));
            setLoading(false);
            
            // Se os dados estão obsoletos, faz uma nova busca em segundo plano
            if (isStale) {
              Logger.debug('Data is stale, refreshing in background', { key: cacheKey });
              fetchData(true).catch(err => {
                Logger.error('Background refresh failed', { 
                  key: cacheKey, 
                  error: err.message 
                });
              });
            }
            
            // Se temos dados em cache e não estamos forçando, retorna
            if (!force) {
              return;
            }
          }
        } else {
          metrics.cacheMiss();
        }
      }
      
      // Se chegou aqui, ou não tinha cache ou está forçando atualização
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }
      
      const startTime = performance.now();
      const response = await fetchFunction(fetchController.current.signal);
      const endTime = performance.now();
      
      // Registra métricas de latência
      metrics.apiCall(endTime - startTime);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      // Prepara os dados para o cache
      const dataToCache = {
        data: response,
        timestamp: new Date().toISOString(),
        metadata: {
          ttl,
          staleTime
        }
      };
      
      // Salva no cache
      await redis.set(cacheKey, dataToCache, ttl);
      
      // Atualiza o estado
      if (isMounted.current) {
        setData(response);
        setStale(false);
        setLastUpdated(new Date(dataToCache.timestamp));
        setLoading(false);
        setRetryCount(0); // Reseta a contagem de tentativas
        
        // Chama o callback de sucesso, se fornecido
        if (onSuccess) {
          onSuccess(response);
        }
      }
      
      return response;
      
    } catch (error) {
      // Se for um abort, não faz nada
      if (error.name === 'AbortError') {
        return;
      }
      
      metrics.apiError();
      Logger.error('Error in useRedisCache', { 
        key: cacheKey, 
        error: error.message,
        stack: error.stack
      });
      
      if (isMounted.current) {
        setError(error);
        setLoading(false);
        
        // Tenta novamente em caso de erro
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAY * Math.pow(2, retryCount);
          setTimeout(() => {
            if (isMounted.current) {
              setRetryCount(c => c + 1);
              fetchData(true);
            }
          }, delay);
        } else if (onError) {
          onError(error);
        }
      }
      
      throw error;
      
    } finally {
      isFetching.current = false;
      fetchController.current = null;
    }
  }, [cacheKey, fetchFunction, ttl, staleTime, enabled, retryCount, onSuccess, onError]);

  // Efeito para carregar os dados quando as dependências mudam
  useEffect(() => {
    if (skipInitialFetch) return;
    
    fetchData().catch(() => {
      // Já tratado no fetchData
    });
    
    // Cancela a requisição ao desmontar
    return () => {
      if (fetchController.current) {
        fetchController.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, skipInitialFetch, ...dependencies, fetchData]);

  // Função para invalidar o cache
  const invalidateCache = useCallback(async () => {
    if (!cacheKey) return;
    
    try {
      await redis.del(cacheKey);
      metrics.cacheDelete();
      
      // Força uma nova busca
      return fetchData(true);
    } catch (error) {
      Logger.error('Error invalidating cache', { 
        key: cacheKey, 
        error: error.message 
      });
      throw error;
    }
  }, [cacheKey, fetchData]);
  
  // Função para atualizar o cache manualmente
  const updateCache = useCallback((updater) => {
    if (!cacheKey) return;
    
    setData(prevData => {
      const newData = typeof updater === 'function' ? updater(prevData) : updater;
      
      // Atualiza o cache em segundo plano
      const updateCacheAsync = async () => {
        try {
          const dataToCache = {
            data: newData,
            timestamp: new Date().toISOString(),
            metadata: { ttl, staleTime }
          };
          await redis.set(cacheKey, dataToCache, ttl);
          metrics.cacheSet();
        } catch (error) {
          Logger.error('Error updating cache', { 
            key: cacheKey, 
            error: error.message 
          });
        }
      };
      
      updateCacheAsync();
      
      return newData;
    });
  }, [cacheKey, ttl, staleTime]);

  return {
    data,
    error,
    loading,
    stale,
    lastUpdated,
    refetch: () => fetchData(true),
    invalidate: invalidateCache,
    updateCache,
    isStale: stale,
    retryCount,
    cacheKey
  };
};

// Hook specifically for user permissions with Redis-style caching
export const useUserPermissions = (userId) => {
  return useRedisCache(
    `user_permissions:${userId}`,
    async () => {
      if (!userId) return null;

      try {
        const { data, error } = await supabase.rpc('get_cached_permissions', {
          user_id: userId
        });

        if (error) {
          console.error('Error fetching user permissions:', error);
          return null;
        }

        return data;
      } catch (err) {
        console.error('Error in useUserPermissions:', err);
        return null;
      }
    },
    3600, // 1 hour TTL for permissions
    [userId]
  );
};

// Hook específico para classes do usuário
export const useUserClasses = (userId, role = 'student') => {
  return useRedisCache(
    `user:classes:${userId}:${role}`,
    async () => {
      try {
        // Fetch user classes based on role
        const { data, error } = await supabase
          .from('class_members')
          .select('*')
          .eq('user_id', userId)
          .eq('role', role);
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('Error fetching user classes:', error);
        throw new Error('Failed to fetch user classes: ' + error.message);
      }
    },
    10 * 60, // 10 minutes cache
    [userId, role]
  );
};

// Hook específico para atividades de uma classe
export const useClassActivities = (classId) => {
  return useRedisCache(
    `class:activities:${classId}`,
    async () => {
      const response = await fetch(`/api/classes/${classId}/activities`);
      if (!response.ok) throw new Error('Failed to fetch class activities');
      return await response.json();
    },
    5 * 60, // 5 minutes
    [classId]
  );
};

/**
 * Hook para gerenciar dados de atividades com cache e atualização em segundo plano
 * @param {string} activityId - ID da atividade
 * @param {Object} options - Opções de configuração
 * @param {boolean} [options.enabled=true] - Se a busca deve ser executada
 * @param {Function} [options.onActivityLoaded] - Callback chamado quando os dados são carregados
 * @param {Function} [options.onError] - Callback chamado em caso de erro
 * @param {number} [options.ttl=900] - Tempo de vida do cache em segundos
 * @param {number} [options.staleTime=60000] - Tempo em ms após o qual os dados são considerados obsoletos
 * @returns {Object} Dados e funções de controle
 */
export const useActivityDetails = (activityId, options = {}) => {
  const { 
    enabled = true, 
    onActivityLoaded,
    onError,
    ttl = 15 * 60, // 15 minutos por padrão
    staleTime = 60 * 1000, // 1 minuto para considerar os dados obsoletos
  } = options;
  
  const [isBackgroundUpdating, setIsBackgroundUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const cacheKey = activityId ? `activity:details:${activityId}` : null;
  
  const fetchActivity = useCallback(async (signal, isBackgroundRefresh = false) => {
    if (!activityId || !enabled || !cacheKey) return null;
    
    const startTime = performance.now();
    let cacheHit = false;
    
    try {
      // Tenta obter do cache primeiro (apenas se não for um refresh em segundo plano)
      if (!isBackgroundRefresh) {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          const { data, timestamp } = cached;
          const age = Date.now() - timestamp;
          
          // Se os dados não estão obsoletos, retorna do cache
          if (age < staleTime) {
            metrics.cacheHit('activity_details');
            cacheHit = true;
            return data;
          }
          
          // Se os dados estão obsoletos, retorna do cache mas inicia um refresh em segundo plano
          if (age < (ttl * 1000)) {
            metrics.cacheStale('activity_details');
            cacheHit = true;
            // Inicia o refresh em segundo plano
            fetchActivity(signal, true).catch(err => {
              Logger.warn('Background refresh failed', { 
                activityId, 
                error: err.message 
              });
            });
            return data;
          }
        }
      }
      
      // Se chegou aqui, precisa buscar da API
      const response = await fetch(`/api/activities/${activityId}`, { 
        signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      
      const data = await response.json();
      const endTime = performance.now();
      
      // Atualiza o cache com os novos dados
      await cacheManager.set(cacheKey, data, ttl);
      
      // Atualiza o timestamp da última atualização
      setLastUpdated(new Date().toISOString());
      
      // Log de métricas
      metrics.apiCall(
        'activity_details',
        endTime - startTime, 
        { 
          cacheHit, 
          fromCache: false,
          activityId,
          status: 'success'
        }
      );
      
      // Callback
      if (onActivityLoaded && !isBackgroundRefresh) {
        onActivityLoaded(data);
      }
      
      return data;
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        metrics.apiError('activity_details', error);
        const logData = {
          activityId,
          error: error.message,
          status: error.status,
          cacheHit,
          stack: error.stack
        };
        
        Logger.error('Failed to fetch activity details', logData);
        
        if (onError) {
          onError(error, { cacheHit });
        }
      }
      
      // Se for um erro 404, remove do cache
      if (error.status === 404) {
        await cacheManager.del(cacheKey);
      }
      
      if (!isBackgroundRefresh) {
        throw error;
      }
      
      return null;
    }
  }, [activityId, enabled, onActivityLoaded, onError, ttl, staleTime, cacheKey]);
  
  // Função para forçar a atualização em segundo plano
  const refreshInBackground = useCallback(async () => {
    if (isBackgroundUpdating) return;
    
    try {
      setIsBackgroundUpdating(true);
      const controller = new AbortController();
      await fetchActivity(controller.signal, true);
    } catch (error) {
      Logger.warn('Background update failed', { 
        activityId,
        error: error.message 
      });
    } finally {
      setIsBackgroundUpdating(false);
    }
  }, [activityId, fetchActivity, isBackgroundUpdating]);
  
  const {
    data,
    loading,
    error,
    refetch,
    updateCache
  } = useRedisCache(
    cacheKey,
    fetchActivity,
    {
      ...options,
      ttl,
      staleTime,
      enabled
    }
  );
  
  // Função para invalidar o cache desta atividade
  const invalidateCache = useCallback(async () => {
    if (!cacheKey) return false;
    return cacheManager.del(cacheKey);
  }, [cacheKey]);
  
  return {
    activity: data,
    loading: loading || isBackgroundUpdating,
    error,
    refetch,
    invalidateCache,
    updateCache,
    isBackgroundUpdating,
    lastUpdated,
    refreshInBackground
  };
};

// Hook específico para meetings do usuário
export const useUserMeetings = (userId) => {
  return useRedisCache(
    `user:meetings:${userId}`,
    async () => {
      const response = await fetch(`/api/user/meetings/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user meetings');
      return await response.json();
    },
    10 * 60, // 10 minutes
    [userId]
  );
};

// Hook específico para alunos de uma classe
export const useClassStudents = (classId) => {
  return useRedisCache(
    `class:students:${classId}`,
    async () => {
      const response = await fetch(`/api/classes/${classId}/students`);
      if (!response.ok) throw new Error('Failed to fetch class students');
      return await response.json();
    },
    10 * 60, // 10 minutes
    [classId]
  );
};

// Hook específico para notificações do usuário
export const useUserNotifications = (userId, limit = 20) => {
  return useRedisCache(
    `notifications:${userId}:${limit}`,
    async () => {
      const response = await fetch(`/api/notifications/${userId}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    },
    5 * 60, // 5 minutes
    [userId, limit]
  );
};

// Hook específico para performance da classe
export const useClassPerformance = (classId) => {
  return useRedisCache(
    `class:performance:${classId}`,
    async () => {
      const response = await fetch(`/api/classes/${classId}/performance`);
      if (!response.ok) throw new Error('Failed to fetch class performance');
      return await response.json();
    },
    60 * 60, // 1 hour
    [classId]
  );
};

// Hook específico para performance do estudante
export const useStudentPerformance = (studentId) => {
  return useRedisCache(
    `student:performance:${studentId}`,
    async () => {
      const response = await fetch(`/api/students/${studentId}/performance`);
      if (!response.ok) throw new Error('Failed to fetch student performance');
      return await response.json();
    },
    60 * 60, // 1 hour
    [studentId]
  );
};

/**
 * Hook para gerenciar submissões de atividades com cache e invalidação
 * @param {string} activityId - ID da atividade
 * @param {Object} options - Opções de configuração
 * @param {boolean} [options.enabled=true] - Se a busca deve ser executada
 * @param {Function} [options.onSubmissionsLoaded] - Callback chamado quando as submissões são carregadas
 * @param {Function} [options.onSubmissionCreated] - Callback chamado quando uma submissão é criada
 * @param {Function} [options.onSubmissionUpdated] - Callback chamado quando uma submissão é atualizada
 * @param {Function} [options.onSubmissionDeleted] - Callback chamado quando uma submissão é removida
 * @param {Function} [options.onError] - Callback chamado em caso de erro
 * @param {number} [options.ttl=300] - Tempo de vida do cache em segundos (padrão: 5 minutos)
 * @param {number} [options.staleTime=30000] - Tempo em ms após o qual os dados são considerados obsoletos (padrão: 30s)
 * @param {boolean} [options.autoRefresh=true] - Se deve atualizar automaticamente os dados obsoletos em segundo plano
 * @returns {Object} Dados e funções de controle
 */
export const useActivitySubmissions = (activityId, options = {}) => {
  const { 
    enabled = true, 
    onSubmissionsLoaded,
    onSubmissionCreated,
    onSubmissionUpdated,
    onSubmissionDeleted,
    onError,
    ttl = 5 * 60, // 5 minutos por padrão
    staleTime = 30 * 1000, // 30 segundos para considerar os dados obsoletos
    autoRefresh = true // Atualização automática quando os dados estiverem obsoletos
  } = options;
  
  const cacheKey = activityId ? `activity:submissions:${activityId}` : null;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Função para buscar submissões da API
  const fetchSubmissions = useCallback(async (signal, isBackgroundRefresh = false) => {
    if (!activityId || !enabled || !cacheKey) return [];
    
    const startTime = performance.now();
    let cacheHit = false;
    
    try {
      // Tenta obter do cache primeiro (apenas se não for um refresh em segundo plano)
      if (!isBackgroundRefresh) {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          const { data, timestamp } = cached;
          const age = Date.now() - timestamp;
          
          // Se os dados não estão obsoletos, retorna do cache
          if (age < staleTime) {
            metrics.cacheHit('activity_submissions');
            cacheHit = true;
            return data;
          }
          // Se os dados estão obsoletos, retorna do cache mas inicia um refresh em segundo plano
          if (age < (ttl * 1000) && autoRefresh) {
            metrics.cacheStale('activity_submissions');
            cacheHit = true;
            // Inicia o refresh em segundo plano
            fetchSubmissions(signal, true).catch(err => {
              Logger.warn('Background refresh failed', { 
                activityId, 
                error: err.message 
              });
            });
            return data;
          }
        }
      }
      
      // Se chegou aqui, precisa buscar da API
      const response = await fetch(`/api/activities/${activityId}/submissions`, { 
        signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      
      const data = await response.json();
      const endTime = performance.now();
      
      // Atualiza o cache com os novos dados
      await cacheManager.set(cacheKey, data, ttl);
      
      // Atualiza o timestamp da última atualização
      setLastUpdated(new Date().toISOString());
      
      // Log de métricas
      metrics.apiCall(
        'activity_submissions',
        endTime - startTime, 
        { 
          cacheHit, 
          fromCache: false,
          activityId,
          status: 'success',
          count: data.length
        }
      );
      
      // Log de métricas
      metrics.apiCall(
        endTime - startTime, 
        'activity_submissions', 
        { 
          cacheHit, 
          fromCache: false,
          itemCount: data?.length || 0 
        }
      );
      
      // Chamar callback se fornecido
      if (onSubmissionsLoaded && !isBackgroundRefresh) {
        onSubmissionsLoaded(data);
      }
      
      return data;
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        metrics.apiError('activity_submissions');
        const logData = {
          activityId,
          error: error.message,
          status: error.status,
          cacheHit
        };
        
        Logger.error('Failed to fetch activity submissions', logData);
        
        if (onError) {
          onError(error, { cacheHit });
        }
      }
      
      // Se não for um refresh em segundo plano, propaga o erro
      if (!isBackgroundRefresh) {
        throw error;
      }
      
      return null;
    }
  }, [activityId, enabled, onSubmissionsLoaded, onError, ttl, staleTime, autoRefresh, cacheKey]);
  
  const { 
    data: submissions = [], 
    loading, 
    error, 
    refetch, 
    updateCache 
  } = useRedisCache(
    cacheKey,
    fetchSubmissions,
    {
      ...options,
      ttl,
      staleTime,
      enabled
    }
  );
  
  // Efeito para lidar com eventos de submissão em tempo real
  useEffect(() => {
    if (!activityId || !enabled) return;
    
    // Função para lidar com novas submissões
    const _handleNewSubmission = (newSubmission) => {
      if (newSubmission.activity_id === activityId) {
        updateCache(currentSubmissions => {
          const existingIndex = currentSubmissions.findIndex(
            s => s.id === newSubmission.id
          );
          
          if (existingIndex >= 0) {
            // Atualiza submissão existente
            const updated = [...currentSubmissions];
            updated[existingIndex] = newSubmission;
            if (onSubmissionUpdated) onSubmissionUpdated(newSubmission);
            return updated;
          } else {
            // Adiciona nova submissão
            if (onSubmissionCreated) onSubmissionCreated(newSubmission);
            return [newSubmission, ...currentSubmissions];
          }
        });
      }
    };
    
    // Função para lidar com exclusão de submissão
    const _handleDeleteSubmission = (deletedId) => {
      updateCache(currentSubmissions => {
        const filtered = currentSubmissions.filter(s => s.id !== deletedId);
        if (filtered.length !== currentSubmissions.length && onSubmissionDeleted) {
          onSubmissionDeleted(deletedId);
        }
        return filtered;
      });
    };
    
    // Aqui você pode adicionar listeners para eventos em tempo real, por exemplo:
    // const subscription = subscribeToSubscriptions(activityId, {
    //   onNew: _handleNewSubmission,
    //   onUpdate: _handleNewSubmission, // Mesmo handler para atualizações
    //   onDelete: _handleDeleteSubmission
    // });
    
    return () => {
      // subscription.unsubscribe();
    };
  }, [activityId, enabled, updateCache, onSubmissionCreated, onSubmissionUpdated, onSubmissionDeleted]);
  
  // Função para forçar a atualização em segundo plano
  const _refreshInBackground = useCallback(async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      const controller = new AbortController();
      await fetchSubmissions(controller.signal, true);
    } catch (error) {
      Logger.warn('Background refresh failed', { 
        activityId,
        error: error.message 
      });
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [activityId, fetchSubmissions, isRefreshing]);
  
  // Função para adicionar uma submissão manualmente
  const addSubmission = useCallback(async (newSubmission) => {
    if (!activityId || !cacheKey) return;
    
    // Otimistic update
    updateCache(currentSubmissions => {
      const existingIndex = currentSubmissions.findIndex(
        s => s.id === newSubmission.id
      );
      
      if (existingIndex >= 0) {
        // Atualiza submissão existente
        const updated = [...currentSubmissions];
        updated[existingIndex] = newSubmission;
        return updated;
      }
      
      // Adiciona nova submissão
      return [newSubmission, ...currentSubmissions];
    });
    
    // Tenta sincronizar com o servidor
    try {
      const response = await fetch(`/api/activities/${activityId}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSubmission)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save submission');
      }
      
      const savedSubmission = await response.json();
      
      // Atualiza o cache com a versão salva no servidor
      updateCache(currentSubmissions => {
        const existingIndex = currentSubmissions.findIndex(
          s => s.id === savedSubmission.id || s.tempId === savedSubmission.tempId
        );
        
        if (existingIndex >= 0) {
          const updated = [...currentSubmissions];
          updated[existingIndex] = savedSubmission;
          return updated;
        }
        
        return [savedSubmission, ...currentSubmissions];
      });
      
      return savedSubmission;
      
    } catch (error) {
      // Reverte a atualização otimista em caso de erro
      await refetch();
      throw error;
    }
  }, [activityId, updateCache, refetch, cacheKey]);
  
  // Função para remover uma submissão manualmente
  const removeSubmission = useCallback(async (submissionId) => {
    if (!activityId) return;
    
    // Otimistic update
    let removedSubmission = null;
    updateCache(currentSubmissions => {
      const filtered = currentSubmissions.filter(s => {
        if (s.id === submissionId) {
          removedSubmission = s;
          return false;
        }
        return true;
      });
      return filtered;
    });
    
    // Tenta remover do servidor
    try {
      const response = await fetch(`/api/activities/${activityId}/submissions/${submissionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }
      
      return removedSubmission;
      
    } catch (error) {
      // Reverte a remoção em caso de erro
      await refetch();
      throw error;
    }
  }, [activityId, refetch, updateCache]);
  
  // Função para forçar a recarga das submissões
  const refreshSubmissions = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refetch();
    } catch (error) {
      Logger.error('Failed to refresh submissions', { 
        activityId,
        error: error.message 
      });
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [activityId, refetch]);
  
  // Função para invalidar o cache
  const invalidateCache = useCallback(async () => {
    if (!activityId) return false;
    
    try {
      await redis.del(cacheKey);
      return true;
    } catch (error) {
      Logger.error('Failed to invalidate submissions cache', {
        activityId,
        error: error.message
      });
      return false;
    }
  }, [activityId, cacheKey]);
  
  // Função para obter uma submissão específica
  const _getSubmission = useCallback((submissionId) => {
    return submissions.find(s => s.id === submissionId);
  }, [submissions]);

  // Função para atualizar uma submissão
  const _updateSubmission = useCallback((submissionId, updates) => {
    if (!activityId) return;
    
    updateCache(currentSubmissions => {
      const index = currentSubmissions.findIndex(s => s.id === submissionId);
      if (index === -1) return currentSubmissions;
      
      const updated = [...currentSubmissions];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  }, [activityId, updateCache]);

  // Função para forçar a invalidação do cache
  const _forceInvalidate = useCallback(async () => {
    if (!cacheKey) return false;
    return cacheManager.del(cacheKey);
  }, [cacheKey]);

  return {
    submissions,
    loading: loading || isRefreshing,
    error,
    lastUpdated,
    isRefreshing,
    
    // Ações
    addSubmission,
    removeSubmission,
    refreshSubmissions,
    invalidateCache,
    updateCache,
    refetch
  };
};

// Hook específico para analytics da classe
export const useClassAnalytics = (classId, period = 'month') => {
  return useRedisCache(
    `class:analytics:${classId}:${period}`,
    async () => {
      const response = await fetch(`/api/classes/${classId}/analytics?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch class analytics');
      return await response.json();
    },
    60 * 60 * 6, // 6 hours
    [classId, period]
  );
};

export default useRedisCache;
