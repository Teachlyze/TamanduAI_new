import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  MessageSquare,
  Plus,
  ArrowUpRight,
  Target,
  Zap,
  Brain,
  GraduationCap,
  BarChart3,
  Settings,
  Bell,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserClasses } from '@/hooks/useRedisCache';
import { supabase } from '@/lib/supabaseClient';
import { Logger } from '@/services/logger';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teacherStats, setTeacherStats] = useState({
    totalStudents: 0,
    activeClasses: 0,
    totalActivities: 0,
    completionRate: 0,
    pendingSubmissions: 0,
    upcomingDeadlines: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use Redis cache for teacher's classes
  const { data: teacherClasses, loading: classesLoading } = useUserClasses(user?.id, 'teacher');

  useEffect(() => {
    const loadTeacherData = async () => {
      if (!user?.id || !teacherClasses) return;

      try {
        setLoading(true);

        // Calculate stats from cached classes data
        const totalStudents = teacherClasses.reduce((sum, cls) => sum + (cls.students_count || 0), 0);
        const activeClasses = teacherClasses.length;
        const totalActivities = teacherClasses.reduce((sum, cls) => sum + (cls.activities_count || 0), 0);

        // Get recent activities from class activities
        const { data: activities, error: activitiesError } = await supabase
          .from('class_activities')
          .select(`
            id,
            title,
            type,
            created_at,
            due_date,
            class_id,
            classes!inner(name)
          `)
          .in('class_id', teacherClasses.map(cls => cls.id))
          .order('created_at', { ascending: false })
          .limit(5);

        if (activitiesError) {
          Logger.error('Error fetching recent activities:', activitiesError);
        }

        // Get pending submissions count
        const { count: pendingCount, error: pendingError } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .in('activity_id',
            activities?.map(activity => activity.id) || []
          )
          .eq('status', 'submitted')
          .is('grade', null);

        if (pendingError) {
          Logger.error('Error fetching pending submissions:', pendingError);
        }

        // Calculate completion rate (simplified)
        const completionRate = totalActivities > 0 ? Math.round((totalActivities / (activeClasses * 8)) * 100) : 0;

        setTeacherStats({
          totalStudents,
          activeClasses,
          totalActivities,
          completionRate,
          pendingSubmissions: pendingCount || 0,
          upcomingDeadlines: activities?.filter(a => a.due_date && new Date(a.due_date) > new Date()).length || 0
        });

        // Format recent activities
        const formattedActivities = activities?.map(activity => ({
          id: activity.id,
          type: activity.type || 'assignment',
          title: activity.title,
          description: `Turma: ${activity.classes?.name}`,
          time: new Date(activity.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          icon: FileText,
          color: 'blue',
          classId: activity.class_id
        })) || [];

        setRecentActivities(formattedActivities);
      } catch (error) {
        Logger.error('Error loading teacher dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
  }, [user?.id, teacherClasses]);

  const stats = [
    {
      icon: Users,
      label: 'Total de Alunos',
      value: teacherStats.totalStudents.toString(),
      change: '+12%',
      changeType: 'positive',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: GraduationCap,
      label: 'Turmas Ativas',
      value: teacherStats.activeClasses.toString(),
      change: '+2',
      changeType: 'positive',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: FileText,
      label: 'Atividades Criadas',
      value: teacherStats.totalActivities.toString(),
      change: '+5',
      changeType: 'positive',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      label: 'Taxa de Conclusão',
      value: `${teacherStats.completionRate}%`,
      change: '+3%',
      changeType: 'positive',
      gradient: 'from-orange-500 to-red-500'
    },
  ];

  const quickActions = [
    {
      icon: GraduationCap,
      label: 'Nova Turma',
      description: 'Criar uma nova turma',
      gradient: 'from-blue-500 to-cyan-500',
      action: () => navigate('/dashboard/classes/new')
    },
    {
      icon: FileText,
      label: 'Nova Atividade',
      description: 'Criar atividade interativa',
      gradient: 'from-green-500 to-emerald-500',
      action: () => navigate('/dashboard/activities/create')
    },
    {
      icon: Brain,
      label: 'Chatbot IA',
      description: 'Configurar assistente',
      gradient: 'from-purple-500 to-pink-500',
      action: () => navigate('/dashboard/chatbot')
    },
    {
      icon: BarChart3,
      label: 'Relatórios',
      description: 'Ver analytics detalhados',
      gradient: 'from-orange-500 to-red-500',
      action: () => navigate('/dashboard/reports')
    },
    {
      icon: Calendar,
      label: 'Agenda',
      description: 'Ver agenda educacional',
      gradient: 'from-indigo-500 to-blue-500',
      action: () => navigate('/dashboard/calendar')
    },
    {
      icon: Settings,
      label: 'Configurações',
      description: 'Gerenciar configurações',
      gradient: 'from-gray-500 to-gray-600',
      action: () => navigate('/dashboard/settings')
    },
  ];

  const upcomingDeadlines = [
    { title: 'Prova de Matemática', class: '9A', date: '2023-10-15', daysLeft: 3, priority: 'high' },
    { title: 'Trabalho de História', class: '8B', date: '2023-10-18', daysLeft: 6, priority: 'medium' },
    { title: 'Apresentação de Ciências', class: '7C', date: '2023-10-20', daysLeft: 8, priority: 'low' },
  ];

  if (loading || classesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-muted-foreground">Carregando dados do professor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                Bem-vindo, Professor(a) {user?.name || user?.user_metadata?.full_name || 'Docente'}! 👨‍🏫
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Gerencie suas turmas, crie atividades e acompanhe o progresso dos seus alunos.
                Continue transformando a educação com IA!
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Brain className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl"></div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group"
          >
            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Atividades Recentes</CardTitle>
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => navigate('/dashboard/activities')}
                >
                  Ver todas
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/dashboard/activities/${activity.id}`)}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${
                        activity.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                        activity.color === 'green' ? 'from-green-500 to-emerald-500' :
                        activity.color === 'purple' ? 'from-purple-500 to-pink-500' :
                        'from-orange-500 to-red-500'
                      } rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <activity.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {activity.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{activity.description}</p>
                        <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma atividade recente encontrada</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/dashboard/activities/create')}
                    >
                      Criar Primeira Atividade
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Próximos Prazos</CardTitle>
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {deadline.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Turma {deadline.class}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                        deadline.daysLeft <= 3 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        deadline.daysLeft <= 7 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      }`}>
                        {deadline.daysLeft} dias
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{deadline.date}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all transform hover:-translate-y-1"
                  onClick={action.action}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{action.description}</p>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending Submissions Alert */}
      {teacherStats.pendingSubmissions > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                      Submissões Pendentes
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Você tem {teacherStats.pendingSubmissions} atividade(s) para corrigir
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/30"
                  onClick={() => navigate('/dashboard/activities')}
                >
                  Ver Submissões
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default TeacherDashboard;
