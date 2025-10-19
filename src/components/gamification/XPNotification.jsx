import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Award, Star } from 'lucide-react';

/**
 * Notificação de XP ganho
 * Mostra animação quando aluno ganha XP
 */
const XPNotification = ({ xp, reason, onClose, show }) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const getIcon = () => {
    if (reason?.includes('perfect') || reason?.includes('grade')) return Award;
    if (reason?.includes('level')) return TrendingUp;
    if (reason?.includes('streak')) return Star;
    return Zap;
  };

  const Icon = getIcon();

  const getMessage = () => {
    if (reason?.includes('submission')) return 'Atividade entregue!';
    if (reason?.includes('quiz')) return 'Quiz completado!';
    if (reason?.includes('focus')) return 'Sessão de foco concluída!';
    if (reason?.includes('grade')) return 'Nota atribuída!';
    if (reason?.includes('streak')) return 'Streak mantido!';
    return 'XP ganho!';
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed right-4 top-4 z-50"
        >
          <div className="overflow-hidden rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-xl">
            <div className="relative p-4">
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              <div className="relative flex items-center gap-3">
                {/* Icon */}
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 2,
                  }}
                >
                  <Icon className="h-6 w-6 text-white" />
                </motion.div>

                {/* Content */}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {getMessage()}
                  </div>
                  <motion.div
                    className="mt-1 text-2xl font-bold text-yellow-700"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
                  >
                    +{xp} XP
                  </motion.div>
                </div>

                {/* Sparkles */}
                <div className="absolute -right-1 -top-1">
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 1, repeat: Infinity },
                    }}
                    className="text-yellow-400"
                  >
                    ✨
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              className="h-1 bg-gradient-to-r from-yellow-400 to-orange-500"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Hook para gerenciar notificações de XP
 */
export const useXPNotification = () => {
  const [notification, setNotification] = useState(null);

  const showXPGained = (xp, reason = '') => {
    setNotification({ xp, reason, show: true });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const NotificationComponent = notification ? (
    <XPNotification
      xp={notification.xp}
      reason={notification.reason}
      show={notification.show}
      onClose={hideNotification}
    />
  ) : null;

  return {
    showXPGained,
    XPNotification: NotificationComponent,
  };
};

export default XPNotification;
