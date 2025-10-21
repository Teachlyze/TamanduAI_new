import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { ConnectionIndicator } from '@/components/admin/ConnectionMonitor';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import NotificationDropdown from '@/components/dashboard/NotificationDropdown';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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
      className="bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-sm h-16 flex items-center"
    >
      <div className="flex items-center justify-between w-full gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
            onClick={onMenuClick}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <ConnectionIndicator />

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Menu */}
          <DropdownMenu open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button 
                className="h-10 w-10 p-0 rounded-full transition-all focus:outline-none"
                aria-label="Menu do usuário"
              >
                <Avatar className="h-10 w-10 border-2 border-border">
                  <AvatarImage 
                    src={user?.avatar_url || user?.avatar} 
                    alt={user?.name || user?.email}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-white font-medium">
                    {(user?.name || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
              <DropdownMenuContent 
              className="w-64 rounded-xl shadow-xl border border-border bg-background/95 backdrop-blur-xl"
              sideOffset={10}
            >
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarImage 
                        src={user?.avatar_url || user?.avatar} 
                        alt={user?.name || user?.email} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-white font-medium">
                        {(user?.name || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {user?.name || user?.email || 'Usuário'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || 'email@exemplo.com'}
                      </p>
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary mt-1">
                        Plano Premium
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer focus:bg-muted rounded-lg mx-2 my-1"
                onClick={() => navigate('/profile')}
              >
                <span>{t('common.profile', 'Meu Perfil')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer focus:bg-muted rounded-lg mx-2 my-1"
                onClick={() => navigate('/dashboard/settings')}
              >
                <span>{t('common.settings', 'Configurações')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer focus:bg-muted rounded-lg mx-2 my-1"
                onClick={() => navigate('/docs')}
              >
                <span>{t('common.help', 'Ajuda & Suporte')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:bg-destructive/10 rounded-lg mx-2 my-1"
                onClick={handleLogout}
              >
                <span>{t('common.logout', 'Sair da Conta')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
