import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield, Cookie, Settings, CheckCircle,
  ExternalLink, Info, Heart, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState(false);

  useEffect(() => {
    // Verificar se já aceitou cookies
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      const { accepted } = JSON.parse(consent);
      setHasAcceptedCookies(accepted);
    }
  }, []);

  const quickActions = [
    {
      icon: Settings,
      title: "Preferências",
      description: "Gerencie seus cookies",
      link: "/privacy-preferences",
      color: "blue"
    },
    {
      icon: Info,
      title: "Política de Privacidade",
      description: "Como protegemos seus dados",
      link: "/privacy",
      color: "purple"
    },
    {
      icon: Lock,
      title: "Termos de Uso",
      description: "Regras da plataforma",
      link: "/terms",
      color: "green"
    }
  ];

  return (
    <>
      {/* Privacy Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
        aria-label="Menu de privacidade"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <Shield className="w-5 h-5" />
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-1 -right-1"
          >
            <Cookie className="w-3 h-3" />
          </motion.div>
        </div>
        <span className="hidden sm:inline font-medium">Privacidade</span>

        {/* Notification dot for new users */}
        {!hasAcceptedCookies && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-full h-full bg-red-500 rounded-full"
            />
          </motion.div>
        )}
      </motion.button>

      {/* Privacy Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 w-80 max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Privacidade & Cookies</h3>
                      <p className="text-pink-100 text-sm">Seus dados, suas regras</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 rounded-xl"
                  >
                    ✕
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Status */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800 shadow-lg shadow-green-100/50 dark:shadow-green-900/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm">
                        Privacidade Protegida
                      </h4>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        Seus dados estão seguros conosco
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Ações Rápidas
                  </h4>

                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link to={action.link} onClick={() => setIsOpen(false)}>
                        <div className={`group p-4 bg-gradient-to-r from-${action.color}-50 to-${action.color}-100 dark:from-${action.color}-900/20 dark:to-${action.color}-800/20 rounded-2xl border-2 border-${action.color}-200 dark:border-${action.color}-800 hover:shadow-lg hover:shadow-${action.color}-100/50 dark:hover:shadow-${action.color}-900/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 bg-gradient-to-r from-${action.color}-100 to-${action.color}-200 dark:from-${action.color}-900/30 dark:to-${action.color}-800/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                                <action.icon className={`w-5 h-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                              </div>
                              <div>
                                <h5 className={`font-semibold text-${action.color}-800 dark:text-${action.color}-300 text-sm`}>
                                  {action.title}
                                </h5>
                                <p className={`text-xs text-${action.color}-700 dark:text-${action.color}-400`}>
                                  {action.description}
                                </p>
                              </div>
                            </div>
                            <ExternalLink className={`w-4 h-4 text-${action.color}-500 dark:text-${action.color}-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Respeitamos sua privacidade e protegemos seus dados
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PrivacyButton;
