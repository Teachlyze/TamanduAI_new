import React, { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import LanguageSelector from '@/components/ui/LanguageSelector';
import AccessibilityPanel from '@/components/ui/AccessibilityPanel';
import { ConnectionIndicator } from '@/components/admin/ConnectionMonitor';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 sm:px-6 py-4 sticky top-0 z-30 shadow-sm h-16 flex items-center"
    >
      <div className="flex items-center justify-between w-full">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>

          {/* Search Bar */}
          <div className="hidden md:flex relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t('dashboard.search.placeholder', 'Buscar alunos, turmas, atividades...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Search Button for Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>

          {/* Language Selector */}
          <LanguageSelector variant="minimal" />

          {/* Accessibility Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAccessibilityPanelOpen(true)}
            aria-label="Configurações de acessibilidade"
            title="Acessibilidade"
          >
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>

          {/* Connection Status */}
          <ConnectionIndicator />

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Menu */}
          <DropdownMenu open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={`h-10 w-10 p-0 rounded-full transition-all hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 ${
                  isProfileMenuOpen ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
                aria-label="Menu do usuário"
              >
                <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
                  <AvatarImage 
                    src={user?.avatar_url || user?.avatar} 
                    alt={user?.name || user?.email}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
                    {(user?.name || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
              sideOffset={10}
            >
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 border-2 border-gray-200 dark:border-gray-700">
                      <AvatarImage 
                        src={user?.avatar_url || user?.avatar} 
                        alt={user?.name || user?.email} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
                        {(user?.name || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name || user?.email || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email || 'email@exemplo.com'}
                      </p>
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mt-1">
                        Plano Premium
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuItem 
                className="cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-900/20 rounded-lg mx-2 my-1"
                onClick={() => navigate('/profile')}
              >
                <span>{t('common.profile', 'Meu Perfil')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-900/20 rounded-lg mx-2 my-1"
                onClick={() => navigate('/dashboard/settings')}
              >
                <span>{t('common.settings', 'Configurações')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-900/20 rounded-lg mx-2 my-1"
                onClick={() => navigate('/docs')}
              >
                <span>{t('common.help', 'Ajuda & Suporte')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 rounded-lg mx-2 my-1"
                onClick={handleLogout}
              >
                <span>{t('common.logout', 'Sair da Conta')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Accessibility Panel */}
      <AccessibilityPanel
        isOpen={isAccessibilityPanelOpen}
        onClose={() => setIsAccessibilityPanelOpen(false)}
      />
    </motion.header>
  );
};

export default Header;
