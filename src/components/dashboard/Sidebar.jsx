import React, { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  LogOut,
  Zap,
  HelpCircle,
  X,
  Calendar
} from 'lucide-react';

import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/lib/supabaseClient';

  const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [role, setRole] = useState(null); // Null até carregar

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) return;
      try {
        // Get role from user metadata or profiles table
        if (user.user_metadata?.role) {
          if (mounted) setRole(user.user_metadata.role);
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        if (!mounted) return;
        if (error) {
          // Se der erro, default para student (mais seguro)
          console.warn('[Sidebar] Erro ao buscar role, defaulting para student:', error);
          setRole('student');
          return;
        }
        setRole(data?.role || 'student');
      } catch (err) {
        console.error('[Sidebar] Erro inesperado:', err);
        if (mounted) setRole('student'); // Sempre defaultar para student (mais seguro)
      }
    })();
  return () => { mounted = false; };
  }, [user?.id, user?.user_metadata?.role]);

  const teacherNav = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', tourId: 'nav-dashboard' },
    { name: 'Turmas', icon: Users, path: '/dashboard/classes', tourId: 'nav-classes' },
    { name: 'Reuniões', icon: Calendar, path: '/dashboard/meetings', disabled: true, tooltip: 'em construção', tourId: 'nav-meetings' },
    { name: 'Alunos', icon: Users, path: '/dashboard/students', tourId: 'nav-students' },
    { name: 'Agenda', icon: Calendar, path: '/dashboard/calendar', tourId: 'nav-calendar' },
    { name: 'Atividades', icon: BookOpen, path: '/dashboard/activities', tourId: 'nav-activities' },
    { name: 'Rascunhos', icon: BookOpen, path: '/dashboard/activities/drafts', tourId: 'nav-activities-drafts' },
    { name: 'Relatórios', icon: BarChart3, path: '/dashboard/reports', tourId: 'nav-reports' },
    { name: 'Chatbot', icon: MessageSquare, path: '/dashboard/chatbot', tourId: 'nav-chatbot' },
  ];

  const studentNav = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/students', tourId: 'nav-student-dashboard' },
    { name: 'Agenda', icon: Calendar, path: '/students/calendar', tourId: 'nav-student-calendar' },
    { name: 'Minhas Turmas', icon: Users, path: '/students/classes', tourId: 'nav-student-classes' },
    { name: 'Minhas Atividades', icon: BookOpen, path: '/students/activities', tourId: 'nav-student-activities' },
    { name: 'Gamificação', icon: Zap, path: '/students/gamification', tourId: 'nav-student-gamification' },
  ];

  const schoolNav = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/school', tourId: 'nav-school-dashboard' },
    { name: 'Professores', icon: Users, path: '/school/teachers', tourId: 'nav-school-teachers' },
    { name: 'Turmas', icon: Users, path: '/school/classes', tourId: 'nav-school-classes' },
    { name: 'Relatórios', icon: BarChart3, path: '/school/reports', tourId: 'nav-school-reports' },
    { name: 'Comunicados', icon: MessageSquare, path: '/school/comms', tourId: 'nav-school-comms' },
    { name: 'Configurações', icon: Settings, path: '/school/settings', tourId: 'nav-school-settings' },
  ];

  const navItems = role === 'teacher' ? teacherNav : (role === 'school' ? schoolNav : studentNav);

  const getBottomItems = () => {
    const settingsPath = role === 'school' ? '/school/settings' : '/dashboard/settings';
    return [
      { name: 'Ajuda', icon: HelpCircle, path: '/docs' },
      { name: 'Configurações', icon: Settings, path: settingsPath },
      { name: 'Sair', icon: LogOut, path: '/logout' },
    ];
  };

  const bottomItems = getBottomItems();
  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      <div 
        className={`bg-gradient-to-b from-card to-card/95 border-r border-border/50 shadow-xl min-h-screen h-full z-40 flex flex-col ${open ? 'w-64 lg:w-64' : 'w-64 lg:w-16'} fixed lg:sticky lg:top-0 lg:translate-x-0 transform transition-all duration-500 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)'
        }}
      >
        <div className="p-4 flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5 text-white hover:opacity-90">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center mr-2 shadow-lg">
              <Zap className="w-5 h-5 text-slate-900 dark:text-white" />
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent ${open ? '' : 'lg:hidden'}`}>
              TamanduAI
            </span>
          </div>
          <button 
            className="lg:hidden p-1 rounded-md hover:bg-muted transition-colors" 
            onClick={() => setOpen(false)}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto pb-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.name}>
                {item.disabled ? (
                  <div
                    className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground/50 cursor-not-allowed rounded-md mx-2 my-1"
                    title={item.tooltip}
                  >
                    <item.icon className={`w-5 h-5 text-muted-foreground/30 ${open ? 'mr-3' : 'lg:mx-auto'}`} />
                    <span className={`${open ? '' : 'lg:hidden'}`}>{item.name}</span>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center ${open ? '' : 'lg:justify-center'} px-4 py-3 text-sm font-medium transition-all duration-200 rounded-xl mx-2 my-1
              ${location.pathname === item.path 
                ? 'bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary shadow-sm border border-primary/20' 
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:shadow-sm'
              }`}
                    data-tour-id={item.tourId || undefined}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setOpen(false);
                      }
                    }}
                  >
                    <item.icon className={`w-5 h-5 ${open ? 'mr-3' : 'lg:mx-auto'}`} />
                    <span className={`${open ? '' : 'lg:hidden'}`}>{item.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-2 border-t border-border/50 mt-auto">
          <ul>
            {bottomItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center ${open ? '' : 'lg:justify-center'} px-4 py-3 text-sm font-medium transition-all duration-200 rounded-xl mx-2 my-1
            ${location.pathname === item.path 
              ? 'bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary shadow-sm border border-primary/20' 
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:shadow-sm'
            }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setOpen(false);
                    }
                  }}
                >
                  <item.icon className={`w-5 h-5 ${open ? 'mr-3' : 'lg:mx-auto'}`} />
                  <span className={`${open ? '' : 'lg:hidden'}`}>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
