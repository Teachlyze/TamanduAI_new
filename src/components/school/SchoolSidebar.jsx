import React, { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Building2,
  Users,
  GraduationCap,
  BarChart3,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  TrendingUp,
  UserCheck,
  BookOpen,
  Bell,
  Briefcase,
  Mail,
  Gift,
  User,
  Brain,
  Moon,
  Sun,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import schoolService from '@/services/schoolService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

  const SchoolSidebar = ({ collapsed, setCollapsed }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ teachers: 0, students: 0, classes: 0 });
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
      loadSchoolStats();
      loadNotifications();
    }
  }, [user]);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
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

  const loadSchoolStats = async () => {
    try {
      // Obter school ID usando schoolService
      const schoolInfo = await schoolService.getUserSchool(user.id);
      const schoolId = schoolInfo?.id;

      if (!schoolId) {
        console.warn('School ID não encontrado');
        return;
      }

      // Buscar professores via school_teachers
      const { count: teacherCount } = await supabase
        .from('school_teachers')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('status', 'active');

      // Buscar turmas via school_classes
      const { data: schoolClasses } = await supabase
        .from('school_classes')
        .select('class_id')
        .eq('school_id', schoolId);
      
      const classCount = schoolClasses?.length || 0;

      // Buscar alunos via class_members
      let studentCount = 0;
      if (classCount > 0) {
        const classIds = schoolClasses.map(sc => sc.class_id);
          const { count } = await supabase
            .from('class_members')
            .select('*', { count: 'exact', head: true })
            .in('class_id', classIds)
            .eq('role', 'student');
          studentCount = count || 0;
        }

      setStats({
        teachers: teacherCount || 0,
        students: studentCount,
        classes: classCount || 0
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
      path: '/school',
      tourId: 'nav-school-dashboard',
      gradient: 'from-slate-600 to-gray-700'
    },
    {
      label: 'Professores',
      icon: UserCheck,
      path: '/school/teachers',
      tourId: 'nav-school-teachers',
      gradient: 'from-blue-600 to-indigo-700',
      badge: stats.teachers
    },
    {
      label: 'Convidar Professor',
      icon: Mail,
      path: '/school/invite-teacher',
      tourId: 'nav-school-invite',
      gradient: 'from-indigo-600 to-purple-600'
    },
    {
      label: 'Turmas',
      icon: BookOpen,
      path: '/school/classes',
      tourId: 'nav-school-classes',
      gradient: 'from-purple-600 to-pink-700',
      badge: stats.classes
    },
    {
      label: 'Alunos',
      icon: GraduationCap,
      path: '/school/students',
      tourId: 'nav-school-students',
      gradient: 'from-green-600 to-teal-700',
      badge: stats.students
    },
    {
      label: 'Ranking',
      icon: TrendingUp,
      path: '/school/ranking',
      tourId: 'nav-school-ranking',
      gradient: 'from-yellow-600 to-amber-700'
    },
    {
      label: 'Analytics ML',
      icon: Brain,
      path: '/school/analytics-ml',
      tourId: 'nav-school-analytics-ml',
      gradient: 'from-rose-600 to-red-700',
      badge: 'IA'
    },
    {
      label: 'Relatórios',
      icon: FileText,
      path: '/school/reports',
      tourId: 'nav-school-reports',
      gradient: 'from-cyan-600 to-blue-700'
    },
    {
      label: 'Recompensas',
      icon: Gift,
      path: '/school/rewards',
      tourId: 'nav-school-rewards',
      gradient: 'from-orange-600 to-yellow-600'
    },
    {
      label: 'Comunicações',
      icon: Briefcase,
      path: '/school/comms',
      tourId: 'nav-school-comms',
      gradient: 'from-violet-600 to-purple-700'
    }
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0, width: collapsed ? 80 : 280 }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-gray-950 dark:to-black border-r border-slate-200 dark:border-slate-700/50 backdrop-blur-xl z-40 shadow-2xl"
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
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      TamanduAI
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-gray-300">Administração Escolar</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
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
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs truncate max-w-[80px] text-slate-900 dark:text-white">
                      {user?.user_metadata?.school_name?.split(' ')[0] || 'Escola'}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile/edit')}>
                    <User className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/school/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-1">
                {/* Date/Time */}
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-gray-300">
                  <Clock className="w-3 h-3" />
                  <span>{formatDateTime(currentTime)}</span>
                </div>

                {/* Theme Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                  title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.button>

                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate('/dashboard/notifications')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative text-slate-700 dark:text-slate-300"
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

        {/* Perfil da Escola */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 dark:from-amber-600/20 dark:via-orange-600/20 dark:to-red-600/20 border border-amber-300 dark:border-amber-500/30 text-slate-900 dark:text-white relative overflow-hidden backdrop-blur-sm"
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
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {user?.user_metadata?.school_name || 'Escola'}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-white/80 truncate">Administrador</p>
                </div>
              </div>

              {/* Stats Rápidos */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.teachers}</div>
                  <div className="text-xs text-slate-700 dark:text-white/80">Profs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.classes}</div>
                  <div className="text-xs text-slate-700 dark:text-white/80">Turmas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.students}</div>
                  <div className="text-xs text-slate-700 dark:text-white/80">Alunos</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navItems.map((item, index) => {
            const Icon = item.icon;
  return (
              <NavLink
                key={item.path}
                to={item.path}
                data-tour-id={item.tourId || undefined}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg scale-105'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-2 rounded-lg ${
                        isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
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
                          <span className="font-medium text-sm">{item.label}</span>
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
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300 hover:text-red-600 transition-all ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
              <LogOut className="w-5 h-5" />
            </div>
            {!collapsed && <span className="font-medium text-sm">Sair</span>}
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};

export default SchoolSidebar;
