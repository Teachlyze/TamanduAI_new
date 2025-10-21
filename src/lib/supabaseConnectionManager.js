// src/lib/supabaseConnectionManager.js
/**
 * Gerenciador avançado de conexões Supabase para máxima robustez
 */
import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseSingleton } from './supabaseClient';
import { errorMonitor } from '../services/errorMonitoring.jsx';
import { performanceOptimizer } from '../services/performanceOptimizer.jsx';

// Configurações de ambiente com validação
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Estados de conexão
const CONNECTION_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  RECONNECTING: 'reconnecting',
};

class SupabaseConnectionManager {
  constructor() {
    this.state = CONNECTION_STATES.DISCONNECTED;
    this.client = null;
    this.adminClient = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = null;
    this.connectionCheckInterval = null;

    this.initialize();
  }

  /**
   * Inicializa o gerenciador de conexão
   */
  async initialize() {
    try {
      this.validateConfiguration();
      await this.createClients();
      await this.testConnection();
      this.startHeartbeat();
      this.startConnectionMonitoring();

      this.state = CONNECTION_STATES.CONNECTED;
      // console.log('✅ Supabase connection manager initialized');

    } catch (error) {
      this.state = CONNECTION_STATES.ERROR;
      errorMonitor.recordError(error, {
        type: 'connection_manager_initialization',
        critical: true,
      });
      throw error;
    }
  }

  /**
   * Valida configuração crítica
   */
  validateConfiguration() {
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL não configurada');
    }

    if (!supabaseAnonKey) {
      throw new Error('Chave anônima do Supabase não configurada (VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY)');
    }

    // Validar formato da URL
    try {
      new URL(supabaseUrl);
    } catch {
      throw new Error('VITE_SUPABASE_URL não é uma URL válida');
    }

    // Log de configuração (sem dados sensíveis)
    // console.log('🔧 Supabase config validated:', {
      url: supabaseUrl.replace(/https?:\/\//, ''),
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
      environment: import.meta.env.MODE,
    });
  }

  /**
   * Cria instâncias dos clientes Supabase
   */
  async createClients() {
    const isProduction = import.meta.env.MODE === 'production';

    // Use the singleton instance instead of creating a new one
    // console.log('🔗 Using existing Supabase singleton instance');
    this.client = supabaseSingleton;

    // Cliente administrativo (se disponível)
    if (supabaseServiceKey) {
      this.adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            'X-Client-Info': 'tamanduai-admin',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
        },
      });
    }

    this.setupEventListeners();
  }

  /**
   * Configura listeners de eventos
   */
  setupEventListeners() {
    // Skip auth state listeners since they're already handled by AuthContext
    // This prevents duplicate event handling
    // console.log('[SupabaseConnectionManager] Skipping auth listeners (handled by AuthContext)');

    // Realtime connection events
    // Note: Realtime events are handled through channels, not direct onOpen/onClose
    // The realtime object doesn't expose onOpen/onClose methods directly
    if (this.client.realtime) {
      // console.log('[SupabaseConnectionManager] Realtime client available');
      // Realtime connection status is managed through channel subscriptions
    }
  }

  /**
   * Testa conexão inicial
   */
  async testConnection() {
    try {
      const startTime = performance.now();

      // Teste básico de conectividade (evitar HEAD para reduzir 406)
      const { error } = await this.client
        .from('profiles')
        .select('id', { count: 'exact', head: false })
        .limit(1);

      const duration = performance.now() - startTime;

      if (error && error?.status !== 406) {
        throw error;
      }

      // console.log(`✅ Supabase connection test passed (${duration.toFixed(0)}ms)`);

      // Registrar métrica de performance
      performanceOptimizer.metrics.networkRequests.push({
        url: `${supabaseUrl}/rest/v1/profiles`,
        duration,
        status: 200,
        timestamp: startTime,
        method: 'GET',
      });

    } catch (error) {
      errorMonitor.recordError(error, {
        type: 'connection_test_failed',
        critical: true,
      });
      throw error;
    }
  }

  /**
   * Inicia heartbeat para manter conexão ativa
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.performHeartbeat();
      } catch (error) {
        errorMonitor.recordError(error, {
          type: 'heartbeat_failed',
        });
      }
    }, 30000); // A cada 30 segundos
  }

  /**
   * Executa heartbeat
   */
  async performHeartbeat() {
    try {
      // Consulta simples para manter conexão ativa
      const { error } = await this.client.from('profiles').select('id').limit(1);
      if (error && error?.status !== 406) {
        throw error;
      }
    } catch (error) {
      // Heartbeat falhou - tentar reconectar
      if (this.state === CONNECTION_STATES.CONNECTED) {
        this.handleConnectionError(error);
      }
    }
  }

  /**
   * Inicia monitoramento de conexão
   */
  startConnectionMonitoring() {
    this.connectionCheckInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, 60000); // Verificar a cada minuto
  }

  /**
   * Verifica saúde da conexão
   */
  async checkConnectionHealth() {
    try {
      const startTime = performance.now();

      // Teste rápido de conectividade (evitar single para não forçar linha)
      const { error } = await this.client
        .from('profiles')
        .select('id')
        .limit(1);

      const duration = performance.now() - startTime;

      // Se erro mas duração baixa, pode ser problema de dados, não conexão
      if (error && error?.status !== 406 && duration < 1000) {
        // Ignorar erros de "não encontrado" que são esperados
        if (!error.message?.includes('No rows found')) {
          this.handleConnectionError(error);
        }
      }

      // Registrar métrica de saúde
      if (duration > 5000) {
        errorMonitor.recordError(new Error(`Connection health check slow: ${duration}ms`), {
          type: 'connection_performance',
          duration,
        });
      }

    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  /**
   * Trata erros de conexão
   */
  async handleConnectionError(error) {
    if (this.state === CONNECTION_STATES.RECONNECTING) {
      return; // Já reconectando
    }

    this.state = CONNECTION_STATES.ERROR;

    errorMonitor.recordError(error, {
      type: 'connection_error',
      state: this.state,
      attempt: this.reconnectAttempts,
    });

    // Tentar reconectar
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      await this.reconnect();
    } else {
      this.state = CONNECTION_STATES.DISCONNECTED;
      console.error('❌ Max reconnection attempts reached');
    }
  }

  /**
   * Reconecta ao Supabase
   */
  async reconnect() {
    this.state = CONNECTION_STATES.RECONNECTING;
    this.reconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    // console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(async () => {
      try {
        await this.testConnection();

        this.state = CONNECTION_STATES.CONNECTED;
        this.reconnectAttempts = 0;

        // console.log('✅ Reconnected to Supabase successfully');

      } catch (error) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          await this.reconnect();
        } else {
          this.state = CONNECTION_STATES.DISCONNECTED;
        }
      }
    }, delay);
  }

  /**
   * Eventos de autenticação
   */
  onSignedIn(session) {
    // console.log('🔐 User signed in');
    // Atualizar métricas de performance
  }

  onSignedOut() {
    // console.log('🚪 User signed out');
    // Limpar caches locais
  }

  onTokenRefreshed(session) {
    // console.log('🔄 Token refreshed');
    // Atualizar métricas
  }

  onUserUpdated(session) {
    // console.log('👤 User updated');
  }

  onRealtimeConnected() {
    // console.log('📡 Realtime connected');
  }

  onRealtimeDisconnected() {
    // console.log('📡 Realtime disconnected');
  }

  /**
   * Obtém cliente principal
   */
  getClient() {
    if (!this.client) {
      throw new Error('Supabase client not initialized');
    }
    return this.client;
  }

  /**
   * Obtém cliente administrativo
   */
  getAdminClient() {
    if (!this.adminClient) {
      // Avoid noisy warnings in production. Service role key should never be exposed client-side.
      if (import.meta.env.MODE !== 'production') {
        console.warn('⚠️ Admin client not available - service role key not configured');
      }
      return null;
    }
    return this.adminClient;
  }

  /**
   * Obtém estado atual da conexão
   */
  getConnectionState() {
    return {
      state: this.state,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      timestamp: Date.now(),
    };
  }

  /**
   * Força desconexão
   */
  async disconnect() {
    this.state = CONNECTION_STATES.DISCONNECTED;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }

    // console.log('🔌 Disconnected from Supabase');
  }

  /**
   * Obtém métricas de conexão
   */
  getConnectionMetrics() {
    return {
      state: this.state,
      uptime: this.state === CONNECTION_STATES.CONNECTED ?
        Date.now() - (this.connectedAt || Date.now()) : 0,
      reconnectAttempts: this.reconnectAttempts,
      lastError: this.lastError,
      heartbeatInterval: 30000,
      connectionCheckInterval: 60000,
    };
  }
}

// Instância singleton
let connectionManager = null;

export function getSupabaseConnectionManager() {
  if (!connectionManager) {
    connectionManager = new SupabaseConnectionManager();
  }
  return connectionManager;
}

// Cliente principal com conexão gerenciada
export const supabase = (() => {
  try {
    const manager = getSupabaseConnectionManager();
    return manager.getClient();
  } catch (error) {
    errorMonitor.recordError(error, {
      type: 'supabase_client_creation',
      critical: true,
    });
    throw error;
  }
})();

// Cliente administrativo
export const adminSupabase = (() => {
  try {
    const manager = getSupabaseConnectionManager();
    return manager.getAdminClient();
  } catch (error) {
    console.warn('Admin Supabase client not available:', error.message);
    return null;
  }
})();

// Funções utilitárias
export const checkConnection = async () => {
  const manager = getSupabaseConnectionManager();
  return manager.getConnectionState();
};

export const getConnectionMetrics = () => {
  const manager = getSupabaseConnectionManager();
  return manager.getConnectionMetrics();
};

export const forceReconnect = async () => {
  const manager = getSupabaseConnectionManager();
  await manager.reconnect();
};

export const disconnectSupabase = async () => {
  const manager = getSupabaseConnectionManager();
  await manager.disconnect();
};

export default supabase;
