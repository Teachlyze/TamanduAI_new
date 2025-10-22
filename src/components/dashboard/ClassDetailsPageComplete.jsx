import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getClassDetails, getClassStudents } from '@/services/apiSupabase';
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Users, 
  BookOpen, 
  AlertCircle, 
  Share2, 
  UserPlus,
  Plus,
  Calendar,
  TrendingUp,
  FileText,
  Clock,
  MessageSquare,
  BarChart3,
  Settings,
  FolderOpen,
  ClipboardCheck,
  Award,
  Target,
  Sparkles
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';

// Import existing pages/components
import ClassFeedPage from '@/pages/classes/ClassFeedPage';
import ClassMaterialsPage from '@/pages/teacher/ClassMaterialsPage';
import ClassGradesPage from '@/pages/teacher/ClassGradesPage';
import ClassAnalyticsPage from '@/pages/teacher/ClassAnalyticsPage';
import ClassAIAssistant from '@/components/classes/ClassAIAssistant';
import ClassInviteManager from '../classes/ClassInviteManager';
import ActivitiesList from '../activities/ActivitiesList';

const ClassDetailsPageComplete = () => {
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null); // 'teacher', 'student', 'school'
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'feed');
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalActivities: 0,
    pendingSubmissions: 0,
    averageGrade: 0
  });

  const fetchClassDetails = useCallback(async () => {
    if (!classId || !user) {
      setError('Dados insuficientes para carregar a turma');
      setLoading(false);
      return;
    }
    
    try {
      setError('');
      const data = await getClassDetails(classId);
      
      if (!data) {
        throw new Error('Turma não encontrada');
      }

      // Detectar role do usuário
      let role = 'student'; // default
      
      if (data.created_by === user.id) {
        role = 'teacher';
      } else if (user.role === 'school_admin') {
        role = 'school';
      }
      
      setUserRole(role);
      setClassDetails(data);
      
      const studentsData = await getClassStudents(classId);
      setStudents(studentsData || []);
      
      // Calcular stats (TODO: buscar dados reais)
      setStats({
        totalStudents: studentsData?.length || 0,
        totalActivities: 12,
        pendingSubmissions: 5,
        averageGrade: 8.5
      });
      
      setLoading(false);
      
    } catch (err) {
      console.error('Error fetching class details:', err);
      setError(err.message || 'Erro ao carregar os detalhes da turma');
      setLoading(false);
    }
  }, [classId, user]);

  useEffect(() => {
    fetchClassDetails();
  }, [fetchClassDetails]);

  if (loading) {
    return <LoadingScreen message="Carregando turma..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <PremiumCard className="max-w-md w-full p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Erro ao carregar turma</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <PremiumButton
              onClick={fetchClassDetails}
              className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-6 py-2.5"
            >
              Tentar novamente
            </PremiumButton>
          </motion.div>
        </PremiumCard>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Turma não encontrada"
        description="Esta turma não existe ou você não tem permissão para acessá-la"
      />
    );
  }

  // Definir tabs baseado no role
  const tabs = {
    teacher: [
      { value: 'feed', label: 'Feed', icon: MessageSquare },
      { value: 'activities', label: 'Atividades', icon: BookOpen },
      { value: 'students', label: 'Alunos', icon: Users },
      { value: 'materials', label: 'Materiais', icon: FolderOpen },
      { value: 'grades', label: 'Notas', icon: ClipboardCheck },
      { value: 'analytics', label: 'Analytics', icon: BarChart3 },
      { value: 'invites', label: 'Convites', icon: Share2 },
    ],
    student: [
      { value: 'feed', label: 'Feed', icon: MessageSquare },
      { value: 'activities', label: 'Atividades', icon: BookOpen },
      { value: 'students', label: 'Colegas', icon: Users },
      { value: 'materials', label: 'Materiais', icon: FolderOpen },
      { value: 'grades', label: 'Notas', icon: ClipboardCheck },
    ],
    school: [
      { value: 'feed', label: 'Feed', icon: MessageSquare },
      { value: 'activities', label: 'Atividades', icon: BookOpen },
      { value: 'students', label: 'Alunos', icon: Users },
      { value: 'analytics', label: 'Analytics', icon: BarChart3 },
    ]
  };

  const currentTabs = tabs[userRole] || tabs.student;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header Premium com Gradiente */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white"
      >
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4 flex-1">
              <PremiumButton
                variant="outline"
                size="sm"
                leftIcon={ArrowLeft}
                onClick={() => navigate(
                  userRole === 'teacher' ? '/dashboard/teacher/classes' :
                  userRole === 'school' ? '/school/classes' :
                  '/students/classes'
                )}
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2"
              >
                Voltar
              </PremiumButton>
              
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold">{classDetails.name}</h1>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {classDetails.subject || 'Geral'}
                  </Badge>
                  {userRole === 'school' && (
                    <Badge className="bg-yellow-500/30 text-white border-yellow-400/30">
                      Escola
                    </Badge>
                  )}
                </div>
                {classDetails.description && (
                  <p className="text-white/90 mt-2 text-lg max-w-2xl">
                    {classDetails.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-white/80">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {stats.totalStudents} alunos
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {stats.totalActivities} atividades
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Criada em {new Date(classDetails.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {userRole === 'teacher' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <PremiumButton
                  leftIcon={Plus}
                  onClick={() => navigate('/dashboard/activities/new')}
                  className="bg-white text-purple-600 hover:bg-white/90 shadow-lg whitespace-nowrap inline-flex items-center gap-2 font-semibold border-2 border-white/20 min-w-fit px-6 py-2.5"
                >
                  Nova Atividade
                </PremiumButton>
              </motion.div>
            )}
          </div>

          {/* Stats Cards no Header (Teacher e School) */}
          {(userRole === 'teacher' || userRole === 'school') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Alunos</p>
                    <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
                  </div>
                  <Users className="w-8 h-8 text-white/60" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Atividades</p>
                    <p className="text-2xl font-bold text-white">{stats.totalActivities}</p>
                  </div>
                  <FileText className="w-8 h-8 text-white/60" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Pendentes</p>
                    <p className="text-2xl font-bold text-white">{stats.pendingSubmissions}</p>
                  </div>
                  <Clock className="w-8 h-8 text-white/60" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Média Geral</p>
                    <p className="text-2xl font-bold text-white">{stats.averageGrade.toFixed(1)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-white/60" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Tabs Navigation Premium */}
        <div className="container mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/10 backdrop-blur-sm border-white/20 p-1">
              {currentTabs.map(tab => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="whitespace-nowrap inline-flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-purple-600 text-white/80"
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Principal (2 colunas) */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Feed Tab - COMPONENTE REAL */}
              <TabsContent value="feed" className="mt-0">
                <ClassFeedPage />
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities" className="mt-0">
                <PremiumCard variant="elevated" className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Atividades da Turma</h2>
                    {userRole === 'teacher' && (
                      <PremiumButton
                        leftIcon={Plus}
                        size="sm"
                        onClick={() => navigate('/dashboard/activities/new')}
                        className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2"
                      >
                        Nova Atividade
                      </PremiumButton>
                    )}
                  </div>
                  <ActivitiesList classId={classId} isTeacher={userRole === 'teacher'} />
                </PremiumCard>
              </TabsContent>

              {/* Students Tab */}
              <TabsContent value="students" className="mt-0">
                <PremiumCard variant="elevated" className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">
                      {userRole === 'student' ? 'Colegas de Turma' : 'Alunos da Turma'}
                    </h2>
                    {userRole === 'teacher' && (
                      <PremiumButton
                        leftIcon={UserPlus}
                        size="sm"
                        onClick={() => setActiveTab('invites')}
                        className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2"
                      >
                        Convidar Alunos
                      </PremiumButton>
                    )}
                  </div>
                  
                  {students.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence>
                        {students.map((student, index) => (
                          <motion.div
                            key={student.id || index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <PremiumCard className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                  {student.full_name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-lg">{student.full_name || 'Sem nome'}</p>
                                  <p className="text-sm text-muted-foreground">{student.email || 'Sem email'}</p>
                                </div>
                                {userRole !== 'student' && (
                                  <div className="text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {student.joined_at ? new Date(student.joined_at).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : '-'}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </PremiumCard>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <EmptyState
                      icon={Users}
                      title="Nenhum aluno inscrito"
                      description={userRole === 'student' ? "Você é o primeiro aluno desta turma" : "Convide alunos para começar"}
                      actionLabel={userRole === 'teacher' ? "Convidar Primeiro Aluno" : undefined}
                      onAction={userRole === 'teacher' ? () => setActiveTab('invites') : undefined}
                    />
                  )}
                </PremiumCard>
              </TabsContent>

              {/* Materials Tab - COMPONENTE REAL */}
              <TabsContent value="materials" className="mt-0">
                <ClassMaterialsPage />
              </TabsContent>

              {/* Grades Tab - COMPONENTE REAL */}
              <TabsContent value="grades" className="mt-0">
                <ClassGradesPage />
              </TabsContent>

              {/* Analytics Tab (Teacher e School) - COMPONENTE REAL */}
              {(userRole === 'teacher' || userRole === 'school') && (
                <TabsContent value="analytics" className="mt-0">
                  <ClassAnalyticsPage />
                </TabsContent>
              )}

              {/* Invites Tab (Teacher only) */}
              {userRole === 'teacher' && (
                <TabsContent value="invites" className="mt-0">
                  <ClassInviteManager classId={classId} />
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar (1 coluna) */}
          <div className="space-y-6">
            {/* AI Assistant */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ClassAIAssistant classId={classId} />
            </motion.div>

            {/* Quick Actions */}
            {userRole === 'teacher' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <PremiumCard variant="elevated" className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Ações Rápidas
                  </h3>
                  <div className="space-y-2">
                    <PremiumButton
                      variant="outline"
                      leftIcon={Plus}
                      className="w-full whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2 justify-start"
                      onClick={() => navigate('/dashboard/activities/new')}
                    >
                      Nova Atividade
                    </PremiumButton>
                    <PremiumButton
                      variant="outline"
                      leftIcon={UserPlus}
                      className="w-full whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2 justify-start"
                      onClick={() => setActiveTab('invites')}
                    >
                      Convidar Alunos
                    </PremiumButton>
                    <PremiumButton
                      variant="outline"
                      leftIcon={FolderOpen}
                      className="w-full whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2 justify-start"
                      onClick={() => setActiveTab('materials')}
                    >
                      Upload Material
                    </PremiumButton>
                    <PremiumButton
                      variant="outline"
                      leftIcon={BarChart3}
                      className="w-full whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2 justify-start"
                      onClick={() => setActiveTab('analytics')}
                    >
                      Ver Analytics
                    </PremiumButton>
                    <PremiumButton
                      variant="outline"
                      leftIcon={Settings}
                      className="w-full whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2 justify-start"
                    >
                      Configurações
                    </PremiumButton>
                  </div>
                </PremiumCard>
              </motion.div>
            )}

            {/* Quick Info for Students */}
            {userRole === 'student' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <PremiumCard variant="elevated" className="p-6">
                  <h3 className="text-lg font-bold mb-4">Minhas Estatísticas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Atividades Concluídas</span>
                      <span className="font-semibold">8/12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Média Geral</span>
                      <span className="font-semibold">8.5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Presença</span>
                      <span className="font-semibold">95%</span>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            )}

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <PremiumCard variant="elevated" className="p-6">
                <h3 className="text-lg font-bold mb-4">Atividade Recente</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-muted-foreground">Nenhuma atividade recente</p>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailsPageComplete;
