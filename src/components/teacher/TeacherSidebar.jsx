import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  BookOpen,
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  ClipboardCheck,
  Calendar,
  MessageCircle,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Bell,
  Menu,
  Bot,
  FileEdit,
  Target,
  CheckCircle,
  User,
  Moon,
  Sun,
  Clock,
  ChevronDown
} from 'lucide-react';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

  const TeacherSidebar = ({ collapsed, setCollapsed }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ classes: 0, students: 0, activities: 0 });
  const [notifications, setNotifications] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (user) {
      loadTeacherStats();
      loadNotifications();
    }
  }, [user]);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    if (loading) return <LoadingScreen />;

  return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    }).format(date).replace(',', ' •');
  };

  const loadTeacherStats = async () => {
    try {
      // Buscar turmas do professor
      const { count: classCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      // Buscar atividades
      const { count: activityCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      // Buscar alunos (via class_members)
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('created_by', user.id);

      let studentCount = 0;
      if (classes && classes.length > 0) {
        const classIds = classes.map(c => c.id);
        const { count } = await supabase
          .from('class_members')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
          .eq('role', 'student');
        studentCount = count || 0;
      }

      setStats({
        classes: classCount || 0,
        students: studentCount,
        activities: activityCount || 0
      });
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .range(0, 499);
      if (error) throw error;
      setNotifications(data?.length || 0);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Turmas',
      icon: Users,
      path: '/dashboard/classes',
      gradient: 'from-blue-500 to-cyan-500',
      badge: stats.classes
    },
    {
      label: 'Atividades',
      icon: FileText,
      path: '/dashboard/activities',
      gradient: 'from-purple-500 to-pink-500',
      badge: stats.activities
    },
    {
      label: 'Correções',
      icon: CheckCircle,
      path: '/dashboard/corrections',
      gradient: 'from-red-500 to-orange-500',
      badge: stats.pendingCorrections || 0
    },
    {
      label: 'Alunos',
      icon: GraduationCap,
      path: '/dashboard/students',
      gradient: 'from-green-500 to-emerald-500',
      badge: stats.students
    },
    {
      label: 'Ranking',
      icon: TrendingUp,
      path: '/dashboard/ranking',
      gradient: 'from-yellow-500 to-amber-500'
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      path: '/dashboard/analytics',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      label: 'Analytics Avançado',
      icon: TrendingUp,
      path: '/dashboard/analytics-advanced',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      label: 'Banco de Questões',
      icon: BookOpen,
      path: '/dashboard/question-bank',
      gradient: 'from-purple-500 to-indigo-500',
      badge: 'Novo'
    },
    {
      label: 'Relatórios',
      icon: ClipboardCheck,
      path: '/dashboard/reports',
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Agenda',
      icon: Calendar,
      path: '/dashboard/calendar',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      label: 'Chatbot IA',
      icon: MessageCircle,
      path: '/dashboard/chatbot',
      gradient: 'from-indigo-500 to-blue-500',
      badge: '24/7'
    },
    {
      label: 'Chatbot (Config.)',
      icon: Bot,
      path: '/dashboard/chatbot/settings',
      gradient: 'from-fuchsia-500 to-purple-500'
    },
    {
      label: 'Rascunhos',
      icon: FileEdit,
      path: '/dashboard/drafts',
      gradient: 'from-gray-500 to-slate-500'
    },
    {
      label: 'Missões',
      icon: Target,
      path: '/dashboard/missions',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) return <LoadingScreen />;

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0, width: collapsed ? 80 : 280 }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed left-0 top-0 h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-cyan-900/30 border-r border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-xl z-40 shadow-xl"
    >
      <div className="flex flex-col h-full p-4">
        {/* Header com Logo, Toggle, Actions */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-white hover:opacity-90">
                      TamanduAI
                    </h2>
                    <p className="text-xs text-muted-foreground">Professor</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Header Actions */}
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-2 px-2"
            >
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs truncate max-w-[80px]">
                      {user?.user_metadata?.name?.split(' ')[0] || 'Perfil'}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile/edit')}>
                    <User className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-1">
                {/* Date/Time */}
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatDateTime(currentTime)}</span>
                </div>

                {/* Theme Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.button>

                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate('/dashboard/notifications')}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors relative"
                  title="Notificações"
                >
                  <Bell className="w-4 h-4" />
                  {notifications > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    >
                      {notifications > 9 ? '9+' : notifications}
                    </motion.div>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Perfil do Professor */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    Prof. {user?.user_metadata?.name?.split(' ')[0] || 'Professor'}
                  </p>
                  <p className="text-xs text-white/80 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Stats Rápidos com Animação */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-2 rounded-lg bg-white/10 backdrop-blur-sm"
                >
                  <div className="text-lg font-bold text-yellow-300">{stats.classes}</div>
                  <div className="text-xs text-white/80">Turmas</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-2 rounded-lg bg-white/10 backdrop-blur-sm"
                >
                  <div className="text-lg font-bold text-blue-300">{stats.students}</div>
                  <div className="text-xs text-white/80">Alunos</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-2 rounded-lg bg-white/10 backdrop-blur-sm"
                >
                  <div className="text-lg font-bold text-green-300">{stats.activities}</div>
                  <div className="text-xs text-white/80">Atividades</div>
                </motion.div>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-3 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard/activities/new')}
                  className="flex-1 px-2 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
                  title="Nova Atividade"
                >
                  + Atividade
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard/classes/new')}
                  className="flex-1 px-2 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
                  title="Nova Turma"
                >
                  + Turma
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-emerald-300 dark:scrollbar-thumb-emerald-700 scrollbar-track-transparent">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            if (loading) return <LoadingScreen />;

  return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg scale-105'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-2 rounded-lg ${
                        isActive ? 'bg-white/20' : 'bg-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex-1 flex items-center justify-between"
                        >
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge className={`${
                              isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                            } text-xs`}>
                              {item.badge}
                            </Badge>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer - Apenas Logout */}
        <div className="pt-3 border-t border-border/50">
          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-600 transition-all ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="p-2 rounded-lg bg-muted">
              <LogOut className="w-5 h-5" />
            </div>
            {!collapsed && <span className="font-medium">Sair</span>}
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};

export default TeacherSidebar;
