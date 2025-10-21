import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ShieldCheck, Cookie, BarChart3, Megaphone, Save, ArrowLeft, Lock, Eye, Bell } from 'lucide-react';

  const PrivacyPreferences = () => {
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      const { preferences } = JSON.parse(consent);
      setPreferences(preferences);
    }
  }, []);

  const handleSave = () => {
    const consentData = {
      accepted: true,
      acceptAll: false,
      timestamp: new Date().toISOString(),
      preferences
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    navigate(-1);
  };

  const handleToggle = (key) => {
    if (key === 'necessary') return; // Cookies necessários não podem ser desativados
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const cookieCategories = [
    {
      id: 'necessary',
      icon: Lock,
      title: 'Cookies Necessários',
      description: 'Essenciais para o funcionamento básico do site. Garantem segurança e funcionalidades principais.',
      examples: 'Autenticação, segurança, carrinho de compras',
      color: 'blue',
      required: true
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Cookies Analíticos',
      description: 'Coletam informações sobre como você usa nosso site para melhorarmos a experiência.',
      examples: 'Google Analytics, métricas de desempenho',
      color: 'purple',
      required: false
    },
    {
      id: 'marketing',
      icon: Megaphone,
      title: 'Cookies de Marketing',
      description: 'Utilizados para personalizar anúncios e conteúdo baseado nos seus interesses.',
      examples: 'Anúncios personalizados, remarketing',
      color: 'pink',
      required: false
    },
    {
      id: 'personalization',
      icon: Eye,
      title: 'Cookies de Personalização',
      description: 'Lembram suas preferências e escolhas para oferecer experiência customizada.',
      examples: 'Idioma, tema, preferências de layout',
      color: 'indigo',
      required: false
    }
  ];

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg text-white hover:opacity-90">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Suas <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-white hover:opacity-90">Preferências</span> de Privacidade
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Você tem total controle sobre seus dados. Escolha quais tipos de cookies deseja permitir.
            </p>
          </div>

          {/* Cookie Categories */}
          <div className="grid gap-6 mb-8">
            {cookieCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                  preferences[category.id] 
                    ? `border-${category.color}-400 shadow-${category.color}-100` 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-r from-${category.color}-400 to-${category.color}-600 rounded-xl flex items-center justify-center`}>
                          <category.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {category.title}
                            {category.required && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-gray-100 dark:bg-gray-800 dark:text-blue-300 rounded-full">
                                Sempre ativo
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div className="ml-15 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <strong>Exemplos:</strong> {category.examples}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Label htmlFor={category.id} className="sr-only">{category.title}</Label>
                      <Switch
                        id={category.id}
                        checked={preferences[category.id]}
                        onCheckedChange={() => handleToggle(category.id)}
                        disabled={category.required}
                        aria-label={`${preferences[category.id] ? 'Desativar' : 'Ativar'} ${category.title}`}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-purple-600 text-white hover:opacity-90"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-8 border border-blue-200 dark:border-blue-800 text-white hover:opacity-90"
          >
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium mb-1">Suas escolhas importam!</p>
                <p>Você pode alterar essas preferências a qualquer momento. Respeitamos sua privacidade e mantemos seus dados seguros seguindo a <strong>LGPD</strong> e melhores práticas internacionais.</p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-between items-center gap-4"
          >
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setPreferences({ necessary: true, analytics: true, marketing: true, personalization: true });
                }}
                className="w-full sm:w-auto border-2 border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                Aceitar Todos
              </Button>
              <Button
                onClick={handleSave}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:opacity-90"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Preferências
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPreferences;

