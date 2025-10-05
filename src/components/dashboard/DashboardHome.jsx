import React from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserClasses } from '../../hooks/useRedisCache';

// Hook para buscar dados do dashboard
const useDashboardData = (userId) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/dashboard/stats?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  return { data, loading, error };
};

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: userClasses, loading: classesLoading } = useUserClasses(user?.id);
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboardData(user?.id);

  // Calculate stats from API data or fallback to classes data
  const calculateStats = () => {
    if (dashboardData?.stats) {
      return dashboardData.stats;
    }

    if (!userClasses || classesLoading) {
      // Valores padrão configuráveis via variáveis de ambiente
      const defaultStudents = parseInt(import.meta.env.VITE_DEFAULT_TOTAL_STUDENTS || '0');
      const defaultClasses = parseInt(import.meta.env.VITE_DEFAULT_TOTAL_CLASSES || '0');
      const defaultActivities = parseInt(import.meta.env.VITE_DEFAULT_TOTAL_ACTIVITIES || '0');
      const defaultCompletionRate = parseInt(import.meta.env.VITE_DEFAULT_COMPLETION_RATE || '0');

      return [
        {
          icon: Users,
          label: 'Total de Alunos',
          value: defaultStudents.toString(),
          change: `+${import.meta.env.VITE_MOCK_STUDENTS_CHANGE_PERCENTAGE || '12'}%`,
          changeType: 'positive',
          gradient: 'from-blue-500 to-cyan-500'
        },
        {
          icon: GraduationCap,
          label: 'Turmas Ativas',
          value: defaultClasses.toString(),
          change: `+${import.meta.env.VITE_MOCK_CLASSES_CHANGE_PERCENTAGE || '2'}`,
          changeType: 'positive',
          gradient: 'from-green-500 to-emerald-500'
        },
        {
          icon: FileText,
          label: 'Atividades',
          value: defaultActivities.toString(),
          change: `+${import.meta.env.VITE_MOCK_ACTIVITIES_CHANGE_PERCENTAGE || '5'}`,
          changeType: 'positive',
          gradient: 'from-purple-500 to-pink-500'
        },
        {
          icon: TrendingUp,
          label: 'Taxa de Conclusão',
          value: `${defaultCompletionRate}%`,
          change: `+${import.meta.env.VITE_MOCK_COMPLETION_RATE_CHANGE_PERCENTAGE || '3'}%`,
          changeType: 'positive',
          gradient: 'from-orange-500 to-red-500'
        },
      ];
    }

    const totalStudents = userClasses.reduce((sum, cls) => sum + (cls.students_count || 0), 0);
    const totalClasses = userClasses.length;
    const totalActivities = userClasses.reduce((sum, cls) => sum + (cls.activities_count || 0), 0);
    const avgCompletion = totalActivities > 0 ? Math.round((totalActivities / (totalClasses * 10)) * 100) : 0;

    return [
      {
        icon: Users,
        label: 'Total de Alunos',
        value: totalStudents.toString(),
        change: `+${import.meta.env.VITE_MOCK_STUDENTS_CHANGE_PERCENTAGE || '12'}%`,
        changeType: 'positive',
        gradient: 'from-blue-500 to-cyan-500'
      },
      {
        icon: GraduationCap,
        label: 'Turmas Ativas',
        value: totalClasses.toString(),
        change: `+${import.meta.env.VITE_MOCK_CLASSES_CHANGE_PERCENTAGE || '2'}`,
        changeType: 'positive',
        gradient: 'from-green-500 to-emerald-500'
      },
      {
        icon: FileText,
        label: 'Atividades',
        value: totalActivities.toString(),
        change: `+${import.meta.env.VITE_MOCK_ACTIVITIES_CHANGE_PERCENTAGE || '5'}`,
        changeType: 'positive',
        gradient: 'from-purple-500 to-pink-500'
      },
      {
        icon: TrendingUp,
        label: 'Taxa de Conclusão',
        value: `${avgCompletion}%`,
        change: `+${import.meta.env.VITE_MOCK_COMPLETION_RATE_CHANGE_PERCENTAGE || '3'}%`,
        changeType: 'positive',
        gradient: 'from-orange-500 to-red-500'
      },
    ];
  };

  const stats = calculateStats();
  const recentActivities = dashboardData?.recentActivities || [];
  const upcomingDeadlines = dashboardData?.upcomingDeadlines || [];

  const quickActions = [
    {
      icon: GraduationCap,
      label: 'Nova Turma',
      description: 'Criar uma nova turma',
      gradient: 'from-blue-500 to-cyan-500',
      action: () => navigate('/dashboard/classes')
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
  ];

  if (dashboardLoading || classesLoading) {
    return (
      <div className="w-full space-y-8">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-3xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="w-full space-y-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Erro ao carregar dados do dashboard
              </h3>
              <p className="text-red-600 dark:text-red-300">{dashboardError}</p>
            </div>
          </div>
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
                Bem-vindo de volta, {user?.name}! 👋
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Aqui está um resumo das suas atividades educacionais hoje.
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
            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
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
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Atividades Recentes</h2>
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => navigate('/dashboard/activities')}
            >
              Ver todas
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
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
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma atividade recente encontrada</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Próximos Prazos</h2>
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-4">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((deadline, index) => (
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
                    <div className="text-xs text-gray-400 mt-1">{new Date(deadline.date).toLocaleDateString('pt-BR')}</div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum prazo próximo encontrado</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </motion.div>
    </div>
  );
};

export default DashboardHome;
