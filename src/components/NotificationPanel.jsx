import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, CheckCheck } from 'lucide-react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NotificationPanel = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
  } = useRealtimeNotifications(user?.id);

  const getIcon = (type) => {
    const icons = {
      plagiarism_alert: '🚨',
      ai_detection: '🤖',
      activity_submitted: '📝',
      grade_received: '📊',
      deadline_approaching: '⏰',
      class_invitation: '💌',
      new_material: '📚',
      comment_received: '💬',
      system: '🔔'
    };
    return icons[type] || '📬';
  };

  const getColor = (type) => {
    const colors = {
      plagiarism_alert: 'border-l-red-500',
      ai_detection: 'border-l-orange-500',
      grade_received: 'border-l-green-500',
      deadline_approaching: 'border-l-yellow-500',
      class_invitation: 'border-l-purple-500',
      system: 'border-l-blue-500'
    };
    return colors[type] || 'border-l-gray-500';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-label="Painel de notificações"
            aria-modal="true"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" aria-hidden="true" />
                  Notificações
                  {unreadCount > 0 && (
                    <span 
                      className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full"
                      aria-label={`${unreadCount} notificações não lidas`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Marcar todas como lidas"
                    aria-label="Marcar todas as notificações como lidas"
                  >
                    <CheckCheck className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
                {notifications.some(n => n.read) && (
                  <button
                    onClick={deleteAllRead}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    title="Excluir lidas"
                    aria-label="Excluir notificações lidas"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Fechar painel de notificações"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto" role="feed" aria-busy={loading}>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div 
                    className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
                    role="status"
                    aria-label="Carregando notificações"
                  />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Bell className="w-12 h-12 mb-2" aria-hidden="true" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  <AnimatePresence>
                    {notifications.map((notification, index) => (
                      <motion.article
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 hover:bg-muted/50 transition-colors border-l-4 ${getColor(notification.type)} ${
                          !notification.read ? 'bg-primary/5' : ''
                        }`}
                        aria-label={`Notificação: ${notification.title}`}
                      >
                        <div className="flex gap-3">
                          <span 
                            className="text-2xl flex-shrink-0"
                            role="img"
                            aria-label={notification.type}
                          >
                            {getIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                              {notification.message}
                            </p>
                            <time 
                              className="text-xs text-muted-foreground"
                              dateTime={notification.created_at}
                            >
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </time>
                          </div>
                          <div className="flex flex-col gap-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 hover:bg-muted rounded"
                                title="Marcar como lida"
                                aria-label="Marcar notificação como lida"
                              >
                                <Check className="w-4 h-4" aria-hidden="true" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 hover:bg-destructive/10 text-destructive rounded"
                              title="Excluir"
                              aria-label="Excluir notificação"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
