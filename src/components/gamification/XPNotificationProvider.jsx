import React, { useEffect, useState } from 'react';
import { xpEventBus } from '@/hooks/useGamification';
import XPNotification from './XPNotification';

/**
 * Provider global para notificações de XP
 * Adicione este componente no nível raiz da aplicação (ou no DashboardLayout)
 */
const XPNotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const unsubscribe = xpEventBus.subscribe((xp, reason) => {
      setNotification({ xp, reason, show: true });
    });

    return unsubscribe;
  }, []);

  const handleClose = () => {
    setNotification(null);
  };

  return (
    <>
      {children}
      {notification && (
        <XPNotification
          xp={notification.xp}
          reason={notification.reason}
          show={notification.show}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default XPNotificationProvider;
