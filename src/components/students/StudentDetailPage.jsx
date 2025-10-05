import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';

// Tab Components
import { StudentOverviewTab } from './StudentOverviewTab';
import { StudentActivitiesTab } from './StudentActivitiesTab';
import { StudentReportsTab } from './StudentReportsTab';

// Icons
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  BarChart2, 
  Edit, 
  Download, 
  AlertCircle,
  User,
  FileCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  BookOpen,
  GraduationCap
} from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Student Header Component
const StudentHeader = ({ student, onBack, onEdit }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white"
    >
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20 h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Detalhes do Aluno</h1>
            <p className="text-blue-100 text-lg">Informações completas e acompanhamento acadêmico</p>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4f46e5&color=fff`} 
                alt={student.name} 
              />
              <AvatarFallback className="bg-white/20 text-white font-medium text-xl">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold mb-2">{student.name}</h2>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge 
                  variant={student.status === 'active' ? 'default' : 'secondary'} 
                  className={`${student.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500'} text-white`}
                >
                  {student.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
                <div className="flex items-center text-blue-100">
                  <Calendar className="h-4 w-4 mr-2" />
                  Membro desde {formatDate(student.joinDate)}
                </div>
                <div className="flex items-center text-blue-100">
                  <Mail className="h-4 w-4 mr-2" />
                  {student.email}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </Button>
            <Button 
              size="sm" 
              onClick={onEdit}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Aluno
            </Button>
          </div>
        </div>
      </div>
      
      {/* Elementos decorativos */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
    </motion.div>
  );
};

const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  // Fetch student data from Supabase
  const fetchStudent = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - replace with actual Supabase data
      const mockStudent = {
        id: id,
        name: 'Ana Silva',
        email: 'ana.silva@email.com',
        phone: '(11) 99999-9999',
        birthDate: '2010-05-15',
        joinDate: '2024-01-10',
        status: 'active',
        address: 'Rua Exemplo, 123 - São Paulo/SP',
        enrollmentNumber: '2024001',
        grade: '9º Ano',
        shift: 'Manhã',
        classes: [
          { id: 1, name: 'Matemática 9A', teacher: 'Prof. Carlos', schedule: 'Segunda e Quarta, 14:00 - 15:30' },
          { id: 2, name: 'Física 2B', teacher: 'Prof. Mariana', schedule: 'Terça e Quinta, 10:00 - 11:30' }
        ],
        parentName: 'Maria Silva',
        parentEmail: 'maria.silva@email.com',
        parentPhone: '(11) 98888-8888'
      };
      
      setStudent(mockStudent);
      
    } catch (error) {
      console.error('Error fetching student:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar aluno',
        description: 'Não foi possível carregar os dados do aluno. Tente novamente mais tarde.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch student activities
  const fetchStudentActivities = async () => {
    try {
      setIsLoadingActivities(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock data
      const mockActivities = [
        {
          id: 1,
          title: 'Trabalho de Matemática',
          description: 'Resolução de exercícios sobre equações do segundo grau',
          dueDate: '2023-11-15',
          status: 'completed',
          grade: 9.5,
          subject: { name: 'Matemática', color: 'text-blue-600 bg-blue-100' },
          submittedAt: '2023-11-14T14:30:00',
          feedback: 'Excelente trabalho!'
        },
        {
          id: 2,
          title: 'Prova de Física',
          description: 'Mecânica: Leis de Newton',
          dueDate: '2023-11-20',
          status: 'pending',
          grade: null,
          subject: { name: 'Física', color: 'text-purple-600 bg-purple-100' },
          submittedAt: null,
          feedback: null
        },
        {
          id: 3,
          title: 'Relatório de Química',
          description: 'Experimento de reações químicas',
          dueDate: '2023-11-10',
          status: 'late',
          grade: 7.0,
          subject: { name: 'Química', color: 'text-green-600 bg-green-100' },
          submittedAt: '2023-11-12T10:15:00',
          feedback: 'Entregue com atraso. Conteúdo bom, mas poderia ser mais detalhado.'
        }
      ];
      
      setActivities(mockActivities);
      
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar atividades',
        description: 'Não foi possível carregar as atividades do aluno. Tente novamente mais tarde.'
      });
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (id) {
      fetchStudent();
      fetchStudentActivities();
    }
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Carregando dados do aluno...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Aluno não encontrado</h2>
          <p className="text-muted-foreground mb-4">Não foi possível carregar os dados do aluno solicitado.</p>
          <Button onClick={() => navigate('/dashboard/students')}>
            Voltar para a lista de alunos
          </Button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const { completedActivities, pendingActivities, lateActivities, averageGrade } = useMemo(() => {
    const completed = activities.filter(a => a.status === 'completed').length;
    const pending = activities.filter(a => a.status === 'pending').length;
    const late = activities.filter(a => a.status === 'late').length;
    const avg = activities.length > 0 
      ? parseFloat((activities.reduce((sum, a) => sum + (a.grade || 0), 0) / activities.length).toFixed(1))
      : 0;
      
    return {
      completedActivities: completed,
      pendingActivities: pending,
      lateActivities: late,
      averageGrade: avg
    };
  }, [activities]);

  // Handle navigation
  const handleBack = () => navigate(-1);
  const handleEdit = () => navigate(`/dashboard/students/edit/${student.id}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <TooltipProvider>
        <div className="w-full space-y-8 p-6">
          {/* Header */}
          <StudentHeader 
            student={student} 
            onBack={handleBack} 
            onEdit={handleEdit} 
          />

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Atividades Concluídas</p>
                    <p className="text-3xl font-bold text-green-600">{completedActivities}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Atividades Pendentes</p>
                    <p className="text-3xl font-bold text-orange-600">{pendingActivities}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Média Geral</p>
                    <p className="text-3xl font-bold text-blue-600">{averageGrade.toFixed(1)}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Turmas</p>
                    <p className="text-3xl font-bold text-purple-600">{student.classes?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs 
              defaultValue="overview" 
              onValueChange={setActiveTab} 
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-3 max-w-2xl bg-white/70 backdrop-blur-sm">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="activities" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Atividades
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Relatórios
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <StudentOverviewTab 
                  student={student} 
                  activities={activities} 
                  isLoadingActivities={isLoadingActivities}
                  completedActivities={completedActivities}
                  pendingActivities={pendingActivities}
                  lateActivities={lateActivities}
                  averageGrade={averageGrade}
                />
              </TabsContent>

              <TabsContent value="activities" className="space-y-6">
                <StudentActivitiesTab 
                  activities={activities}
                  isLoadingActivities={isLoadingActivities}
                />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <StudentReportsTab 
                  student={student}
                  activities={activities}
                  isLoadingActivities={isLoadingActivities}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default StudentDetailPage;
