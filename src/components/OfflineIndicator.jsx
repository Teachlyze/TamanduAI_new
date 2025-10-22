import { LoadingScreen } from '@/components/ui/LoadingScreen' from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiWifiOff, FiWifi } from 'react-icons/fi';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

  const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = React.useState(false);
  const [showReconnected, setShowReconnected] = React.useState(false);

  React.useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      /* if (loading) return <LoadingScreen />; */

  return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  /* if (loading) return <LoadingScreen />; */

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            <FiWifiOff className="h-5 w-5" />
            <span className="font-medium">Sem conexão com a internet</span>
          </div>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            <FiWifi className="h-5 w-5" />
            <span className="font-medium">Conexão restabelecida</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
