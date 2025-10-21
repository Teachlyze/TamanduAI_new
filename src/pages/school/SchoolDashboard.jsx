import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Award,
  AlertTriangle,
  Calendar,
  BarChart3,
  UserPlus,
  FileText,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import schoolService from '@/services/schoolService';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard, StatsCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

const SchoolDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalActivities: 0,
    activeTeachers: 0,
    averageClassSize: 0,
    engagementRate: 0,
    growthRate: 0
  });
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [topClasses, setTopClasses] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Obter schoolId utilizando SchoolService (evita depender de profiles.school_id)
      const schoolInfo = await schoolService.getUserSchool(user.id);
      const schoolId = schoolInfo?.id || null;

      if (!schoolId) {
        // Sem school_id não há como carregar dashboard; manter dados zerados
        setStats(s => ({ ...s, totalTeachers: 0, totalStudents: 0, totalClasses: 0, totalActivities: 0 }));
        setRecentTeachers([]);
        setTopClasses([]);
        setAlerts([]);
        return;
      }

      // Buscar dados consolidados via service
      const statsData = await schoolService.getDashboardStats(schoolId);
      const teachers = await schoolService.getTeachers(schoolId);
      const classes = await schoolService.getClasses(schoolId);
      const topClassesSorted = (classes || [])
        .sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0))
        .slice(0, 5);

      setStats({
        totalTeachers: teachers?.length || 0,
        totalStudents: statsData?.totalStudents || 0,
        totalClasses: statsData?.totalClasses || (classes?.length || 0),
        totalActivities: statsData?.submissionsLast30Days || 0,
        activeTeachers: teachers?.length || 0,
        averageClassSize: statsData?.totalClasses > 0 ? Math.round((statsData.totalStudents || 0) / statsData.totalClasses) : 0,
        engagementRate: 87,
        growthRate: 12
      });

      setRecentTeachers(teachers?.slice(0, 5) || []);
      setTopClasses(topClassesSorted);

      // Alertas mock - implementar lógica real
      setAlerts([
        { id: 1, type: 'warning', message: '3 professores sem turmas ativas', action: '/school/teachers' },
        { id: 2, type: 'info', message: '5 novos alunos aguardando aprovação', action: '/school/students' }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando painel administrativo..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-gray-800 to-slate-900 p-8 text-white"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
          >
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium">Painel Administrativo</span>
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">
            Olá, {user?.user_metadata?.name?.split(' ')[0] || 'Administrador'}! 🏫
          </h1>
          <p className="text-white/90 text-lg">
            Gerencie toda a operação educacional da sua escola
          </p>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-20 right-32 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl"
        />
      </motion.div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Professores",
            value: stats.totalTeachers,
            icon: Users,
            gradient: "from-blue-600 to-indigo-700",
            change: "+3 este mês",
            positive: true
          },
          {
            title: "Alunos",
            value: stats.totalStudents,
            icon: GraduationCap,
            gradient: "from-green-600 to-teal-700",
            change: "+15 este mês",
            positive: true
          },
          {
            title: "Turmas",
            value: stats.totalClasses,
            icon: BookOpen,
            gradient: "from-purple-600 to-indigo-700",
            change: "+2 este mês",
            positive: true
          },
          {
            title: "Atividades",
            value: stats.totalActivities,
            icon: FileText,
            gradient: "from-orange-600 to-red-700",
            change: "+12 esta semana",
            positive: true
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremiumCard variant="elevated" className="relative overflow-hidden group hover:scale-105 transition-transform">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  {stat.change && (
                    <div className={`flex items-center gap-1 text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Média/Turma", value: stats.averageClassSize, icon: Target, color: "text-blue-600" },
          { title: "Taxa de Engajamento", value: `${stats.engagementRate}%`, icon: Activity, color: "text-green-600" },
          { title: "Crescimento", value: `+${stats.growthRate}%`, icon: TrendingUp, color: "text-purple-600" },
          { title: "Profs Ativos", value: stats.activeTeachers, icon: Zap, color: "text-orange-600" }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <PremiumCard className="p-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.title}</div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PremiumCard variant="elevated" className="p-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Alertas e Notificações
            </h3>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(alert.action)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.type === 'warning' ? 'bg-orange-600' : 'bg-blue-600'
                    }`} />
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <PremiumButton size="sm" variant="ghost" className="whitespace-nowrap inline-flex items-center gap-2 rounded-lg">
                    Ver
                  </PremiumButton>
                </div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Teachers */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <PremiumCard variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Professores Recentes</h3>
                <p className="text-sm text-muted-foreground">Últimos cadastros</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {recentTeachers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum professor cadastrado"
                description="Adicione professores para começar"
              />
            ) : (
              <div className="space-y-3">
                {recentTeachers.map((teacher, index) => (
                  <motion.div
                    key={teacher.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/school/teachers/${teacher.id}`)}
                    className="group flex items-center gap-3 p-3 border-2 border-border rounded-xl hover:border-primary/50 hover:bg-gradient-to-r text-white hover:opacity-90 whitespace-nowrap inline-flex gap-2 min-w-fit hover:from-muted/50 hover:to-transparent transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold">
                      {teacher.name?.charAt(0) || 'P'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{teacher.name}</h4>
                      <p className="text-xs text-muted-foreground">{teacher.email}</p>
                    </div>
                    <Badge variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs">
                      {new Date(teacher.created_at).toLocaleDateString('pt-BR')}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}

            <PremiumButton
              variant="outline"
              className="w-full mt-4 whitespace-nowrap inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
              leftIcon={UserPlus}
              onClick={() => navigate('/school/teachers')}
            >
              Gerenciar Professores
            </PremiumButton>
          </PremiumCard>
        </motion.div>

        {/* Top Classes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <PremiumCard variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Turmas Principais</h3>
                <p className="text-sm text-muted-foreground">Por número de alunos</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            {topClasses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Nenhuma turma criada"
                description="Professores podem criar turmas"
              />
            ) : (
              <div className="space-y-3">
                {topClasses.map((cls, index) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 border-2 border-border rounded-xl hover:border-primary/50 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cls.color || 'from-purple-600 to-indigo-700'} flex items-center justify-center text-white font-bold`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{cls.name}</h4>
                      <p className="text-xs text-muted-foreground">{cls.subject}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{cls.studentCount}</div>
                      <div className="text-xs text-muted-foreground">alunos</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <PremiumButton
              variant="outline"
              className="w-full mt-4 whitespace-nowrap inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
              leftIcon={BarChart3}
              onClick={() => navigate('/school/classes')}
            >
              Ver Todas as Turmas
            </PremiumButton>
          </PremiumCard>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: UserPlus, label: 'Novo Professor', path: '/school/teachers/new', gradient: 'from-blue-600 to-indigo-700' },
            { icon: BarChart3, label: 'Analytics', path: '/school/analytics-advanced', gradient: 'from-orange-600 to-red-700' },
            { icon: FileText, label: 'Relatórios', path: '/school/reports', gradient: 'from-green-600 to-teal-700' },
            { icon: DollarSign, label: 'Financeiro', path: '/school/billing', gradient: 'from-amber-600 to-orange-700' }
          ].map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              className="cursor-pointer"
            >
              <PremiumCard variant="elevated" className="p-6 text-center hover:shadow-xl transition-all">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white`}>
                  <action.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg">{action.label}</h3>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SchoolDashboard;
