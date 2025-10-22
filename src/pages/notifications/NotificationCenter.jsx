import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Check, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Filter,
  Trash2,
  Zap,
  Award,
  MessageCircle,
  FileText,
  Calendar,
  Settings as SettingsIcon,
  Search,
  CheckCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, xp, system
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    // Filter by status
    if (filter === 'unread' && n.is_read) return false;
    if (filter === 'xp' && n.type !== 'xp_gained') return false;
    if (filter === 'system' && n.type === 'xp_gained') return false;

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        n.title?.toLowerCase().includes(query) ||
        n.message?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) {
        toast.success('Todas já estão lidas!');
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success(`${unreadIds.length} notificações marcadas como lidas`);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Erro ao marcar como lidas');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notificação removida');
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      toast.error('Erro ao deletar notificação');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      xp_gained: Zap,
      level_up: Award,
      activity: FileText,
      message: MessageCircle,
      system: SettingsIcon,
      calendar: Calendar,
      alert: AlertTriangle
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      xp_gained: 'from-yellow-500 to-orange-500',
      level_up: 'from-purple-500 to-pink-500',
      activity: 'from-blue-500 to-cyan-500',
      message: 'from-green-500 to-emerald-500',
      system: 'from-gray-500 to-slate-500',
      calendar: 'from-indigo-500 to-purple-500',
      alert: 'from-red-500 to-orange-500'
    };
    return colors[type] || 'from-blue-500 to-purple-500';
  };
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-2xl text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Central de Notificações</h1>
              </div>
              <p className="text-white/90">
                {unreadCount > 0 
                  ? `${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}`
                  : 'Todas as notificações lidas'
                }
              </p>
            </div>
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="whitespace-nowrap inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 rounded-xl font-semibold shadow-lg transition-colors"
              >
                <CheckCheck className="w-5 h-5" />
                Marcar Todas como Lidas
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar notificações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border bg-white dark:bg-slate-900 text-foreground focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'Todas', icon: Bell },
            { value: 'unread', label: 'Não Lidas', icon: Bell },
            { value: 'xp', label: 'XP', icon: Zap },
            { value: 'system', label: 'Sistema', icon: SettingsIcon }
          ].map(f => (
            <motion.button
              key={f.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap inline-flex items-center gap-2 ${
                filter === f.value
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-white dark:bg-slate-900 text-foreground border border-border hover:bg-muted'
              }`}
            >
              <f.icon className="w-4 h-4" />
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <PremiumCard variant="elevated">
            <div className="p-12">
              <EmptyState
                icon={Bell}
                title="Nenhuma notificação"
                description={
                  searchQuery.trim()
                    ? 'Nenhuma notificação encontrada para sua busca'
                    : filter === 'unread'
                    ? 'Você não tem notificações não lidas'
                    : filter === 'xp'
                    ? 'Você não tem notificações de XP'
                    : 'Você não tem notificações'
                }
              />
            </div>
          </PremiumCard>
        ) : (
          filteredNotifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            const color = getNotificationColor(notification.type);
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <PremiumCard 
                  variant="elevated" 
                  className={`overflow-hidden transition-all ${
                    !notification.is_read 
                      ? 'border-l-4 border-l-primary shadow-lg' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-lg">{notification.title}</h3>
                          {!notification.is_read && (
                            <Badge variant="default" className="whitespace-nowrap">
                              Nova
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{notification.message}</p>
                        
                        {/* Metadata */}
                        {notification.metadata && notification.type === 'xp_gained' && (
                          <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
                            <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                              +{notification.metadata.xp} XP
                            </span>
                            {notification.metadata.source && (
                              <>
                                <span className="text-yellow-600 dark:text-yellow-400">•</span>
                                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                                  {notification.metadata.source}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>

                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => markAsRead(notification.id)}
                                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium whitespace-nowrap inline-flex items-center gap-2"
                              >
                                <Check className="w-3 h-3" />
                                Marcar como Lida
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                              title="Deletar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
