import { supabase } from '@/lib/supabaseClient';

  const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  TASK_SUBMITTED: 'task_submitted',
  TASK_INACTIVE: 'task_inactive',
  TASK_APPROVED: 'task_approved',
  TASK_REJECTED: 'task_rejected'
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Simulate fetching notifications from the server
  const fetchNotifications = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/notifications');
      // setNotifications(response.data);
      
      // Mock data for demonstration
      const mockNotifications = [
        {
          id: 1,
          title: 'Nova submissão de atividade',
          message: 'O aluno João Silva enviou a atividade "Trabalho de Matemática"',
          type: NOTIFICATION_TYPES.TASK_SUBMITTED,
          read: false,
          date: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          meta: {
            studentId: '123',
            taskId: 'task-456',
            studentName: 'João Silva',
            taskTitle: 'Trabalho de Matemática'
          }
        },
        {
          id: 2,
          title: 'Atividade aprovada',
          message: 'Sua atividade "Redação sobre Sustentabilidade" foi aprovada',
          type: NOTIFICATION_TYPES.TASK_APPROVED,
          read: false,
          date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          meta: {
            taskId: 'task-789',
            taskTitle: 'Redação sobre Sustentabilidade',
            approvedBy: 'Prof. Silva'
          }
        },
        {
          id: 3,
          title: 'Atividade inativa',
          message: 'A atividade "Projeto de Ciências" está parada há 3 dias',
          type: NOTIFICATION_TYPES.TASK_INACTIVE,
          read: false,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          meta: {
            taskId: 'task-101',
            taskTitle: 'Projeto de Ciências',
            lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
          }
        },
        {
          id: 4,
          title: 'Aviso do sistema',
          message: 'Manutenção programada para amanhã às 2h',
          type: NOTIFICATION_TYPES.WARNING,
          read: true,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          meta: {}
        },
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling to check for new notifications
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000); // Check every 5 minutes
    if (loading) return <LoadingScreen />;

  return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback((id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [notifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
    setUnreadCount(0);
  }, [notifications]);

  const getNotificationIcon = (type) => {
    const iconClass = 'w-4 h-4';
    
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
      case NOTIFICATION_TYPES.TASK_APPROVED:
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case NOTIFICATION_TYPES.WARNING:
      case NOTIFICATION_TYPES.TASK_INACTIVE:
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case NOTIFICATION_TYPES.ERROR:
      case NOTIFICATION_TYPES.TASK_REJECTED:
        return <X className={`${iconClass} text-red-500`} />;
      case NOTIFICATION_TYPES.TASK_SUBMITTED:
        return <BookOpen className={`${iconClass} text-blue-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
    if (diffInMinutes < 60 * 24) return `Há ${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 60 * 24 * 7) return `Há ${Math.floor(diffInMinutes / (60 * 24))}d`;
    return date.toLocaleDateString();
  };

  // Function to handle notification click (e.g., navigate to task)
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Handle different notification types
    switch (notification.type) {
      case NOTIFICATION_TYPES.TASK_SUBMITTED:
      case NOTIFICATION_TYPES.TASK_APPROVED:
      case NOTIFICATION_TYPES.TASK_REJECTED:
      case NOTIFICATION_TYPES.TASK_INACTIVE:
        // Navigate to task details
        // navigate(`/tasks/${notification.meta.taskId}`);
        console.log('Navigating to task:', notification.meta.taskId);
        break;
      default:
        // Default action or do nothing
        break;
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-96 p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg" 
        align="end" 
        sideOffset={10}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notificações</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma notificação</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50 dark:bg-muted/30' : 'bg-white dark:bg-gray-900'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className={`text-sm font-medium ${
                          !notification.read 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        } truncate`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                          {formatDate(notification.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      {notification.meta?.taskTitle && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {notification.meta.taskTitle}
                        </div>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => {
              // Navigate to notifications page
              // navigate('/notifications');
              console.log('View all notifications');
            }}
          >
            Ver todas as notificações
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;

