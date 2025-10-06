import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCircle, 
  Clock as ClockIcon, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  X,
  Filter,
  Trash2,
  MailOpen,
  MailCheck
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import NotificationService from '@/services/notificationService';
import { useAuth } from "@/hooks/useAuth";
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const NotificationCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterTypes, setFilterTypes] = useState({
    info: true,
    reminder: true,
    alert: true,
    event: true,
  });

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data } = await NotificationService.getNotifications({ // Update method call
        limit: 100,
        orderBy: 'created_at',
        orderDir: 'desc'
      });
      setNotifications(data || []);
      setFilteredNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar notificações',
        description: 'Não foi possível carregar as notificações. Tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]);

  // Apply filters and search
  useEffect(() => {
    let result = [...notifications];

    // Apply tab filter
    if (activeTab === 'unread') {
      result = result.filter(n => !n.is_read);
    } else if (activeTab === 'read') {
      result = result.filter(n => n.is_read);
    }

    // Apply type filters
    const activeTypes = Object.entries(filterTypes)
      .filter(([, isActive]) => isActive)
      .map(([type]) => type);
    
    if (activeTypes.length > 0) {
      result = result.filter(n => activeTypes.includes(n.type));
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        n => 
          n.title.toLowerCase().includes(query) || 
          n.message.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(result);
  }, [notifications, activeTab, filterTypes, searchQuery]);

  // Toggle notification selection
  const toggleNotificationSelection = (notificationId) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(notificationId)) {
      newSelection.delete(notificationId);
    } else {
      newSelection.add(notificationId);
    }
    setSelectedNotifications(newSelection);
  };

  // Toggle select all
  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    } else {
      setSelectedNotifications(new Set());
    }
  };

  // Mark selected as read
  const markSelectedAsRead = async () => {
    if (selectedNotifications.size === 0) return;
    
    try {
      await NotificationService.markAsRead(Array.from(selectedNotifications), { userId: user?.id }); // Update method call
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          selectedNotifications.has(n.id) ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      
      setSelectedNotifications(new Set());
      
      toast({
        title: 'Notificações marcadas como lidas',
        description: `${selectedNotifications.size} notificação(s) marcada(s) como lida(s)`,
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar as notificações como lidas',
        variant: 'destructive',
      });
    }
  };

  // Delete selected notifications
  const deleteSelected = async () => {
    if (selectedNotifications.size === 0) return;
    
    try {
      await NotificationService.deleteNotification(Array.from(selectedNotifications), { userId: user?.id }); // Update method call
      
      // Update local state
      setNotifications(prev => 
        prev.filter(n => !selectedNotifications.has(n.id))
      );
      
      setSelectedNotifications(new Set());
      
      toast({
        title: 'Notificações excluídas',
        description: `${selectedNotifications.size} notificação(s) excluída(s) com sucesso`,
      });
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir as notificações selecionadas',
        variant: 'destructive',
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => !n.read_at);
      
      if (unreadNotifications.length > 0) {
        await NotificationService.markAsRead(
          unreadNotifications.map(n => n.id), 
          { userId: user?.id }
        );
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({
          ...n, 
          read_at: n.read_at || new Date().toISOString()
        }))
      );
      
      setSelectedNotifications(new Set());
      
      toast({
        title: 'Todas as notificações marcadas como lidas',
        description: 'Suas notificações foram marcadas como lidas',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar todas as notificações como lidas',
        variant: 'destructive',
      });
    }
  };

  // Toggle notification type filter
  const toggleTypeFilter = (type) => {
    setFilterTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = NotificationService.subscribeToNotifications((payload) => {
      console.log('Notification update received:', payload);
      fetchNotifications();
    });

    // Initial fetch
    fetchNotifications();

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [fetchNotifications, user]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const allSelected = filteredNotifications.length > 0 && 
                     filteredNotifications.every(n => selectedNotifications.has(n.id));
  const someSelected = filteredNotifications.some(n => selectedNotifications.has(n.id));

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Central de Notificações"
        description="Gerencie suas notificações"
        icon={Bell}
      />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <Input
                placeholder="Buscar notificações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-80"
              />
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <MailCheck className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
            
            <div className="relative group">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10 hidden group-hover:block">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Checkbox 
                      id="filter-info" 
                      checked={filterTypes.info}
                      onCheckedChange={() => toggleTypeFilter('info')}
                    />
                    <label htmlFor="filter-info" className="text-sm font-medium leading-none">
                      Informações
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Checkbox 
                      id="filter-reminder" 
                      checked={filterTypes.reminder}
                      onCheckedChange={() => toggleTypeFilter('reminder')}
                    />
                    <label htmlFor="filter-reminder" className="text-sm font-medium leading-none">
                      Lembretes
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Checkbox 
                      id="filter-alert" 
                      checked={filterTypes.alert}
                      onCheckedChange={() => toggleTypeFilter('alert')}
                    />
                    <label htmlFor="filter-alert" className="text-sm font-medium leading-none">
                      Alertas
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Checkbox 
                      id="filter-event" 
                      checked={filterTypes.event}
                      onCheckedChange={() => toggleTypeFilter('event')}
                    />
                    <label htmlFor="filter-event" className="text-sm font-medium leading-none">
                      Eventos
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs 
          defaultValue="all" 
          className="w-full"
          onValueChange={setActiveTab}
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <TabsList className="bg-transparent p-0 h-auto rounded-none w-full justify-start">
              <TabsTrigger 
                value="all" 
                className="relative py-3 px-4 data-[state=active]:shadow-none"
              >
                Todas
              </TabsTrigger>
              <TabsTrigger 
                value="unread" 
                className="relative py-3 px-4 data-[state=active]:shadow-none"
              >
                <span>Não lidas</span>
                {unreadCount > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="read" 
                className="relative py-3 px-4 data-[state=active]:shadow-none"
              >
                Lidas
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Bulk actions */}
          <div className={cn(
            "px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 transition-all duration-200 overflow-hidden",
            selectedNotifications.size === 0 ? 'max-h-0 p-0 border-0' : 'max-h-16'
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  ref={el => {
                    if (el) {
                      el.indeterminate = someSelected && !allSelected;
                    }
                  }}
                />
                <label 
                  htmlFor="select-all" 
                  className="text-sm font-medium leading-none"
                >
                  {selectedNotifications.size} selecionada(s)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm"
                  onClick={markSelectedAsRead}
                  disabled={selectedNotifications.size === 0}
                >
                  <MailOpen className="h-4 w-4 mr-2" />
                  Marcar como lida(s)
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                  onClick={deleteSelected}
                  disabled={selectedNotifications.size === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
          
          {/* Notifications list */}
          <TabsContent value="all" className="m-0">
            <NotificationList 
              notifications={filteredNotifications}
              isLoading={isLoading}
              selectedNotifications={selectedNotifications}
              onToggleSelect={toggleNotificationSelection}
              onMarkAsRead={(id) => {
                const notification = notifications.find(n => n.id === id);
                if (notification && !notification.is_read) {
                  NotificationService.markAsRead(id);
                  setNotifications(prev => 
                    prev.map(n => 
                      n.id === id ? { ...n, is_read: true } : n
                    )
                  );
                }
              }}
              onDelete={(id) => {
                if (window.confirm('Tem certeza que deseja excluir esta notificação?')) {
                  NotificationService.deleteNotifications([id]);
                  setNotifications(prev => prev.filter(n => n.id !== id));
                }
              }}
              getNotificationIcon={getNotificationIcon}
            />
          </TabsContent>
          
          <TabsContent value="unread" className="m-0">
            <NotificationList 
              notifications={filteredNotifications}
              isLoading={isLoading}
              selectedNotifications={selectedNotifications}
              onToggleSelect={toggleNotificationSelection}
              onMarkAsRead={(id) => {
                NotificationService.markAsRead(id);
                setNotifications(prev => 
                  prev.map(n => 
                    n.id === id ? { ...n, is_read: true } : n
                  )
                );
              }}
              onDelete={(id) => {
                if (window.confirm('Tem certeza que deseja excluir esta notificação?')) {
                  NotificationService.deleteNotifications([id]);
                  setNotifications(prev => prev.filter(n => n.id !== id));
                }
              }}
              getNotificationIcon={getNotificationIcon}
            />
          </TabsContent>
          
          <TabsContent value="read" className="m-0">
            <NotificationList 
              notifications={filteredNotifications}
              isLoading={isLoading}
              selectedNotifications={selectedNotifications}
              onToggleSelect={toggleNotificationSelection}
              onMarkAsRead={null}
              onDelete={(id) => {
                if (window.confirm('Tem certeza que deseja excluir esta notificação?')) {
                  NotificationService.deleteNotifications([id]);
                  setNotifications(prev => prev.filter(n => n.id !== id));
                }
              }}
              getNotificationIcon={getNotificationIcon}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Notification list component
const NotificationList = ({
  notifications,
  isLoading,
  selectedNotifications,
  onToggleSelect,
  onMarkAsRead,
  onDelete,
  getNotificationIcon,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <LoadingSpinner className="h-8 w-8 text-blue-500" />
        <p className="mt-4 text-sm text-gray-500">Carregando notificações...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <BellOff className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhuma notificação encontrada</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Quando você tiver notificações, elas aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className={cn(
              'p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
              !notification.is_read && 'bg-blue-50 dark:bg-blue-900/10',
              selectedNotifications.has(notification.id) && 'bg-blue-100 dark:bg-blue-900/30'
            )}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <Checkbox
                  id={`select-${notification.id}`}
                  checked={selectedNotifications.has(notification.id)}
                  onCheckedChange={() => onToggleSelect(notification.id)}
                  className="mt-1"
                />
              </div>
              
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getNotificationIcon(notification.type)}
                    <h3 className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(parseISO(notification.created_at), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </span>
                    
                    <div className="flex items-center space-x-1">
                      {onMarkAsRead && !notification.is_read && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                          title="Marcar como lida"
                        >
                          <MailOpen className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => onDelete(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                        title="Excluir notificação"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {notification.message}
                </p>
                
                {notification.link && (
                  <div className="mt-2">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-sm"
                      onClick={() => window.location.href = notification.link}
                    >
                      Ver detalhes
                    </Button>
                  </div>
                )}
                
                <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center">
                    {notification.is_read ? (
                      <>
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                        Lida
                      </>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-blue-500 mr-1"></span>
                    )}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    {format(parseISO(notification.created_at), "PPpp", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationCenter;
