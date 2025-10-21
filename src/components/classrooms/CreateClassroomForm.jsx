import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import ClassService from '@/services/classService';
import schoolService from '@/services/schoolService';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  Clock,
  MapPin,
  Palette,
  Plus,
  X,
  Loader2,
  GraduationCap,
  School,
  AlertTriangle,
  CheckCircle,
  Video,
  Link as LinkIcon
} from 'lucide-react';

// Form validation schema
const classFormSchema = z.object({
  name: z.string().min(3, 'Nome da turma deve ter pelo menos 3 caracteres'),
  subject: z.string().min(2, 'Disciplina é obrigatória'),
  course: z.string().min(2, 'Curso é obrigatório'),
  description: z.string().optional(),
  academic_year: z.string().min(1, 'Ano letivo é obrigatório'),
  grade_level: z.string().min(1, 'Nível/Série é obrigatório'),
  student_capacity: z.number().min(1, 'Capacidade deve ser pelo menos 1').max(100, 'Capacidade máxima é 100'),
  grading_system: z.string().min(1, 'Selecione um sistema de notas'),
  color: z.string().min(1, 'Selecione uma cor'),
  room_number: z.string().optional(),
  address: z.string().optional(),
  is_online: z.boolean().default(false),
  meeting_link: z.string().optional(),
  meeting_days: z.array(z.string()).optional(),
  meeting_start_time: z.string().optional(),
  meeting_end_time: z.string().optional(),
  period: z.string().optional(),
  school_id: z.string().optional(),
  is_school_managed: z.boolean().default(false),
  // NEW: Datas de início e fim das aulas
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

const CreateClassroomForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [error, setError] = useState(null);
  const [affiliatedSchools, setAffiliatedSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  // NEW: Individual schedules per day  
  const [weeklySchedule, setWeeklySchedule] = useState({});

  // Available colors for class
  const classColors = [
    { name: 'Azul', value: 'blue', class: 'bg-blue-500' },
    { name: 'Verde', value: 'green', class: 'bg-green-500' },
    { name: 'Roxo', value: 'purple', class: 'bg-purple-500' },
    { name: 'Rosa', value: 'pink', class: 'bg-pink-500' },
    { name: 'Laranja', value: 'orange', class: 'bg-orange-500' },
    { name: 'Vermelho', value: 'red', class: 'bg-red-500' },
    { name: 'Amarelo', value: 'yellow', class: 'bg-yellow-500' },
    { name: 'Índigo', value: 'indigo', class: 'bg-indigo-500' },
  ];

  // Mock available students
  const availableStudents = [
    { id: 1, name: 'Ana Silva', email: 'ana@email.com' },
    { id: 2, name: 'João Santos', email: 'joao@email.com' },
    { id: 3, name: 'Maria Oliveira', email: 'maria@email.com' },
    { id: 4, name: 'Pedro Costa', email: 'pedro@email.com' },
    { id: 5, name: 'Carla Souza', email: 'carla@email.com' },
  ];

  // Initialize form
  const form = useForm({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      subject: '',
      course: '',
      description: '',
      academic_year: new Date().getFullYear().toString(),
      grade_level: '',
      student_capacity: 30,
      grading_system: '0-10',
      color: 'blue',
      room_number: '',
      address: '',
      is_online: false,
      meeting_link: '',
      meeting_days: [],
      meeting_start_time: '',
      meeting_end_time: '',
      period: '',
      school_id: '',
      is_school_managed: false,
      start_date: '',
      end_date: '',
    }
  });

  // Load affiliated schools on mount
  useEffect(() => {
    const loadAffiliatedSchools = async () => {
      if (!user?.id) return;
      
      setLoadingSchools(true);
      try {
        const schools = await schoolService.getTeacherAffiliatedSchools(user.id);
        setAffiliatedSchools(schools || []);
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar suas escolas afiliadas.',
        });
      } finally {
        setLoadingSchools(false);
      }
    };

    loadAffiliatedSchools();
  }, [user]);

  // NEW: Handle day toggle with individual schedule
  const toggleDaySchedule = (dayValue, checked) => {
    if (checked) {
      // Add day with default time
      setWeeklySchedule(prev => ({
        ...prev,
        [dayValue]: { start_time: '08:00', end_time: '09:00' }
      }));
    } else {
      // Remove day
      setWeeklySchedule(prev => {
        const updated = { ...prev };
        delete updated[dayValue];
        return updated;
      });
    }
  };

  // NEW: Update schedule time for specific day
  const updateDayTime = (dayValue, field, value) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        [field]: value
      }
    }));
  };

  // Handle form submission
  const onSubmit = async (data) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para criar uma turma.',
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      logger.info('Iniciando criação de turma', {
        teacherId: user.id,
        className: data.name,
        subject: data.subject
      });

      // NEW: Convert weekly schedule to array format
      const scheduleArray = Object.entries(weeklySchedule).map(([day, times]) => ({
        day,
        start_time: times.start_time,
        end_time: times.end_time
      }));

      // Create class via service using valid schema columns
      const classPayload = {
        name: data.name,
        description: data.description || '',
        teacher_id: user.id,
        created_by: user.id,
        subject: data.subject,
        course: data.course || null,
        academic_year: data.academic_year,
        grade_level: data.grade_level || null,
        student_capacity: data.student_capacity,
        grading_system: data.grading_system,
        color: data.color,
        room_number: data.room_number || null,
        address: data.address || null,
        is_online: !!data.is_online,
        meeting_link: data.meeting_link || null,
        weekly_schedule: scheduleArray.length > 0 ? scheduleArray : null, // NEW: Individual schedules
        period: data.period || null,
        school_id: data.school_id || null,
        is_school_managed: !!data.school_id,
        is_active: true,
        // NEW: Datas de início e fim das aulas
        start_date: data.start_date || null,
        end_date: data.end_date || null,
      };

      const created = await ClassService.createClass(classPayload);

      logger.info('Turma criada com sucesso', {
        classId: created.id,
        className: created.name
      });

      toast({
        title: "✅ Turma criada com sucesso!",
        description: `A turma "${data.name}" foi criada e está pronta para receber alunos.`,
      });

      // Navigate back to classes page
      navigate('/dashboard/classes');

    } catch (error) {
      logger.error('Erro ao criar turma', {
        error: error.message,
        teacherId: user.id
      });

      setError(error.message);

      toast({
        variant: 'destructive',
        title: '❌ Erro ao criar turma',
        description: error.message || 'Não foi possível criar a turma. Verifique sua conexão e tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addStudent = (student) => {
    if (!selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const removeStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter(s => s.id !== studentId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full space-y-8 p-6">
        {/* Header com gradiente */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard/classes')}
                className="text-white hover:bg-white/20 h-10 w-10"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold">Nova Turma</h1>
                <p className="text-purple-100 text-lg">Crie uma nova turma e comece a ensinar</p>
              </div>
            </div>
          </div>

          {/* Elementos decorativos */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* NEW: 2-Column Layout - 2/3 + 1/3 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN (2/3 width) - Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        Informações Básicas
                      </CardTitle>
                      <CardDescription>
                        Defina as informações principais da turma
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Turma</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Matemática 9A"
                                {...field}
                                disabled={isSubmitting}
                                className="bg-white dark:bg-slate-900 text-foreground border-border"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* School Affiliation Select */}
                      <FormField
                        control={form.control}
                        name="school_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <School className="w-4 h-4 text-indigo-600" />
                              Escola (Opcional)
                            </FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                const normalized = value === 'none' ? '' : value;
                                field.onChange(normalized);
                                // Auto-set is_school_managed based on selection
                                form.setValue('is_school_managed', !!normalized);
                              }} 
                              defaultValue={field.value} 
                              disabled={isSubmitting || loadingSchools}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-slate-900 text-foreground border-border">
                                  <SelectValue placeholder={
                                    loadingSchools 
                                      ? "Carregando escolas..." 
                                      : affiliatedSchools.length === 0
                                      ? "Turma independente (sem escola)"
                                      : "Selecione uma escola"
                                  } />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">
                                  🏫 Turma Independente (só você)
                                </SelectItem>
                                {affiliatedSchools.map((school) => (
                                  <SelectItem key={school.id} value={school.id}>
                                    {school.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              {affiliatedSchools.length === 0 ? (
                                <span className="text-muted-foreground">
                                  Você não está afiliado a nenhuma escola. Esta será uma turma independente.
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  Selecione uma escola para compartilhar dados e analytics. Deixe vazio para turma independente.
                                </span>
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Disciplina</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: Matemática, Empreendedorismo, etc."
                                  {...field}
                                  disabled={isSubmitting}
                                  className="bg-white dark:bg-slate-900 text-foreground border-border"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">Digite qualquer disciplina</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="course"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Curso</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: Ciências da Computação, Direito, etc."
                                  {...field}
                                  disabled={isSubmitting}
                                  className="bg-white dark:bg-slate-900 text-foreground border-border"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">Curso a que pertence</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição (Opcional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Descreva os objetivos e conteúdo da turma..."
                                className="min-h-[100px]"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Card de Aulas Online */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Video className="w-4 h-4 text-white" />
                        </div>
                        Formato e Horários das Aulas
                      </CardTitle>
                      <CardDescription>
                        Configure se a turma é online ou presencial e defina os horários
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Toggle Aula Online */}
                      <FormField
                        control={form.control}
                        name="is_online"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-border p-4 bg-white dark:bg-slate-900">
                            <div className="space-y-1 flex-1">
                              <FormLabel className="text-base font-semibold flex items-center gap-2 cursor-pointer">
                                <Video className="w-5 h-5 text-violet-600" />
                                Aula Online
                              </FormLabel>
                              <FormDescription className="text-sm">
                                Ative para configurar link e horários de aulas ao vivo
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isSubmitting}
                                className="ml-4"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Campo de endereço (só para presencial) */}
                      {!form.watch('is_online') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4 pt-2"
                        >
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-red-600" />
                                  Endereço da Aula Presencial
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP" 
                                    {...field} 
                                    disabled={isSubmitting}
                                    className="bg-white dark:bg-slate-900 text-foreground border-border"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Endereço completo onde as aulas presenciais acontecerão
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Separator />
                        </motion.div>
                      )}

                      {/* Link da reunião (só para online) */}
                      {form.watch('is_online') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4 pt-2"
                        >
                          {/* Link da Reunião */}
                          <FormField
                            control={form.control}
                            name="meeting_link"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <LinkIcon className="w-4 h-4 text-blue-600" />
                                  Link da Reunião
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ex: https://meet.google.com/abc-defg-hij" 
                                    {...field} 
                                    disabled={isSubmitting}
                                    className="bg-white dark:bg-slate-900"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Os alunos verão este link na agenda no horário da aula
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Separator />
                        </motion.div>
                      )}

                      {/* NEW: Dias da Semana com Horários Individuais */}
                      <div className="space-y-4 pt-2">
                        <div className="mb-4">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            Horários das Aulas
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Selecione os dias e defina horários individuais para cada aula
                          </FormDescription>
                        </div>

                        {/* Checkboxes para dias */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { value: 'monday', label: 'Seg' },
                            { value: 'tuesday', label: 'Ter' },
                            { value: 'wednesday', label: 'Qua' },
                            { value: 'thursday', label: 'Qui' },
                            { value: 'friday', label: 'Sex' },
                            { value: 'saturday', label: 'Sáb' },
                            { value: 'sunday', label: 'Dom' },
                          ].map((day) => (
                            <label
                              key={day.value}
                              className={`flex items-center space-x-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                                weeklySchedule[day.value]
                                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950'
                                  : 'border-border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <Checkbox
                                checked={!!weeklySchedule[day.value]}
                                onCheckedChange={(checked) => toggleDaySchedule(day.value, checked)}
                                disabled={isSubmitting}
                              />
                              <span className="text-sm font-medium">{day.label}</span>
                            </label>
                          ))}
                        </div>

                        {/* Horários individuais para cada dia selecionado */}
                        {Object.keys(weeklySchedule).length > 0 && (
                          <div className="space-y-3 mt-4">
                            {[
                              { value: 'monday', label: 'Segunda-feira' },
                              { value: 'tuesday', label: 'Terça-feira' },
                              { value: 'wednesday', label: 'Quarta-feira' },
                              { value: 'thursday', label: 'Quinta-feira' },
                              { value: 'friday', label: 'Sexta-feira' },
                              { value: 'saturday', label: 'Sábado' },
                              { value: 'sunday', label: 'Domingo' },
                            ]
                              .filter(day => weeklySchedule[day.value])
                              .map((day) => (
                                <div
                                  key={day.value}
                                  className="p-4 rounded-lg border-2 border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/50"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-violet-700 dark:text-violet-300">
                                      {day.label}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-xs text-muted-foreground mb-1 block">Início</Label>
                                      <Input
                                        type="time"
                                        value={weeklySchedule[day.value]?.start_time || '08:00'}
                                        onChange={(e) => updateDayTime(day.value, 'start_time', e.target.value)}
                                        disabled={isSubmitting}
                                        className="bg-white dark:bg-slate-900 text-foreground border-border"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground mb-1 block">Término</Label>
                                      <Input
                                        type="time"
                                        value={weeklySchedule[day.value]?.end_time || '09:00'}
                                        onChange={(e) => updateDayTime(day.value, 'end_time', e.target.value)}
                                        disabled={isSubmitting}
                                        className="bg-white dark:bg-slate-900 text-foreground border-border"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Preview */}
                        {Object.keys(weeklySchedule).length > 0 && (
                          <Alert className="bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800">
                            <Clock className="h-4 w-4 text-violet-600" />
                            <AlertDescription className="text-sm">
                              <span className="font-semibold">Resumo:</span>{' '}
                              {Object.entries(weeklySchedule).map(([day, times], idx) => {
                                const dayLabel = {
                                  monday: 'Seg',
                                  tuesday: 'Ter',
                                  wednesday: 'Qua',
                                  thursday: 'Qui',
                                  friday: 'Sex',
                                  saturday: 'Sáb',
                                  sunday: 'Dom'
                                }[day];
                                return `${dayLabel} ${times.start_time}-${times.end_time}${idx < Object.keys(weeklySchedule).length - 1 ? ', ' : ''}`;
                              }).join('')}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        Ano letivo e nível
                      </CardTitle>
                      <CardDescription>
                        Configure quando a turma acontecerá
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="academic_year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ano letivo</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: 2025" {...field} disabled={isSubmitting} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="grade_level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nível/Série</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o nível" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="infantil">Educação Infantil</SelectItem>
                                  <SelectItem value="1ano">1º Ano - Fundamental</SelectItem>
                                  <SelectItem value="2ano">2º Ano - Fundamental</SelectItem>
                                  <SelectItem value="3ano">3º Ano - Fundamental</SelectItem>
                                  <SelectItem value="4ano">4º Ano - Fundamental</SelectItem>
                                  <SelectItem value="5ano">5º Ano - Fundamental</SelectItem>
                                  <SelectItem value="6ano">6º Ano - Fundamental</SelectItem>
                                  <SelectItem value="7ano">7º Ano - Fundamental</SelectItem>
                                  <SelectItem value="8ano">8º Ano - Fundamental</SelectItem>
                                  <SelectItem value="9ano">9º Ano - Fundamental</SelectItem>
                                  <SelectItem value="1medio">1º Ano - Ensino Médio</SelectItem>
                                  <SelectItem value="2medio">2º Ano - Ensino Médio</SelectItem>
                                  <SelectItem value="3medio">3º Ano - Ensino Médio</SelectItem>
                                  <SelectItem value="tecnico">Técnico/Profissionalizante</SelectItem>
                                  <SelectItem value="superior">Ensino Superior</SelectItem>
                                  <SelectItem value="pos">Pós-Graduação</SelectItem>
                                  <SelectItem value="livre">Curso Livre</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* NEW: Datas de início e fim das aulas */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t">
                        <FormField
                          control={form.control}
                          name="start_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-green-600" />
                                Data de Início das Aulas
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field} 
                                  disabled={isSubmitting}
                                  className="bg-white dark:bg-slate-900 text-foreground border-border"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Quando começam as aulas desta turma
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="end_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-red-600" />
                                Data de Término das Aulas
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field} 
                                  disabled={isSubmitting}
                                  className="bg-white dark:bg-slate-900 text-foreground border-border"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Quando terminam as aulas (antes das férias/fim do semestre)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* RIGHT COLUMN (1/3 width) - Alunos Disponíveis */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <School className="w-4 h-4 text-white" />
                        </div>
                        Configurações da Turma
                      </CardTitle>
                      <CardDescription>
                        Defina série, capacidade e outras configurações
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="student_capacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capacidade</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" max="100" {...field} onChange={(e)=>field.onChange(parseInt(e.target.value)||1)} disabled={isSubmitting} />
                              </FormControl>
                              <FormDescription>Número máximo de alunos</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="grading_system"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sistema de Notas</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o sistema" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="0-10">0 a 10</SelectItem>
                                  <SelectItem value="0-100">0 a 100</SelectItem>
                                  <SelectItem value="A-F">A, B, C, D, F</SelectItem>
                                  <SelectItem value="pass-fail">Aprovado/Reprovado</SelectItem>
                                  <SelectItem value="excellent-poor">Excelente/Bom/Regular/Ruim</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-xs">Como as notas serão atribuídas</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor da Turma</FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-4 gap-2">
                                {classColors.map((color) => (
                                  <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => field.onChange(color.value)}
                                    disabled={isSubmitting}
                                    className={`
                                      relative h-12 rounded-lg border-2 transition-all duration-200
                                      ${color.class}
                                      ${field.value === color.value
                                        ? 'border-white shadow-lg scale-105'
                                        : 'border-transparent hover:scale-105'
                                      }
                                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                    title={color.name}
                                  >
                                    {field.value === color.value && (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-4 h-4 bg-white rounded-full"></div>
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* RIGHT COLUMN (1/3 width) - Alunos Disponíveis */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="sticky top-6"
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        Alunos (Opcional)
                      </CardTitle>
                      <CardDescription>
                        Adicione alunos à turma agora ou faça isso depois
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Alunos Selecionados ({selectedStudents.length})</Label>
                        {selectedStudents.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedStudents.map((student) => (
                              <Badge
                                key={student.id}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {student.name}
                                <button
                                  type="button"
                                  onClick={() => removeStudent(student.id)}
                                  disabled={isSubmitting}
                                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 disabled:opacity-50"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Nenhum aluno selecionado
                          </p>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label>Alunos Disponíveis</Label>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {availableStudents
                            .filter(student => !selectedStudents.find(s => s.id === student.id))
                            .map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50"
                              >
                                <div>
                                  <p className="text-sm font-medium">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">{student.email}</p>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addStudent(student)}
                                  disabled={isSubmitting}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Adicionar
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end gap-4 pt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/classes')}
                disabled={isSubmitting}
                className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span>Cancelar</span>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="whitespace-nowrap inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    <span>Criar Turma</span>
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateClassroomForm;
