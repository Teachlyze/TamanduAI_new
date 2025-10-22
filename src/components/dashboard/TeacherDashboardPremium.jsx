import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import {
  Users,
  BookOpen,
  Bot,
  BarChart3,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Trophy,
  Zap,
  Target,
  Brain,
  FileCheck,
  Plus,
  ArrowRight,
  Sparkles,
  Bell,
  AlertTriangle,
  FileText,
  Video
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import teacherSubscriptionService from '@/services/teacherSubscriptionService';
import analyticsML from '@/services/analyticsML';

const TeacherDashboardPremium = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    activities: 0,
    pendingCorrections: 0,
  });
  const [subscription, setSubscription] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [recentClasses, setRecentClasses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayEvents, setTodayEvents] = useState([]);
  const [studentsNeedingAttention, setStudentsNeedingAttention] = useState([]);
  const [uncorrectedActivities, setUncorrectedActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Buscar turmas do professor
      const { data: classes } = await supabase
        .from('classes')
        .select('*')
        .eq('created_by', user.id);

      const classIds = classes ? classes.map(c => c.id) : [];
      setStats(prev => ({ ...prev, classes: classes?.length || 0 }));

      // 2. Buscar alunos nas turmas do professor
      const { count: studentsCount } = await supabase
        .from('class_members')
        .select('id', { count: 'exact', head: false })
        .in('class_id', classIds)
        .eq('role', 'student');
      // Reduce payload
      await supabase.from('class_members').select('id').in('class_id', classIds).eq('role','student').limit(0);

      setStats(prev => ({ ...prev, students: studentsCount || 0 }));

      // 3. Buscar atividades criadas pelo professor
      const { count: activitiesCount } = await supabase
        .from('activities')
        .select('id', { count: 'exact', head: false })
        .eq('created_by', user.id)
        .limit(0);

      setStats(prev => ({ ...prev, activities: activitiesCount || 0 }));

      // 4. Buscar correções pendentes
      const { count: pendingCount } = await supabase
        .from('submissions')
        .select('id', { count: 'exact', head: false })
        .in('activities.activity_class_assignments.class_id', classIds)
        .eq('status', 'submitted')
        .limit(0);

      setStats(prev => ({ ...prev, pendingCorrections: pendingCount || 0 }));

      // 5. Buscar turmas recentes
      const { data: recent } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      setRecentClasses(recent || []);

      // 6. Buscar assinatura do professor
      const subscriptionData = await teacherSubscriptionService.getTeacherSubscription(user.id);
      setSubscription(subscriptionData);

      // 7. Buscar estatísticas de uso
      const usageData = await teacherSubscriptionService.getUsageStats(user.id);
      setUsageStats(usageData);

      // 8. Buscar alertas (DESABILITADO - tabela teacher_alerts não existe)
      // const { data: alertsData } = await supabase
      //   .from('teacher_alerts')
      //   .select('*')
      //   .eq('created_by', user.id)
      //   .eq('read', false)
      //   .order('created_at', { ascending: false });

      setAlerts([]);  // Temporariamente vazio
      
      // Buscar eventos do dia
      const today = new Date();
      const formattedToday = format(today, 'yyyy-MM-dd');
      
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .gte('date', formattedToday)
        .lte('date', formattedToday)
        .order('start_time', { ascending: true });
      
      setTodayEvents(events || []);
      
      // Buscar alunos que precisam de atenção (DESABILITADO - tabela student_analytics não existe)
      // const { data: studentsAttention } = await supabase
      //   .from('student_analytics')
      //   .select('*, profiles(*)')
      //   .eq('created_by', user.id)
      //   .lt('engagement_score', 30)
      //   .order('engagement_score', { ascending: true })
      //   .limit(5);
      
      setStudentsNeedingAttention([]);  // Temporariamente vazio
      
      // Buscar atividades aguardando correção (CORRIGIDO - usar 'submissions' ao invés de 'activity_submissions')
      // Buscar atividades do professor primeiro
      const { data: teacherActivities } = await supabase
        .from('activities')
        .select('id')
        .eq('created_by', user.id);
      
      const activityIds = (teacherActivities || []).map(a => a.id);
      let pendingActivities = [];
      if (activityIds.length > 0) {
        const { data: pending } = await supabase
          .from('submissions')
          .select('*, activities(*), profiles:student_id(*)')
          .in('activity_id', activityIds)
          .eq('status', 'submitted')
          .order('submitted_at', { ascending: false });
        pendingActivities = pending || [];
      }
      
      setUncorrectedActivities(pendingActivities || []);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Definir cards de estatísticas
  const statsCards = [
    {
      title: 'Alunos',
      value: stats.students,
      subtitle: 'Total de alunos',
      icon: Users,
      gradient: 'from-blue-500 to-blue-700',
    },
    {
      title: 'Turmas',
      value: stats.classes,
      subtitle: 'Turmas ativas',
      icon: BookOpen,
      gradient: 'from-green-500 to-green-700',
    },
    {
      title: 'Atividades',
      value: stats.activities,
      subtitle: 'Atividades criadas',
      icon: FileText,
      gradient: 'from-purple-500 to-purple-700',
    },
    {
      title: 'Pendentes',
      value: stats.pendingCorrections,
      subtitle: 'Aguardando correção',
      icon: Clock,
      alert: stats.pendingCorrections > 0,
      gradient: 'from-amber-500 to-amber-700',
    },
  ];

  // Definir ações rápidas
  const quickActions = [
    {
      title: 'Nova Turma',
      description: 'Criar uma nova turma',
      icon: Plus,
      path: '/dashboard/classes/new',
      gradient: 'from-blue-500 to-blue-700',
    },
    {
      title: 'Nova Atividade',
      description: 'Criar uma nova atividade',
      icon: FileText,
      path: '/dashboard/activities/new',
      gradient: 'from-purple-500 to-purple-700',
    },
    {
      title: 'Agendar',
      description: 'Agendar um novo evento',
      icon: Calendar,
      path: '/dashboard/calendar',
      gradient: 'from-amber-500 to-amber-700',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-white hover:opacity-90">
            Olá, Professor! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo ao seu painel de controle
          </p>
        </div>

        {subscription && (
          <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 text-sm hover:opacity-90">
            {subscription.plan_name}
          </Badge>
        )}
      </motion.div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-amber-500 mr-2" />
                <CardTitle className="text-sm font-medium">Você tem {alerts.length} notificações</CardTitle>
              </div>
              <CardDescription className="mt-2">
                {alerts[0].message}
              </CardDescription>
              <Button variant="link" className="p-0 mt-2 text-amber-600" onClick={() => navigate('/dashboard/notifications')}>
                Ver todas
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-16 -mt-16`}></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                  {stat.alert && (
                    <AlertCircle className="inline ml-2 h-5 w-5 text-orange-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                {stat.progress !== undefined && stat.progress > 0 && (
                  <Progress value={stat.progress} className="mt-3 h-2" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Métrica: Atividades aguardando correção (full-width) */}
      <div className="mt-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Atividades aguardando correção</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{stats.pendingCorrections}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard/activities/pending')}
                className="text-indigo-600 hover:text-indigo-700 flex items-center whitespace-nowrap shrink-0"
              >
                Ver pendentes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="cursor-pointer h-full hover:shadow-lg transition-shadow duration-300"
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-6 pt-7">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className={`p-3 inline-flex rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                    </div>
                    {action.indicator && (
                      <div className="mt-4 flex items-center">
                        <Badge variant="outline" className=" dark:bg-slate-900 text-foreground border-border bg-gray-100">
                          {action.indicator}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Classes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Turmas Recentes</h2>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/classes')}
            className="text-indigo-600 hover:text-indigo-700 flex items-center whitespace-nowrap"
          >
            <span>Ver todas</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {recentClasses.length === 0 ? (
          <Card className="border-dashed border-2 md:p-12 align-middle">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-14 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Você ainda não tem turmas</p>
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
                onClick={() => navigate('/dashboard/classes/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira turma
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentClasses.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  onClick={() => navigate(`/dashboard/classes/${classItem.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-2 h-12 rounded-full ${classItem.color || 'bg-indigo-500'} mr-4`}></div>
                        <div>
                          {classItem.has_chatbot && (
                            <Badge className="bg-blue-100 text-blue-800 mb-1 flex items-center w-fit">
                              <Bot className="h-3 w-3 mr-1" />
                              Chatbot
                            </Badge>
                          )}
                          <h3 className="font-medium text-gray-900">{classItem.name}</h3>
                          <p className="text-xs text-gray-500">
                            Criada em {format(new Date(classItem.created_at), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center text-gray-500 text-sm">
                          <Users className="h-3 w-3 mr-1" />
                          {classItem.student_count || 0}
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Painéis secundários: Eventos e Alunos em atenção */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eventos de Hoje */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Eventos de Hoje</CardTitle>
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard/calendar')}
                className="text-indigo-600 hover:text-indigo-700 flex items-center whitespace-nowrap shrink-0"
              >
                <span>Ver calendário</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-gray-600">Nenhum evento programado para hoje</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium leading-5">{event.title}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(`${event.date}T${event.start_time}`), 'HH:mm')} - {format(new Date(`${event.date}T${event.end_time}`), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className=" dark:bg-slate-900 text-foreground border-border bg-blue-50 shrink-0">{event.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alunos que precisam de atenção */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Alunos que precisam de atenção</CardTitle>
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard/analytics/students')}
                className="text-indigo-600 hover:text-indigo-700 flex items-center whitespace-nowrap shrink-0"
              >
                <span>Ver análise</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {studentsNeedingAttention.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-gray-600">Todos os alunos estão com bom engajamento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentsNeedingAttention.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-orange-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium leading-5">{student.profiles.full_name}</p>
                        <div className="flex items-center mt-1">
                          <Progress value={student.engagement_score} className="h-2 w-24 mr-2" />
                          <span className="text-xs text-gray-500">{student.engagement_score}% engajamento</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border shrink-0" onClick={() => navigate(`/dashboard/students/${student.profiles.id}`)}>
                      Ver perfil
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboardPremium;
