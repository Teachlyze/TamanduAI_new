import React, { useEffect, useState } from 'react';
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
  const [role, setRole] = useState('student');

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!mounted) return;
        if (error) {
          // If table doesn't exist or RLS blocks, do not block UI; default to teacher
          setRole('teacher');
          return;
        }
        setRole(data?.role || 'teacher');
      } catch (_) {
        if (mounted) setRole('teacher');
      }
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  const teacherNav = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Turmas', icon: Users, path: '/dashboard/classes' },
    { name: 'Reuniões', icon: Calendar, path: '/dashboard/meetings', disabled: true, tooltip: 'em construção' },
    { name: 'Alunos', icon: Users, path: '/dashboard/students' },
    { name: 'Agenda', icon: Calendar, path: '/dashboard/calendar' },
    { name: 'Atividades', icon: BookOpen, path: '/dashboard/activities' },
    { name: 'Rascunhos', icon: BookOpen, path: '/dashboard/activities/drafts' },
    { name: 'Relatórios', icon: BarChart3, path: '/dashboard/reports' },
    { name: 'Chatbot', icon: MessageSquare, path: '/dashboard/chatbot' },
  ];

  const studentNav = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Reuniões', icon: Calendar, path: '/dashboard/meetings', disabled: true, tooltip: 'em construção' },
    { name: 'Agenda', icon: Calendar, path: '/dashboard/calendar' },
    { name: 'Turmas', icon: Users, path: '/dashboard/classes' },
    { name: 'Minhas Atividades', icon: BookOpen, path: '/dashboard/student/activities' },
  ];

  const navItems = role === 'teacher' ? teacherNav : studentNav;

  const bottomItems = [
    { name: 'Ajuda', icon: HelpCircle, path: '/docs' },
    { name: 'Configurações', icon: Settings, path: '/dashboard/settings' },
    { name: 'Sair', icon: LogOut, path: '/logout' },
  ];

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      <div 
        className={`bg-card border-r border-border/50 shadow-lg h-screen z-40 flex flex-col w-64 fixed lg:static lg:translate-x-0 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
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

        <nav className="mt-5 flex-1">
          <ul>
            {navItems.map((item) => (
              <li key={item.name}>
                {item.disabled ? (
                  <div
                    className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground/50 cursor-not-allowed rounded-md mx-2 my-1"
                    title={item.tooltip}
                  >
                    <item.icon className="w-5 h-5 mr-3 text-muted-foreground/30" />
                    {item.name}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors rounded-md mx-2 my-1
              ${location.pathname === item.path 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setOpen(false);
                      }
                    }}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
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
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors rounded-md mx-2 my-1
            ${location.pathname === item.path 
              ? 'bg-primary/10 text-primary' 
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setOpen(false);
                    }
                  }}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
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
