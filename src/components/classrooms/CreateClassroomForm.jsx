import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from "@/hooks/useAuth";
import { Logger } from '@/services/logger';

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
  schedule: z.string().min(1, 'Horário é obrigatório'),
  room: z.string().optional(),
  capacity: z.number().min(1, 'Capacidade deve ser pelo menos 1').max(100, 'Capacidade máxima é 100'),
  color: z.string().min(1, 'Selecione uma cor'),
  grade: z.string().min(1, 'Série é obrigatória'),
  semester: z.string().min(1, 'Semestre é obrigatório'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de término é obrigatória'),
});

const CreateClassroomForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [error, setError] = useState(null);

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
      schedule: '',
      room: '',
      capacity: 30,
      color: 'blue',
      grade: '',
      semester: '',
      startDate: '',
      endDate: '',
    }
  });

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
      Logger.info('Iniciando criação de turma', {
        teacherId: user.id,
        className: data.name,
        subject: data.subject
      });

      // Create class in database with correct column names
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .insert([
          {
            name: data.name,
            subject: data.subject,
            description: data.description,
            schedule: data.schedule,
            room: data.room,
            capacity: data.capacity,
            color: data.color,
            grade: data.grade,
            semester: data.semester,
            start_date: data.startDate,
            end_date: data.endDate,
            teacher_id: user.id,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (classError) {
        Logger.error('Erro ao criar turma no banco', {
          error: classError.message,
          teacherId: user.id
        });
        throw classError;
      }

      Logger.info('Turma criada com sucesso', {
        classId: classData.id,
        className: classData.name
      });

      toast({
        title: "✅ Turma criada com sucesso!",
        description: `A turma "${data.name}" foi criada e está pronta para receber alunos.`,
      });

      // Navigate back to classes page
      navigate('/dashboard/classes');

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
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a matéria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="matematica">Matemática</SelectItem>
                                <SelectItem value="portugues">Português</SelectItem>
                                <SelectItem value="ciencias">Ciências</SelectItem>
                                <SelectItem value="historia">História</SelectItem>
                                <SelectItem value="geografia">Geografia</SelectItem>
                                <SelectItem value="fisica">Física</SelectItem>
                                <SelectItem value="quimica">Química</SelectItem>
                                <SelectItem value="biologia">Biologia</SelectItem>
                                <SelectItem value="ingles">Inglês</SelectItem>
                                <SelectItem value="educacao_fisica">Educação Física</SelectItem>
                                <SelectItem value="artes">Artes</SelectItem>
                              </SelectContent>
                            </Select>
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
                        Horários e Datas
                      </CardTitle>
                      <CardDescription>
                        Configure quando a turma acontecerá
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="schedule"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Segunda e Quarta, 14:00 - 15:30"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormDescription>
                              Descreva os dias da semana e horários das aulas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Início</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
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
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Término</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
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
                          name="grade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Série</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Série" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="6ano">6º Ano</SelectItem>
                                  <SelectItem value="7ano">7º Ano</SelectItem>
                                  <SelectItem value="8ano">8º Ano</SelectItem>
                                  <SelectItem value="9ano">9º Ano</SelectItem>
                                  <SelectItem value="1medio">1º Médio</SelectItem>
                                  <SelectItem value="2medio">2º Médio</SelectItem>
                                  <SelectItem value="3medio">3º Médio</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="semester"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Semestre</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Semestre" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1º Semestre</SelectItem>
                                  <SelectItem value="2">2º Semestre</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="capacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capacidade</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormDescription>
                                Número máximo de alunos
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="room"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sala (Opcional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: Sala 101"
                                  {...field}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
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
                className="bg-white/70 backdrop-blur-sm hover:bg-white/80"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white min-w-[140px] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Criar Turma
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
