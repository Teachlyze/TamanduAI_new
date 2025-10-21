import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  FileText, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Clock, 
  Users, 
  BookOpen,
  CheckCircle,
  Circle,
  Type,
  AlignLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const CreateActivityPageEnhanced = () => {
  const { user, loading: authLoading } = useAuth();
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxGrade: 100,
    type: 'assignment',
    isPublished: false,
    selectedClasses: classId ? [classId] : [],
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple_choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1
  });

  useEffect(() => {
    if (!authLoading && user) {
      loadClasses();
    }
  }, [authLoading, user]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, subject')
        .eq('created_by', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      toast.error('Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClassToggle = (classId) => {
    setFormData(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter(id => id !== classId)
        : [...prev.selectedClasses, classId]
    }));
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error('Digite a pergunta');
      return;
    }

    if (currentQuestion.type === 'multiple_choice' && currentQuestion.options.some(opt => !opt.trim())) {
      toast.error('Preencha todas as opções');
      return;
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion, id: Date.now() }]
    }));

    setCurrentQuestion({
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1
    });
  };

  const removeQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (formData.selectedClasses.length === 0) {
      toast.error('Selecione pelo menos uma turma');
      return;
    }

    setSaving(true);
    try {
      // Criar atividade
      const { data: activity, error: activityError } = await supabase
        .from('activities')
        .insert({
          title: formData.title,
          description: formData.description,
          content: {
            instructions: formData.instructions,
            questions: formData.questions
          },
          type: formData.type,
          max_grade: formData.maxGrade,
          due_date: formData.dueDate || null,
          created_by: user.id,
          is_published: formData.isPublished
        })
        .select()
        .single();

      if (activityError) throw activityError;

      // Associar às turmas
      const assignments = formData.selectedClasses.map(classId => ({
        activity_id: activity.id,
        class_id: classId
      }));

      const { error: assignmentError } = await supabase
        .from('activity_class_assignments')
        .insert(assignments);

      if (assignmentError) throw assignmentError;

      toast.success('Atividade criada com sucesso!');
      navigate('/dashboard/activities');
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      toast.error('Erro ao criar atividade');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando turmas..." />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <PremiumButton
            variant="outline"
            size="sm"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/dashboard/activities')}
          >
            Voltar
          </PremiumButton>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nova Atividade
            </h1>
            <p className="text-muted-foreground">Crie uma nova atividade para seus alunos</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <PremiumButton
            variant="outline"
            leftIcon={X}
            onClick={() => navigate('/dashboard/activities')}
          >
            Cancelar
          </PremiumButton>
          <PremiumButton
            leftIcon={Save}
            onClick={handleSave}
            loading={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Criar Atividade
          </PremiumButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PremiumCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Informações Básicas</h2>
                  <p className="text-muted-foreground">Configure os detalhes principais da atividade</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Título da Atividade *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Exercícios de Matemática - Capítulo 5"
                    className="w-full bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Tipo de Atividade
                  </label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Tarefa</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="project">Projeto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Descrição
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descreva brevemente o objetivo da atividade..."
                    className="w-full min-h-[100px] bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Instruções Detalhadas
                  </label>
                  <Textarea
                    value={formData.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    placeholder="Instruções detalhadas para os alunos..."
                    className="w-full min-h-[120px] bg-background text-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Data de Entrega
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className="w-full bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Pontuação Máxima
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.maxGrade}
                      onChange={(e) => handleInputChange('maxGrade', parseInt(e.target.value) || 100)}
                      className="w-full bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-foreground">Publicar Imediatamente</label>
                    <p className="text-xs text-muted-foreground">A atividade ficará visível para os alunos</p>
                  </div>
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                  />
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          {/* Questões (apenas para Quiz) */}
          {formData.type === 'quiz' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PremiumCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Questões do Quiz</h2>
                    <p className="text-muted-foreground">Adicione questões para o quiz</p>
                  </div>
                </div>

                {/* Lista de Questões */}
                {formData.questions.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {formData.questions.map((question, index) => (
                      <div key={question.id} className="p-4 border border-border rounded-lg bg-muted/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {index + 1}. {question.question}
                            </p>
                            {question.type === 'multiple_choice' && (
                              <div className="mt-2 space-y-1">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    {optIndex === question.correctAnswer ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm text-foreground">{option}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <Badge variant="secondary" className="mt-2">
                              {question.points} ponto{question.points !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <PremiumButton
                            variant="outline"
                            size="sm"
                            leftIcon={Trash2}
                            onClick={() => removeQuestion(question.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Remover
                          </PremiumButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Adicionar Nova Questão */}
                <div className="space-y-4 p-4 border border-dashed border-border rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Tipo de Questão
                    </label>
                    <Select 
                      value={currentQuestion.type} 
                      onValueChange={(value) => handleQuestionChange('type', value)}
                    >
                      <SelectTrigger className="bg-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                        <SelectItem value="open">Questão Aberta</SelectItem>
                        <SelectItem value="true_false">Verdadeiro/Falso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Pergunta
                    </label>
                    <Textarea
                      value={currentQuestion.question}
                      onChange={(e) => handleQuestionChange('question', e.target.value)}
                      placeholder="Digite a pergunta..."
                      className="w-full bg-background text-foreground"
                    />
                  </div>

                  {currentQuestion.type === 'multiple_choice' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Opções de Resposta
                      </label>
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={currentQuestion.correctAnswer === index}
                              onChange={() => handleQuestionChange('correctAnswer', index)}
                              className="text-blue-600"
                            />
                            <Input
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Opção ${index + 1}`}
                              className="flex-1 bg-background text-foreground"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Selecione a opção correta marcando o círculo
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Pontos
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={currentQuestion.points}
                        onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 1)}
                        className="w-20 bg-background text-foreground"
                      />
                    </div>
                    <PremiumButton
                      leftIcon={Plus}
                      onClick={addQuestion}
                      className="bg-gradient-to-r from-green-500 to-teal-500"
                    >
                      Adicionar Questão
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Turmas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PremiumCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-foreground">Turmas</h3>
              </div>
              
              {classes.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma turma encontrada</p>
              ) : (
                <div className="space-y-2">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.selectedClasses.includes(cls.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-border hover:border-blue-300'
                      }`}
                      onClick={() => handleClassToggle(cls.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{cls.name}</p>
                          <p className="text-xs text-muted-foreground">{cls.subject}</p>
                        </div>
                        {formData.selectedClasses.includes(cls.id) && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PremiumCard>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PremiumCard className="p-6">
              <h3 className="font-bold mb-4 text-foreground">Preview</h3>
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <h4 className="font-bold text-lg mb-2 text-foreground">
                  {formData.title || 'Título da Atividade'}
                </h4>
                {formData.description && (
                  <p className="text-muted-foreground mb-3">{formData.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formData.dueDate ? new Date(formData.dueDate).toLocaleString('pt-BR') : 'Sem prazo'}
                  </span>
                  <span>🎯 {formData.maxGrade} pts</span>
                </div>
                {formData.questions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      {formData.questions.length} questão{formData.questions.length !== 1 ? 'ões' : ''}
                    </p>
                  </div>
                )}
              </div>
            </PremiumCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityPageEnhanced;
