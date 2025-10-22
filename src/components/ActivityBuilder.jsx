import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Eye, Loader2 } from 'lucide-react';

// Função para determinar o tipo de pergunta com base no schema
  const getQuestionTypeFromSchema = (prop) => {
  if (prop.format === 'date') return 'date';
  if (prop.format === 'textarea') return 'textarea';
  if (prop.type === 'number') return 'number';
  if (prop.type === 'boolean') return 'boolean';
  if (prop.enum) return 'select';
  if (prop.type === 'array' && prop.items?.enum) return 'checkboxes';
  return 'string'; // padrão
};

const QUESTION_TYPES = [
  { value: 'string', label: 'Texto Curto' },
  { value: 'textarea', label: 'Parágrafo' },
  { value: 'select', label: 'Múltipla Escolha' },
  { value: 'checkboxes', label: 'Checkbox' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
];

const ActivityBuilder = ({ activityId, initialData, onActivityCreated }) => {
  const { toast } = useToast();
  // Inicializa o estado com os dados iniciais se for uma edição
  const [title, setTitle] = useState(initialData?.schema?.title || '');
  const [questions, setQuestions] = useState(
    initialData?.schema?.properties 
      ? Object.entries(initialData.schema.properties).map(([key, prop], index) => ({
          id: index + 1,
          type: getQuestionTypeFromSchema(prop),
          question: prop.title || '',
          required: initialData.schema.required?.includes(key) || false,
          options: prop.enum || (prop.items?.enum || [])
        }))
      : [{ id: 1, type: 'string', question: '', options: [] }]
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDraft, setIsDraft] = useState(true);
  const [isLoading, setIsLoading] = useState(!!activityId && !initialData);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  
  // Função para salvar a atividade
  const saveActivity = async (isFinal = false) => {
    // Evitar múltiplas submissões simultâneas
    if (isSubmitting || isSaving) {
      // console.log('Save already in progress, skipping...');
      return null;
    }
    
    try {
      // console.log('Starting save operation...');
      setIsSaving(true);
      
      // Usa schema/uiSchema memoizados declarados abaixo via useMemo
      const user = supabase.auth.user();
      
      if (!user) {
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }
      
      // console.log('Preparing activity data...');
      const activityData = {
        title: (schema && schema.title) || 'Sem título',
        description: '',
        schema: schema || {},
        created_by: user.id,
        is_draft: isFinal ? false : isDraft,
        status: isFinal ? 'published' : 'draft',
        draft_saved_at: isFinal ? null : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // console.log('Saving activity data:', activityData);
      let result;
      
      try {
        if (activityId) {
          // console.log('Updating existing activity:', activityId);
          const { data, error } = await supabase
            .from('activities')
            .update(activityData)
            .eq('id', activityId)
            .select()
            .single();
            
          if (error) {
            console.error('Error updating activity:', error);
            throw error;
          }
          result = data;
          // console.log('Activity updated successfully:', result);
        } else {
          // console.log('Creating new activity');
          const { data, error } = await supabase
            .from('activities')
            .insert([activityData])
            .select()
            .single();
            
          if (error) {
            console.error('Error creating activity:', error);
            throw error;
          }
          result = data;
          // console.log('Activity created successfully:', result);
          
          // Atualiza a URL se for uma nova atividade
          if (result?.id) {
            // console.log('Updating URL with new activity ID:', result.id);
            window.history.replaceState({}, '', `/dashboard/atividade/editar/${result.id}`);
          }
        }
        
        // Atualiza o estado com a data do último salvamento
        setLastSaved(new Date());
        
        // Feedback para o usuário
        toast({
          title: isFinal ? 'Atividade publicada!' : 'Rascunho salvo',
          description: isFinal 
            ? 'Sua atividade foi publicada com sucesso.' 
            : 'Suas alterações foram salvas automaticamente.',
          variant: 'default',
        });
        
        // Se for um salvamento final, atualiza o estado e grava atribuições de turma
        if (isFinal) {
          setIsDraft(false);
          try {
            if (result?.id) {
              // Clean previous assignments
              await supabase.from('activity_class_assignments').delete().eq('activity_id', result.id);
              // Insert selected ones
              if (selectedClassIds.length > 0) {
                const rows = selectedClassIds.map(cid => ({ activity_id: result.id, class_id: cid, assigned_at: new Date().toISOString() }));
                await supabase.from('activity_class_assignments').insert(rows);
              }
            }
          } catch (assignErr) {
            console.warn('Failed to save class assignments:', assignErr);
          }
        }
        
        // console.log('Save operation completed successfully');
        return result;
        
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        throw new Error(dbError.message || 'Falha ao salvar no banco de dados');
      }
      
    } catch (error) {
      console.error('Error in saveActivity:', error);
      
      // Mostra mensagem de erro para o usuário
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Ocorreu um erro ao salvar a atividade. Por favor, tente novamente.',
        variant: 'destructive',
      });
      
      // Relança o erro para ser tratado pelo chamador, se necessário
      throw error;
      
    } finally {
      // console.log('Cleaning up save operation...');
      // Garante que o estado de salvamento seja sempre limpo, mesmo em caso de erro
      setIsSaving(false);
      setIsSubmitting(false);
    }
  };

  // Ref to call latest saveActivity without adding it to deps
  const saveActivityRef = useRef(saveActivity);
  useEffect(() => { saveActivityRef.current = saveActivity; }, []); // TODO: Add dependencies

  // Função para agendar o salvamento automático (no unnecessary deps)
  const scheduleSave = useCallback((isFinal = false) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    const timeout = setTimeout(() => {
      if (saveActivityRef.current) {
        saveActivityRef.current(isFinal);
      }
    }, isFinal ? 0 : 2000);
    setAutoSaveTimeout(timeout);
  return () => clearTimeout(timeout);
  }, [autoSaveTimeout]);

  // Efeito para limpar o timeout ao desmontar
  useEffect(() => {
  return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Carrega a atividade existente se um ID for fornecido e não houver initialData
  useEffect(() => {
    let isMounted = true;
    
    const loadActivity = async () => {
      if (!activityId) {
        // console.log('No activityId provided, skipping load');
        if (isMounted) setIsLoading(false);
        return;
      }
      
      // Se já temos os dados iniciais, não precisamos carregar novamente
      if (initialData) {
        // console.log('Using provided initialData, skipping load');
        if (isMounted) setIsLoading(false);
        return;
      }
      
      // console.log(`Loading activity with ID: ${activityId}`);
      
      try {
        if (isMounted) setIsLoading(true);
        
        // Adiciona um timeout para evitar carregamento infinito
        const timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('Activity loading is taking too long, forcing completion');
            setIsLoading(false);
          }
        }, 10000); // 10 segundos de timeout
        
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('id', activityId)
          .single();
          
        // Limpa o timeout se a requisição completar a tempo
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Error loading activity:', error);
          throw error;
        }
        
        if (!data) {
          console.warn('No data received for activity ID:', activityId);
          if (isMounted) setIsLoading(false);
          return;
        }
        
        // console.log('Activity data loaded:', data);
        
        if (!isMounted) {
          // console.log('Component unmounted before setting state');
          return;
        }
        
        try {
          // Tenta fazer o parse do schema e ui_schema
          const parsedSchema = typeof data.schema === 'string' 
            ? JSON.parse(data.schema) 
            : (data.schema || { title: 'Nova Atividade', type: 'object', properties: {} });
            
          // ui_schema não é usado diretamente aqui
          /* const parsedUiSchema = typeof data.ui_schema === 'string' 
            ? JSON.parse(data.ui_schema) 
            : (data.ui_schema || {}); */
          
          // console.log('Parsed schema:', parsedSchema);
          
          // Atualiza o estado com os dados carregados
          setTitle(parsedSchema.title || '');
          setIsDraft(!!data.is_draft);
          
          // Converte o schema de volta para o formato de perguntas
          let questionsFromSchema = [];
          
          if (parsedSchema.properties && Object.keys(parsedSchema.properties).length > 0) {
            questionsFromSchema = Object.entries(parsedSchema.properties).map(([key, prop], index) => {
              const questionType = getQuestionTypeFromSchema(prop);
              return {
                id: `q-${Date.now()}-${index}`, // ID único para cada pergunta
                type: questionType,
                question: prop.title || `Pergunta ${index + 1}`,
                required: Array.isArray(parsedSchema.required) 
                  ? parsedSchema.required.includes(key) 
                  : false,
                options: Array.isArray(prop.enum) 
                  ? [...prop.enum] 
                  : (Array.isArray(prop.items?.enum) ? [...prop.items.enum] : [])
              };
            });
          }
          
          // Garante que sempre haja pelo menos uma pergunta
          if (questionsFromSchema.length === 0) {
            questionsFromSchema = [{ 
              id: `q-${Date.now()}-0`, 
              type: 'string', 
              question: '', 
              options: [] 
            }];
          }
          
          // console.log('Setting questions from schema:', questionsFromSchema);
          setQuestions(questionsFromSchema);
          
        } catch (parseError) {
          console.error('Error parsing activity data:', parseError);
          throw new Error('Erro ao processar os dados da atividade. O formato pode estar incorreto.');
        }
        
      } catch (error) {
        console.error('Error in loadActivity:', error);
        
        // Mensagem de erro mais amigável
        let errorMessage = 'Não foi possível carregar os dados da atividade.';
        if (error.message.includes('permission_denied')) {
          errorMessage = 'Você não tem permissão para visualizar esta atividade.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: 'Erro ao carregar',
          description: errorMessage,
          variant: 'destructive',
        });
        
        // Redireciona de volta para a lista de atividades em caso de erro
        setTimeout(() => {
          if (isMounted && !window.location.pathname.endsWith('/novo')) {
            navigate('/activities');
          }
        }, 2000);
        
      } finally {
        if (isMounted) {
          // console.log('Loading complete, setting isLoading to false');
          setIsLoading(false);
        }
      }
    };
    
    loadActivity();
  return () => {
      isMounted = false;
    };
  }, [activityId, initialData, toast, navigate]);
  // Carrega turmas para atribuição
  useEffect(() => {
    let isMounted = true;
    const loadClasses = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData?.user?.id;
        if (!uid) return;
        const [{ data: memberRows, error: mErr }, { data: ownedRows, error: oErr }] = await Promise.all([
          supabase.from('class_members').select('class_id, role').eq('user_id', uid),
          supabase.from('classes').select('id').eq('created_by', uid)
        ]);
        if (mErr) throw mErr;
        if (oErr) throw oErr;
        const classIds = new Set([...(memberRows?.map(r => r.class_id) || []), ...(ownedRows?.map(r => r.id) || [])]);
        if (classIds.size === 0) {
          if (isMounted) setAvailableClasses([]);
          return;
        }
        const { data: classes, error } = await supabase
          .from('classes')
          .select('id, name, color')
          .in('id', Array.from(classIds));
        if (error) throw error;
        if (isMounted) setAvailableClasses(classes || []);

        // If editing, pre-load current assignments
        if (activityId) {
          const { data: assigns } = await supabase
            .from('activity_class_assignments')
            .select('class_id')
            .eq('activity_id', activityId);
          if (assigns && isMounted) setSelectedClassIds(assigns.map(a => a.class_id));
        }
      } catch (e) {
        console.warn('Failed to load classes for assignment', e);
      }
    };
    loadClasses();
  return () => { isMounted = false; };
  }, [activityId]);

  // Atualiza o estado e agenda salvamento
  const updateStateAndSave = (updater) => {
    // Atualiza o estado
    const newState = updater();
    
    // Agenda salvamento automático
    scheduleSave();
    
    return newState;
  };

  const addQuestion = () => {
    setQuestions([...questions, { 
      id: questions.length + 1, 
      type: 'string', 
      question: '',
      options: [] 
    }]);
  };

  const updateQuestion = (id, field, value) => {
    updateStateAndSave(() => {
      const newQuestions = questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      );
      setQuestions(newQuestions);
      return newQuestions;
    });
  };

  const addOption = (questionId) => {
    updateStateAndSave(() => {
      const newQuestions = questions.map(q => 
        q.id === questionId 
          ? { ...q, options: [...q.options, ''] } 
          : q
      );
      setQuestions(newQuestions);
      return newQuestions;
    });
  };

  const updateOption = (questionId, optionIndex, value) => {
    updateStateAndSave(() => {
      const newQuestions = questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      });
      setQuestions(newQuestions);
      return newQuestions;
    });
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      updateStateAndSave(() => {
        const newQuestions = questions.filter(q => q.id !== id);
        setQuestions(newQuestions);
        return newQuestions;
      });
    }
  };

  const updateQuestionOption = (questionId, optionIndex, value) => {
    updateStateAndSave(() => {
      const newQuestions = questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      });
      setQuestions(newQuestions);
      return newQuestions;
    });
  };

  const addQuestionOption = (questionId) => {
    updateStateAndSave(() => {
      const newQuestions = questions.map(q => 
        q.id === questionId 
          ? { ...q, options: [...q.options, ''] } 
          : q
      );
      setQuestions(newQuestions);
      return newQuestions;
    });
  };

  const removeQuestionOption = (questionId, optionIndex) => {
    updateStateAndSave(() => {
      const newQuestions = questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions.splice(optionIndex, 1);
          return { ...q, options: newOptions };
        }
        return q;
      });
      setQuestions(newQuestions);
      return newQuestions;
    });
  };

  // Gera o schema a partir das perguntas com memoização para melhor performance
  const { schema, uiSchema } = useMemo(() => {
    const properties = {};
    const required = [];
    const uiSchema = {};
    
    // Processa cada pergunta uma única vez
    questions.forEach((q, index) => {
      const fieldName = `question_${index + 1}`;
      const fieldType = {
        'textarea': 'string',
        'string': 'string',
        'number': 'number',
        'date': 'string',
        'select': 'string',
        'checkboxes': 'array'
      }[q.type] || 'string';
      
      const field = { title: q.question, type: fieldType };
      
      // Configurações específicas por tipo de campo
      if (q.type === 'textarea') {
        field.format = 'textarea';
      } else if (q.type === 'date') {
        field.format = 'date';
      } else if (q.type === 'select' || q.type === 'checkboxes') {
        if (q.type === 'select') {
          field.enum = q.options;
        } else {
          field.items = { type: 'string', enum: q.options };
          field.uniqueItems = true;
        }
      }
      
      properties[fieldName] = field;
      if (q.required) required.push(fieldName);
      
      // Configuração do UI Schema em paralelo
      const widgetMap = {
        'textarea': 'textarea',
        'date': 'date',
        'select': 'select',
        'checkboxes': 'checkboxes'
      };
      
      uiSchema[fieldName] = {
        'ui:widget': widgetMap[q.type],
        'ui:options': (q.type === 'select' || q.type === 'checkboxes') ? {
          enumOptions: q.options.map(option => ({ label: option, value: option }))
        } : undefined
      };
    });
    
    return {
      schema: {
        title: title.trim() || 'Nova Atividade',
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined
      },
      uiSchema
    };
  }, [questions, title]);

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const navigate = useNavigate();

  // Validação do formulário
  const validateForm = useCallback(() => {
    const errors = [];
    
    if (!title.trim()) {
      errors.push('Por favor, insira um título para a atividade.');
    }
    
    // Validação das perguntas
    questions.forEach((q, index) => {
      if (!q.question.trim()) {
        errors.push(`A pergunta #${index + 1} está vazia.`);
      }
      
      if ((q.type === 'select' || q.type === 'checkboxes') && q.options.length < 2) {
        errors.push(`A pergunta "${q.question || `#${index + 1}`}" precisa de pelo menos 2 opções.`);
      }
      
      if ((q.type === 'select' || q.type === 'checkboxes') && q.options.some(opt => !opt.trim())) {
        errors.push(`A pergunta "${q.question || `#${index + 1}`}" tem opções vazias.`);
      }
    });
    
    return errors;
  }, [title, questions]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Evitar múltiplas submissões simultâneas
    if (isSubmitting) {
      // console.log('Submit already in progress, skipping...');
      return;
    }
    
    // Validação do formulário
    const errors = validateForm();
    if (errors.length > 0) {
      // console.log('Form validation failed with errors:', errors);
      toast({
        title: 'Erro de validação',
        description: (
          <div className="space-y-1">
            {errors.map((error, i) => (
              <div key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{error}</span>
              </div>
            ))}
          </div>
        ),
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // console.log('Starting form submission...');
      setIsSubmitting(true);
      
      // Salva a atividade como final (não rascunho)
      // console.log('Calling saveActivity with isFinal=true');
      const result = await saveActivity(true);
      
      if (!result || !result.id) {
        throw new Error('A resposta do servidor está incompleta. Por favor, tente novamente.');
      }
      
      // console.log('Activity saved successfully, result:', result);
      
      // Feedback de sucesso
      toast({
        title: 'Sucesso!',
        description: 'Atividade salva com sucesso.',
        variant: 'default',
      });
      
      // Redireciona após um pequeno atraso para o usuário ver a mensagem
      // console.log('Preparing to redirect after save...');
      setTimeout(() => {
        try {
          if (onActivityCreated) {
            // console.log('Calling onActivityCreated with ID:', result.id);
            onActivityCreated(result.id);
          } else {
            // console.log('Navigating to /activities');
            navigate('/activities');
          }
        } catch (navError) {
          console.error('Error during navigation:', navError);
          // Se houver erro na navegação, recarrega a página para garantir consistência
          window.location.href = '/activities';
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      
      // Tratamento de erros mais robusto
      let errorMessage = 'Ocorreu um erro ao salvar a atividade. Por favor, tente novamente.';
      
      if (error.message) {
        if (error.message.includes('network')) {
          errorMessage = 'Erro de conexão. Verifique sua conexão com a internet e tente novamente.';
        } else if (error.message.includes('permission_denied')) {
          errorMessage = 'Você não tem permissão para realizar esta ação.';
        } else if (error.message.includes('violates not-null constraint')) {
          errorMessage = 'Erro de configuração do banco de dados. A atividade precisa estar associada a uma turma ou o sistema precisa ser atualizado.';
        } else if (error.message.includes('Já existe')) {
          errorMessage = error.message;
        } else if (error.message.includes('timeout')) {
          errorMessage = 'A operação demorou muito para ser concluída. Verifique sua conexão e tente novamente.';
        } else if (error.message.includes('Unknown network error')) {
          errorMessage = 'Erro de conexão com o servidor. Verifique sua internet e tente novamente em alguns instantes.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Erro ao salvar',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Relança o erro para ser capturado por qualquer tratamento de erro global
      throw error;
      
    } finally {
      // console.log('Cleaning up submit state...');
      // Não precisamos mais limpar o estado de submissão aqui,
      // pois já é feito no saveActivity
    }
  };

  if (isLoading) {
  return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Carregando atividade...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">
        {activityId ? 'Editar Atividade' : 'Criar Nova Atividade'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status de salvamento */}
        <div className="flex justify-end items-center mb-2">
          {isSaving ? (
            <p className="text-sm text-muted-foreground flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Salvando...
            </p>
          ) : lastSaved ? (
            <p className="text-sm text-muted-foreground">
              Último salvamento: {new Date(lastSaved).toLocaleTimeString()}
            </p>
          ) : null}
        </div>

        {/* Título da Atividade */}
        <div className="space-y-2">
          <Label htmlFor="activity-title">Título da Atividade</Label>
          <Input
            id="activity-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título da atividade"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Atribuição para Turmas */}
        <div className="space-y-2">
          <Label>Distribuir para turmas</Label>
          {availableClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Você ainda não participa de nenhuma turma.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableClasses.map(c => {
                const checked = selectedClassIds.includes(c.id);
  return (
                  <label key={c.id} className="flex items-center gap-2 border rounded-md p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedClassIds(prev => e.target.checked ? [...prev, c.id] : prev.filter(id => id !== c.id));
                        scheduleSave();
                      }}
                      disabled={isSubmitting}
                    />
                    <span className="truncate">{c.name}</span>
                    {c.color ? <span className="ml-auto h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} /> : null}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Lista de Perguntas */}
        <div className="space-y-4">
          {questions.map((q, index) => (
            <Card key={q.id} className="p-4">
              <CardHeader className="p-0 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Pergunta {index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(q.id)}
                    disabled={isSubmitting || questions.length === 1}
                    className="text-destructive hover:bg-destructive/10 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remover pergunta</span>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 space-y-4">
                {/* Tipo de Pergunta */}
                <div className="space-y-2">
                  <Label htmlFor={`question-type-${q.id}`}>Tipo de Pergunta</Label>
                  <Select
                    value={q.type}
                    onValueChange={(value) => updateQuestion(q.id, 'type', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id={`question-type-${q.id}`}>
                      <SelectValue placeholder="Selecione o tipo de pergunta" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Texto da Pergunta */}
                <div className="space-y-2">
                  <Label htmlFor={`question-${q.id}`}>Pergunta</Label>
                  <Input
                    id={`question-${q.id}`}
                    value={q.question}
                    onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                    placeholder="Digite o enunciado da pergunta"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Opções (para select/checkboxes) */}
                {(q.type === 'select' || q.type === 'checkboxes') && (
                  <div className="space-y-2">
                    <Label>Opções</Label>
                    <div className="space-y-2">
                      {q.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(q.id, idx, e.target.value)}
                            placeholder={`Opção ${idx + 1}`}
                            disabled={isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => removeQuestionOption(q.id, idx)}
                            disabled={isSubmitting}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addOption(q.id)}
                        disabled={isSubmitting}
                      >
                        Adicionar opção
                      </Button>
                    </div>
                  </div>
                )}

                {/* Obrigatória */}
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    id={`required-${q.id}`}
                    checked={!!q.required}
                    onCheckedChange={(val) => updateQuestion(q.id, 'required', !!val)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor={`required-${q.id}`}>Resposta obrigatória</Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-4">
          <Button type="button" variant="outline" onClick={() => addQuestion()} disabled={isSubmitting}>
            <Plus className="w-4 h-4 mr-2" /> Adicionar pergunta
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={handlePreview} disabled={isSubmitting}>
              <Eye className="w-4 h-4 mr-2" /> Preview
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Publicar atividade'}
            </Button>
          </div>
        </div>
      </form>
      
      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Preview do Formulário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">
              Visualização do formulário que será exibido aos alunos.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setPreviewOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityBuilder;
