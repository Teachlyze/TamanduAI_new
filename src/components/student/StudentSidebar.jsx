import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  BookOpen,
  Trophy,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  BarChart3,
  Zap,
  Sparkles,
  Bell,
  Star,
  Users,
  Target,
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

const StudentSidebar = ({ collapsed, setCollapsed }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [gamification, setGamification] = useState({ xp: 0, level: 1, streak: 0 });
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
      loadGamificationData();
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

  const loadGamificationData = async () => {
    try {
      const { data } = await supabase
        .from('gamification_profiles')
        .select('xp_total, level, current_streak')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setGamification({
          xp: data.xp_total || 0,
          level: data.level || 1,
          streak: data.current_streak || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar gamificação:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setNotifications(count || 0);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: '/students',
      tourId: 'nav-student-dashboard',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Minhas Turmas',
      icon: Users,
      path: '/students/classes',
      tourId: 'nav-student-classes',
      gradient: 'from-teal-500 to-emerald-500'
    },
    {
      label: 'Minhas Atividades',
      icon: FileText,
      path: '/students/activities',
      tourId: 'nav-student-activities',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Gamificação',
      icon: Trophy,
      path: '/students/gamification',
      tourId: 'nav-student-gamification',
      gradient: 'from-yellow-500 to-orange-500',
      badge: gamification.level
    },
    {
      label: 'Meu Desempenho',
      icon: BarChart3,
      path: '/students/performance',
      tourId: 'nav-student-performance',
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      label: 'Agenda',
      icon: Calendar,
      path: '/students/calendar',
      tourId: 'nav-student-calendar',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Ranking',
      icon: BarChart3,
      path: '/students/ranking',
      tourId: 'nav-student-ranking',
      gradient: 'from-amber-500 to-yellow-500'
    },
    {
      label: 'Missões',
      icon: Target,
      path: '/students/missions',
      tourId: 'nav-student-missions',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      label: 'Histórico',
      icon: FileText,
      path: '/students/history',
      tourId: 'nav-student-history',
      gradient: 'from-slate-500 to-gray-600'
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
      className="fixed left-0 top-0 h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border-r border-blue-200/50 dark:border-blue-700/50 backdrop-blur-xl z-40 shadow-2xl"
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
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      TamanduAI
                    </h2>
                    <p className="text-xs text-muted-foreground">Aluno</p>
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
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
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
                  <DropdownMenuItem onClick={() => navigate('/students/settings')}>
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
                  onClick={() => navigate('/students/notifications')}
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

        {/* Perfil do Estudante */}
        {collapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <Badge className="bg-primary/10 text-primary text-xs px-2 py-0.5">
              <Zap className="w-3 h-3" />
            </Badge>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }} />
            </div>

            <div className="relative z-10">
              {/* Gamification Stats no topo */}
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Nível {gamification.level}
                </Badge>
                {gamification.streak > 0 && (
                  <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white text-xs">
                    🔥 {gamification.streak}d
                  </Badge>
                )}
              </div>

              {/* Header de Perfil */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {user?.user_metadata?.name?.split(' ')[0] || 'Estudante'}
                  </p>
                  <p className="text-xs text-white/80 truncate">{user?.email}</p>
                </div>
              </div>

              {/* XP Progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/90 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    XP
                  </span>
                  <span className="font-bold">{gamification.xp % 100}/100</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(gamification.xp % 100)}%` }}
                    transition={{ duration: 1, type: 'spring' }}
                    className="h-full bg-gradient-to-r from-yellow-300 via-yellow-200 to-white rounded-full shadow-lg"
                  />
                </div>
                <p className="text-xs text-white/70 mt-1 text-center">
                  {100 - (gamification.xp % 100)} XP para próximo nível
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-1.5 rounded-lg bg-white/10 backdrop-blur-sm"
                >
                  <div className="text-sm font-bold text-yellow-300">{gamification.badges || 0}</div>
                  <div className="text-xs text-white/80">Badges</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-1.5 rounded-lg bg-white/10 backdrop-blur-sm"
                >
                  <div className="text-sm font-bold text-green-300">{gamification.completed || 0}</div>
                  <div className="text-xs text-white/80">Concluídas</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-1.5 rounded-lg bg-white/10 backdrop-blur-sm"
                >
                  <div className="text-sm font-bold text-blue-300">{gamification.rank || '-'}</div>
                  <div className="text-xs text-white/80">Ranking</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-700 scrollbar-track-transparent">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/students'}
                data-tour-id={item.tourId || undefined}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg scale-105'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground'
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

export default StudentSidebar;
