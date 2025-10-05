import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Turmas', href: '/classes', icon: BookOpen },
  { name: 'Atividades', href: '/activities', icon: FileText },
  { name: 'Reuniões', href: '/meetings', icon: Calendar, disabled: true, tooltip: 'em construção' },
  { name: 'Alunos', href: '/students', icon: Users },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-gray-600 bg-opacity-75"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-4">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">TamanduAI</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
            {navigation.map((item) => (
              item.disabled ? (
                <div
                  key={item.name}
                  className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                  title={item.tooltip}
                >
                  <item.icon
                    className="mr-3 h-5 w-5 flex-shrink-0 text-gray-300"
                    aria-hidden="true"
                  />
                  {item.name}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    location.pathname.startsWith(item.href)
                      ? 'bg-gray-100 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium'
                  )}
                >
                  <item.icon
                    className={cn(
                      location.pathname.startsWith(item.href)
                        ? 'text-primary'
                        : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 h-5 w-5 flex-shrink-0'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          {/* User menu */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Usuário</p>
                <button
                  onClick={() => {
                    // Handle sign out
                  }}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
