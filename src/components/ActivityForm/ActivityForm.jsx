import { useCallback, useEffect, useState } from 'react';
import Editor from '@/components/editor/LexicalEditor';
import { useForm } from 'react-hook-form';
import { $getRoot } from 'lexical';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { UploadCloud, Plus, Save, ArrowLeft, FileText, CheckCircle2, AlertCircle, Loader2, Wifi, WifiOff, CheckCircle } from 'lucide-react';
import QuestionBuilder from './QuestionBuilder';

// Schema for form validation
  const activitySchema = z.object({
  title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  instructions: z.string().optional(),
  dueDate: z.string().refine(val => !val || new Date(val) > new Date(), {
    message: 'A data de entrega deve ser futura',
  }),
  points: z.number().min(0, 'A pontuação deve ser um número positivo'),
  questions: z.array(z.object({
    title: z.string().min(1, 'O enunciado da pergunta é obrigatório'),
    type: z.string().min(1, 'O tipo da pergunta é obrigatório'),
    required: z.boolean().default(true),
    helpText: z.string().optional(),
    options: z.array(z.string()).optional(),
  })).optional(),
});

const QUESTION_TYPES = [
  { value: 'text', label: 'Resposta Curta', icon: FileText },
  { value: 'paragraph', label: 'Parágrafo', icon: FileText },
  { value: 'multiple_choice', label: 'Múltipla Escolha', icon: FileText },
  { value: 'checkbox', label: 'Caixas de Seleção', icon: FileText },
  { value: 'dropdown', label: 'Lista Suspensa', icon: FileText },
  { value: 'code', label: 'Código', icon: FileText },
  { value: 'image', label: 'Upload de Imagem', icon: UploadCloud },
];

const ActivityForm = ({ initialData, onSubmit, isSubmitting = false }) => {
  const { toast } = useToast();
  const { goBack } = useAppNavigation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [questions, setQuestions] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionStatus('online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (navigator.onLine) {
      setConnectionStatus('online');
    } else {
      setConnectionStatus('offline');
    }

    if (loading) return <LoadingScreen />;

  return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: '',
      description: '',
      instructions: '',
      dueDate: '',
      points: 10,
      questions: [],
      ...initialData,
    },
  });

  // Update questions in form state
  useEffect(() => {
    setValue('questions', questions);
  }, [questions, setValue]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (data) => {
    try {
      setShowSuccess(true);

      // Validate that we have at least a title and description
      if (!data.title?.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!data.description?.trim()) {
        throw new Error('Descrição é obrigatória');
      }

      await onSubmit(data);
    } catch (error) {
      setShowSuccess(false);
      console.error('[ActivityForm] Form submission error:', error);
      toast({
        title: '❌ Erro ao salvar atividade',
        description: error.message || 'Ocorreu um erro ao tentar salvar a atividade. Verifique os dados e tente novamente.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [onSubmit, toast]);

  // Handle image upload
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo não suportado',
        description: 'Por favor, envie uma imagem no formato JPG, PNG, GIF ou WebP.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > MAX_SIZE) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo permitido é 5MB.',
        variant: 'destructive',
      });
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setValue('image', { file, previewUrl });
  }, [setValue, toast]);

  // Question management
  const addQuestion = useCallback(() => {
    const newQuestion = {
      title: '',
      type: 'text',
      required: true,
      helpText: '',
      options: [],
    };
    setQuestions(prev => [...prev, newQuestion]);
  }, []);

  const updateQuestion = useCallback((index, updatedQuestion) => {
    setQuestions(prev => prev.map((q, i) => i === index ? updatedQuestion : q));
  }, []);

  const deleteQuestion = useCallback((index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Clean up preview URLs on unmount
  useEffect(() => {
    setIsMounted(true);
    if (loading) return <LoadingScreen />;

  return () => {
      const image = watch('image');
      if (image?.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
  }, [watch]);

  // Watch for image changes to handle cleanup
  const currentImage = watch('image');

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setQuestions(initialData.questions || []);
    }
  }, [initialData, reset]);

  if (!isMounted) {
    if (loading) return <LoadingScreen />;

  return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const progressPercentage = questions.length > 0 ? Math.min((questions.length / 10) * 100, 100) : 0;

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Connection Status Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg p-3 border ${
          connectionStatus === 'online'
            ? 'bg-green-50 border-green-200 text-green-800'
            : connectionStatus === 'offline'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {connectionStatus === 'online' ? (
            <Wifi className="w-4 h-4" />
          ) : connectionStatus === 'offline' ? (
            <WifiOff className="w-4 h-4" />
          ) : (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          <span className="text-sm font-medium">
            {connectionStatus === 'online'
              ? 'Conectado à internet'
              : connectionStatus === 'offline'
              ? 'Sem conexão com a internet'
              : 'Verificando conexão...'
            }
          </span>
          {!isOnline && (
            <span className="text-xs opacity-75">
              - As alterações serão salvas quando a conexão for restaurada
            </span>
          )}
        </div>
      </motion.div>

      {/* Progress Indicator */}
      {questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 shadow-sm border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progresso da Atividade
            </span>
            <span className="text-sm text-gray-500">
              {questions.length} pergunta{questions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </motion.div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 text-white hover:opacity-90">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Informações Básicas da Atividade
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Título da Atividade *
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Digite um título descritivo para sua atividade..."
                  className="bg-white dark:bg-slate-900 text-foreground text-base"
                  error={errors.title?.message}
                />
                {errors.title && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-500 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.title.message}
                  </motion.p>
                )}
              </div>

              {/* Description (Lexical) */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descrição *
                </Label>
                <div className="border rounded-md">
                  <Editor
                    initialValue={watch('description') || ''}
                    onChange={(editorState) => {
                      try {
                        editorState.read(() => {
                          const text = $getRoot().getTextContent();
                          setValue('description', text, { shouldValidate: true, shouldDirty: true });
                        });
                      } catch (e) {
                        console.warn('Lexical description onChange error:', e);
                      }
                    }}
                  />
                </div>
                {errors.description && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-500 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.description.message}
                  </motion.p>
                )}
              </div>

              {/* Instructions (Lexical) */}
              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-sm font-medium">
                  Instruções Detalhadas (opcional)
                </Label>
                <div className="border rounded-md">
                  <Editor
                    initialValue={watch('instructions') || ''}
                    onChange={(editorState) => {
                      try {
                        editorState.read(() => {
                          const text = $getRoot().getTextContent();
                          setValue('instructions', text, { shouldValidate: true, shouldDirty: true });
                        });
                      } catch (e) {
                        console.warn('Lexical instructions onChange error:', e);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Due Date and Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium">
                    Data de Entrega
                  </Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    {...register('dueDate')}
                    min={new Date().toISOString().slice(0, 16)}
                    error={errors.dueDate?.message}
                  />
                  {errors.dueDate && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.dueDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points" className="text-sm font-medium">
                    Pontuação Total
                  </Label>
                  <Input
                    id="points"
                    type="number"
                    min="0"
                    step="0.5"
                    {...register('points', { valueAsNumber: true })}
                    error={errors.points?.message}
                  />
                  {errors.points && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.points.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Imagem de Capa (opcional)</Label>
                {currentImage?.previewUrl ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative group"
                  >
                    <img
                      src={currentImage.previewUrl}
                      alt="Preview"
                      className="rounded-lg border border-gray-200 w-full max-h-64 object-cover shadow-sm"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={() => setValue('image', null)}
                    >
                      Remover
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500 text-center">
                          <span className="font-semibold">Clique para enviar</span> ou arraste uma imagem
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF até 5MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Questions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 text-white hover:opacity-90">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Perguntas da Atividade
                  {questions.length > 0 && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      {questions.length}
                    </span>
                  )}
                </CardTitle>
                <Button
                  type="button"
                  onClick={addQuestion}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:opacity-90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Pergunta
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {questions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma pergunta adicionada
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Comece adicionando perguntas para criar uma atividade interativa.
                  </p>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    variant="outline"
                    className="bg-white dark:bg-slate-900 text-foreground border-border bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 text-white hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Pergunta
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {questions.map((question, index) => (
                      <QuestionBuilder
                        key={index}
                        question={question}
                        index={index}
                        onUpdate={updateQuestion}
                        onDelete={deleteQuestion}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Form Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white rounded-lg p-6 shadow-sm border"
        >
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            className="bg-white dark:bg-slate-900 text-foreground border-border flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancelar
          </Button>

          <div className="flex items-center gap-4">
            {questions.length > 0 && (
              <span className="text-sm text-gray-500">
                {questions.length} pergunta{questions.length !== 1 ? 's' : ''} configurada{questions.length !== 1 ? 's' : ''}
              </span>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || showSuccess || !isOnline}
              className={`shadow-lg hover:shadow-xl transition-all duration-300 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : showSuccess
                    ? 'bg-green-500 hover:bg-green-600'
                    : !isOnline
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
              } text-white`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando atividade...</span>
                </div>
              ) : showSuccess ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Atividade salva!</span>
                </div>
              ) : !isOnline ? (
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4" />
                  <span>Sem conexão</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>Salvar Atividade</span>
                </div>
              )}
            </Button>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default ActivityForm;
