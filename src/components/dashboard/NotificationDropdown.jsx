import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Bell, BellRing, Check, X, Clock as ClockIcon, AlertTriangle, Info, Calendar as CalendarIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import NotificationService from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

function NotificationDropdown() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const dropdownRef = useRef(null);
  const { toast } = useToast();

  // Fetch notifications with debouncing
  const fetchNotifications = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isFetching) return;

    try {
      setIsFetching(true);
      const { data } = await NotificationService.getNotifications({
        limit: 10, // Show last 10 notifications
        unreadOnly: true, // Only show unread notifications
        orderBy: 'created_at',
        orderDir: 'desc'
      });
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar notificações',
        description: 'Não foi possível carregar as notificações. Tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [isFetching, toast]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId, { userId: (await supabase.auth.getUser()).data.user?.id });
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao marcar notificação',
        description: 'Não foi possível marcar a notificação como lida.',
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await NotificationService.markAsRead(notifications.map(n => n.id), {
        userId: (await supabase.auth.getUser()).data.user?.id
      });
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao marcar notificações',
        description: 'Não foi possível marcar todas as notificações como lidas.',
      });
    }
  };

  // Toggle dropdown
  const toggleDropdown = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      await markAllAsRead();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    if (loading) return <LoadingScreen />;

  return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Set up real-time subscription with proper cleanup
  useEffect(() => {
    let subscription;
    let isSubscribed = true;

    const setupSubscription = async () => {
      if (!isSubscribed) return;

      try {
        // Temporarily disable completely to eliminate console spam
        // await fetchNotifications();
        console.log('[NotificationDropdown] Temporarily disabled to reduce spam');
      } catch (error) {
        console.error('Error setting up notification subscription:', error);
      }
    };

    setupSubscription();

    // Cleanup function
    if (loading) return <LoadingScreen />;

  return () => {
      isSubscribed = false;
      if (subscription && typeof subscription === 'function') {
        subscription();
      }
    };
  }, [fetchNotifications, toast]);

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reminder':
        return <ClockIcon className="h-4 w-4 text-amber-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'event':
        return <CalendarIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <LoadingScreen />;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-md hover:bg-muted transition-colors focus:outline-none"
        onClick={toggleDropdown}
        aria-label="Notificações"
      >
        <div className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Notificações</h3>
            <div className="flex space-x-2">
              {notifications.some(n => !n.is_read) && (
                <button
                  className="text-xs h-7 px-2 rounded hover:bg-muted transition-colors"
                  onClick={markAllAsRead}
                >
                  Marcar todas como lidas
                </button>
              )}
              <button
                className="text-xs h-7 px-2 rounded hover:bg-muted transition-colors"
                onClick={() => window.location.href = '/notifications'}
              >
                Ver todas
              </button>
            </div>
          </div>

          <ScrollArea className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Carregando notificações...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Nenhuma notificação não lida
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors',
                      !notification.is_read && 'bg-blue-50 dark:bg-muted/30'
                    )}
                    onClick={() => {
                      if (notification.link) {
                        window.location.href = notification.link;
                      }
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Marcar como lida"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
            <button
              className="w-full text-sm py-2 rounded hover:bg-muted transition-colors"
              onClick={() => window.location.href = '/notifications'}
            >
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

