import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from "@/hooks/useAuth";
import { Logger } from '@/services/logger';
import { ClassService } from '@/services/classService';
import teacherSubscriptionService from '@/services/teacherSubscriptionService';
import { supabase } from '@/lib/supabaseClient';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  CheckCircle
} from 'lucide-react';

// Form validation schema
const classFormSchema = z.object({
  name: z.string().min(3, 'Nome da turma deve ter pelo menos 3 caracteres'),
  subject: z.string().min(2, 'Matéria é obrigatória'),
  description: z.string().optional(),
  course: z.string().optional(),
  period: z.string().optional(),
  academic_year: z.string().min(1, 'Ano letivo é obrigatório'),
  grade_level: z.string().min(1, 'Nível é obrigatório'),
  student_capacity: z.number().min(1, 'Capacidade deve ser pelo menos 1').max(100, 'Capacidade máxima é 100'),
  color: z.string().min(1, 'Selecione uma cor'),
  room_number: z.string().optional(),
  is_online: z.boolean().default(false),
  meeting_link: z.string().optional(),
  school_id: z.string().optional(),
  is_school_managed: z.boolean().default(false),
});

const CreateClassForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [error, setError] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);
  const [linkedSchools, setLinkedSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

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
      description: '',
      course: '',
      period: '',
      academic_year: new Date().getFullYear().toString(),
      grade_level: '',
      student_capacity: 30,
      room_number: '',
      is_online: false,
      meeting_link: '',
      color: 'blue',
      school_id: '',
      is_school_managed: false,
    }
  });

  // Carregar escolas vinculadas ao professor
  React.useEffect(() => {
    const loadLinkedSchools = async () => {
      if (!user) return;
      
      try {
        setLoadingSchools(true);
        
        // Buscar escolas onde o professor está vinculado
        const { data: schoolTeachers, error } = await supabase
          .from('school_teachers')
          .select('school_id, schools(id, name)')
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        if (error) throw error;
        
        const schools = (schoolTeachers || []).map(st => st.schools).filter(Boolean);
        setLinkedSchools(schools);
        
        // Se tiver apenas 1 escola, selecionar automaticamente
        if (schools.length === 1) {
          form.setValue('school_id', schools[0].id);
          form.setValue('is_school_managed', true);
        }
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
      } finally {
        setLoadingSchools(false);
      }
    };
    
    loadLinkedSchools();
  }, [user]);

  // Handle form submission
  const onSubmit = async (data) => {
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
      // Verificar limites de plano antes de criar
      const canCreate = await teacherSubscriptionService.checkCanCreateClass(user.id);
      
      if (!canCreate) {
        // Buscar estatísticas para mostrar no modal
        const stats = await teacherSubscriptionService.getUsageStats(user.id);
        setLimitInfo(stats);
        setShowLimitModal(true);
        setIsSubmitting(false);
        return;
      }
      Logger.info('Iniciando criação de turma', { teacherId: user.id, className: data.name, subject: data.subject });

      // Create class via service with all required fields
      const classData = {
        name: data.name,
        description: data.description || '',
        created_by: user.id,
        subject: data.subject,
        course: data.course || '',
        period: data.period || '',
        grade_level: data.grade_level,
        academic_year: data.academic_year,
        color: data.color,
        student_capacity: data.student_capacity,
        room_number: data.room_number || '',
        is_online: data.is_online || false,
        meeting_link: data.meeting_link || '',
        chatbot_enabled: false,
        school_id: data.school_id || null,
        is_school_managed: !!data.is_school_managed,
        is_active: true
      };

      Logger.info('Dados da turma para criação:', classData);
      const created = await ClassService.createClass(classData);

      Logger.info('Turma criada com sucesso', { classId: created.id, className: created.name });

      // Optional: calendar seed can be added here later if needed

      // Gerar convite(s) com RPC generate_class_invite
      let inviteLink = null;
      try {
        // Prefer using ClassInviteManager UI for explicit creation; skipping auto RPC
      } catch (e) {
        Logger.warn('Falha ao gerar convite padrão da turma', { error: e.message });
      }

      // Se houver alunos selecionados com email, gerar convites endereçados
      if (selectedStudents && selectedStudents.length > 0) {
        for (const s of selectedStudents) {
          if (!s.email) continue;
          try {
            // Use email flow via notifications elsewhere; out of scope here
          } catch (e) {
            Logger.warn('Falha ao gerar convite para aluno', { email: s.email, error: e.message });
          }
        }
      }

      toast({
        title: "✅ Turma criada com sucesso!",
        description: inviteLink
          ? `Convite gerado. Copie o link para compartilhar: ${inviteLink}`
          : `A turma "${data.name}" foi criada e está pronta para receber alunos.`,
      });

      // Aguarda um pouco para o usuário copiar o link e então navega
      setTimeout(() => navigate('/dashboard/classes'), 1200);

    } catch (error) {
      Logger.error('Erro ao criar turma', {
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Information */}
              <div className="space-y-6">
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
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Matéria</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Matemática, Educação Física, Yoga..."
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Digite o nome da matéria ou atividade que você ensina
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="course"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: STEM, Linguagens" {...field} disabled={isSubmitting} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="period"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Period (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: morning, afternoon, night" {...field} disabled={isSubmitting} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="room_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número da Sala (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Sala 12, Lab A" {...field} disabled={isSubmitting} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="is_online"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Aula Online</FormLabel>
                                <FormDescription className="text-xs">
                                  Marque se a turma é online
                                </FormDescription>
                              </div>
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  disabled={isSubmitting}
                                  className="w-4 h-4"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch('is_online') && (
                        <FormField
                          control={form.control}
                          name="meeting_link"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Link da Reunião</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: https://meet.google.com/..." {...field} disabled={isSubmitting} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
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
                        Configure o ano letivo e o nível/série
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
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Right Column - Additional Settings */}
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
                          name="school_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Escola Vinculada</FormLabel>
                              {loadingSchools ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Carregando escolas...
                                </div>
                              ) : linkedSchools.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                  Nenhuma escola vinculada
                                </div>
                              ) : linkedSchools.length === 1 ? (
                                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-900 dark:text-green-100">{linkedSchools[0].name}</span>
                                </div>
                              ) : (
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione a escola" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {linkedSchools.map((school) => (
                                      <SelectItem key={school.id} value={school.id}>
                                        {school.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              <FormDescription className="text-xs">
                                {linkedSchools.length === 0 
                                  ? 'Você pode criar turmas independentes ou aguardar convite de uma escola'
                                  : 'Turma será vinculada automaticamente a esta escola'
                                }
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {linkedSchools.length > 0 && (
                        <FormField
                          control={form.control}
                          name="is_school_managed"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Turma Gerenciada pela Escola</FormLabel>
                                <FormDescription className="text-xs">
                                  A escola terá acesso total aos dados e relatórios desta turma
                                </FormDescription>
                              </div>
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  disabled={isSubmitting}
                                  className="w-4 h-4"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}

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

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
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
                                  className="whitespace-nowrap inline-flex items-center gap-2"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Adicionar</span>
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
                className="whitespace-nowrap inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm hover:bg-white/80"
              >
                <span>Cancelar</span>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="whitespace-nowrap inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white min-w-[140px] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4" />
                    <span>Criar Turma</span>
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>

        {/* Modal de Limite de Plano */}
        {showLimitModal && limitInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Limite de Turmas Atingido
                </CardTitle>
                <CardDescription>
                  Você atingiu o limite do seu plano atual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">
                    Plano Atual: <span className="text-orange-600 uppercase">{limitInfo.plan}</span>
                  </p>
                  <p className="text-gray-700">
                    Turmas criadas: <span className="font-bold">{limitInfo.currentClasses}/{limitInfo.maxClasses}</span>
                  </p>
                  {limitInfo.linkedSchools > 0 && (
                    <p className="text-gray-600 text-sm mt-2">
                      💼 Você está vinculado a {limitInfo.linkedSchools} escola(s)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Para criar mais turmas, você pode:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Remover uma turma antiga</li>
                    <li>Fazer upgrade para um plano superior</li>
                    {limitInfo.linkedSchools === 0 && (
                      <li>Vincular-se a uma escola (turmas ilimitadas)</li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 whitespace-nowrap inline-flex items-center justify-center gap-2"
                    onClick={() => setShowLimitModal(false)}
                  >
                    <span>Voltar</span>
                  </Button>
                  <Button
                    className="flex-1 whitespace-nowrap inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
                    onClick={() => navigate('/settings/subscription')}
                  >
                    <span>Ver Planos</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateClassForm;
