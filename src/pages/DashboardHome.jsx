import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  BarChart3, 
  MessageSquare,
  TrendingUp,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  Video,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatsCard, FeatureCard, PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { SkeletonScreen } from '@/components/ui/LoadingScreen';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

const DashboardHome = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    classes: [],
    activities: [],
    students: [],
    meetings: [],
    pendingActivities: [],
    recentNotifications: []
  });

  // Carregar dados reais do Supabase
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar tudo em paralelo para melhor performance
      console.log('🔄 Carregando dados do dashboard...');
      
      // Primeiro, buscar classes do professor
      const { data: teacherClasses, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('created_by', user.id);

      if (classesError) throw classesError;

      const classIds = teacherClasses?.map(c => c.id) || [];

      const [classesResult, activitiesResult, studentsResult, submissionsResult] = await Promise.all([
        // Classes do professor com contagem
        supabase
          .from('classes')
          .select('*')
          .eq('created_by', user.id),
        
        // Atividades
        supabase
          .from('activities')
          .select('id, title, created_at, due_date, status')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Alunos únicos via class_members
        classIds.length > 0 ? supabase
          .from('class_members')
          .select('user_id')
          .in('class_id', classIds)
          .eq('role', 'student') : { data: [], error: null },
        
        // Submissões pendentes
        supabase
          .from('submissions')
          .select('id, activity_id, submitted_at, student_id')
          .is('grade', null)
          .order('submitted_at', { ascending: false })
          .limit(100)
      ]);

      if (classesResult.error) throw classesResult.error;
      if (activitiesResult.error) throw activitiesResult.error;
      if (studentsResult.error) throw studentsResult.error;
      if (submissionsResult.error) throw submissionsResult.error;

      // Filtrar submissões que pertencem às atividades do professor
      const activityIds = activitiesResult.data?.map(a => a.id) || [];
      const relevantSubmissions = submissionsResult.data?.filter(s => 
        activityIds.includes(s.activity_id)
      ) || [];

      // Enriquecer submissões com dados das atividades
      const enrichedSubmissions = await Promise.all(
        relevantSubmissions.slice(0, 5).map(async (submission) => {
          const activity = activitiesResult.data?.find(a => a.id === submission.activity_id);
          return {
            ...submission,
            activities: activity ? {
              title: activity.title,
              due_date: activity.due_date
            } : null
          };
        })
      );

      // Contar alunos únicos
      const uniqueStudents = new Set(studentsResult.data?.map(s => s.user_id) || []);

      setDashboardData({
        classes: classesResult.data || [],
        activities: activitiesResult.data || [],
        studentsCount: uniqueStudents.size,
        pendingSubmissions: enrichedSubmissions
      });

    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error);
      toast.error(`Erro ao carregar dashboard: ${error.message || 'Tente novamente'}`);
    } finally {
      setLoading(false);
    }
  };

  // Eventos de hoje (mock - pode ser substituído por dados reais depois)
  const todayMeetings = [];

  // Calcular atividades com entregas pendentes
  const activitiesWithPending = useMemo(() => {
    if (!dashboardData.pendingSubmissions || dashboardData.pendingSubmissions.length === 0) {
      return [];
    }

    // Agrupar submissões por atividade
    const activityMap = {};
    dashboardData.pendingSubmissions.forEach(submission => {
      const activityId = submission.activity_id;
      if (!activityMap[activityId]) {
        activityMap[activityId] = {
          id: activityId,
          title: submission.activities?.title || 'Atividade sem título',
          dueDate: submission.activities?.due_date 
            ? new Date(submission.activities.due_date).toLocaleDateString('pt-BR')
            : 'Sem prazo',
          pending: 0,
          submissions: []
        };
      }
      activityMap[activityId].pending++;
      activityMap[activityId].submissions.push(submission);
    });

    return Object.values(activityMap).slice(0, 5);
  }, [dashboardData.pendingSubmissions]);

  // Alertas recentes baseados em dados reais
  const recentAlerts = useMemo(() => {
    const alerts = [];
    
    if (dashboardData.pendingSubmissions && dashboardData.pendingSubmissions.length > 0) {
      alerts.push({
        id: 1,
        type: 'warning',
        message: `${dashboardData.pendingSubmissions.length} submiss${dashboardData.pendingSubmissions.length > 1 ? 'ões pendentes' : 'ão pendente'} de correção`
      });
    }

    if (dashboardData.activities && dashboardData.activities.length > 0) {
      const recentActivity = dashboardData.activities[0];
      alerts.push({
        id: 2,
        type: 'info',
        message: `Atividade "${recentActivity.title || 'Nova atividade'}" criada recentemente`
      });
    }

    if (dashboardData.classes && dashboardData.classes.length === 0) {
      alerts.push({
        id: 3,
        type: 'info',
        message: 'Crie sua primeira turma para começar!'
      });
    }

    return alerts.slice(0, 3);
  }, [dashboardData]);

  // Stats com dados reais
  const stats = [
    {
      title: 'Turmas Ativas',
      value: String(dashboardData.classes?.length || 0),
      change: dashboardData.classes?.length > 0 ? `${dashboardData.classes.length} turma${dashboardData.classes.length > 1 ? 's' : ''}` : 'Crie sua primeira',
      trend: dashboardData.classes?.length > 0 ? 'up' : 'neutral',
      icon: Users,
      link: '/dashboard/classes'
    },
    {
      title: 'Atividades',
      value: String(dashboardData.activities?.length || 0),
      change: dashboardData.activities?.length > 0 ? `${dashboardData.activities.length} criada${dashboardData.activities.length > 1 ? 's' : ''}` : 'Nenhuma ainda',
      trend: dashboardData.activities?.length > 0 ? 'up' : 'neutral',
      icon: BookOpen,
      link: '/dashboard/activities'
    },
    {
      title: 'Entregas Pendentes',
      value: String(dashboardData.pendingSubmissions?.length || 0),
      change: dashboardData.pendingSubmissions?.length > 0 ? 'Revisar agora' : 'Tudo em dia',
      trend: dashboardData.pendingSubmissions?.length > 0 ? 'warning' : 'neutral',
      icon: Clock,
      link: '/dashboard/activities'
    },
    {
      title: 'Total de Alunos',
      value: String(dashboardData.studentsCount || 0),
      change: dashboardData.studentsCount > 0 ? `${dashboardData.studentsCount} aluno${dashboardData.studentsCount > 1 ? 's' : ''}` : 'Convide alunos',
      trend: dashboardData.studentsCount > 0 ? 'up' : 'neutral',
      icon: Users,
      link: '/dashboard/students'
    }
  ];

  const quickActions = [
    {
      title: 'Criar Turma',
      description: 'Organize seus alunos em turmas',
      icon: Users,
      link: '/dashboard/classes',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Nova Atividade',
      description: 'Crie atividades para suas turmas',
      icon: BookOpen,
      link: '/dashboard/activities/new',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Ver Agenda',
      description: 'Confira seus compromissos',
      icon: Calendar,
      link: '/dashboard/calendar',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Chatbot IA',
      description: 'Assistente inteligente',
      icon: MessageSquare,
      link: '/dashboard/chatbot',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="animate-fade-in-up space-y-8">
        <div className="skeleton h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-primary rounded-2xl p-8 text-white shadow-themed-lg relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bem-vindo de volta, {user?.email?.split('@')[0] || 'Professor'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Pronto para transformar a educação hoje?
            </p>
          </div>
          <div className="hidden md:block">
            <Award className="w-24 h-24 opacity-20" />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="stagger-children grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <StatsCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              icon={stat.icon}
              className="hover-lift cursor-pointer"
            />
          </Link>
        ))}
      </div>

      {/* Recent Alerts - MOVED TO TOP */}
      <PremiumCard variant="elevated">
        <div className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notificações Recentes
          </h2>
          <div className="space-y-2">
            {recentAlerts.map(alert => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  alert.type === 'warning' 
                    ? 'bg-warning/10 border border-warning/20' 
                    : 'bg-info/10 border border-info/20'
                }`}
              >
                {alert.type === 'warning' ? (
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                ) : (
                  <Bell className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </PremiumCard>

      {/* Today's Schedule & Pending Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Meetings/Classes */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Agenda de Hoje
            </h2>
            {todayMeetings.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Nenhum compromisso hoje"
                description="Aproveite o dia livre!"
              />
            ) : (
              <div className="space-y-3">
                {todayMeetings.map(meeting => (
                  <div
                    key={meeting.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${
                      meeting.type === 'meeting' 
                        ? 'bg-purple-100 dark:bg-purple-900/30' 
                        : 'bg-blue-100 dark:bg-muted/50'
                    }`}>
                      {meeting.type === 'meeting' ? (
                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{meeting.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meeting.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PremiumCard>

        {/* Pending Activities */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Correções Pendentes
            </h2>
            {activitiesWithPending.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Tudo em dia!"
                description="Não há submissões aguardando correção"
              />
            ) : (
              <div className="space-y-3">
                {activitiesWithPending.map(activity => (
                  <Link
                    key={activity.id}
                    to={`/dashboard/activities/${activity.id}`}
                    className="block p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Prazo: {activity.dueDate}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20 ml-2">
                        {activity.pending} {activity.pending === 1 ? 'pendente' : 'pendentes'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(activity.pending * 10, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        Clique para corrigir
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </PremiumCard>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl p-6 shadow-themed border border-border">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-primary" />
          Ações Rápidas
        </h2>
        <div className="stagger-children grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.link}>
              <FeatureCard
                title={action.title}
                description={action.description}
                icon={action.icon}
                gradient={action.gradient}
                className="h-full"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
