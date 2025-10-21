import { useState, useEffect, useRef } from 'react';
import { Settings, Type, Minimize2, Maximize2, Sun, Moon } from 'lucide-react';

  const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    // Carrega as configurações salvas no localStorage
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('accessibilitySettings');
      return savedSettings 
        ? JSON.parse(savedSettings) 
        : { fontSize: 'normal', lineHeight: 'normal', highContrast: false, reducedMotion: false };
    }
    return { fontSize: 'normal', lineHeight: 'normal', highContrast: false, reducedMotion: false };
  });
  const menuRef = useRef(null);

  // Aplica as configurações de acessibilidade
  useEffect(() => {
    const root = document.documentElement;
    
    // Tamanho da fonte
    switch(settings.fontSize) {
      case 'small':
        root.style.setProperty('--font-size', '0.875rem');
        break;
      case 'large':
        root.style.setProperty('--font-size', '1.125rem');
        break;
      default:
        root.style.setProperty('--font-size', '1rem');
    }

    // Espaçamento de linha
    switch(settings.lineHeight) {
      case 'compact':
        root.style.setProperty('--line-height', '1.5');
        break;
      case 'relaxed':
        root.style.setProperty('--line-height', '2');
        break;
      default:
        root.style.setProperty('--line-height', '1.75');
    }

    // Alto contraste
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Redução de movimento
    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }

    // Salva as configurações
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    if (loading) return <LoadingScreen />;

  return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleSetting = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const setFontSize = (size) => {
    setSettings(prev => ({
      ...prev,
      fontSize: size
    }));
  };

  const setLineHeight = (height) => {
    setSettings(prev => ({
      ...prev,
      lineHeight: height
    }));
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="fixed bottom-4 right-4 z-50" ref={menuRef}>
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-72 bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 transform origin-bottom-right">
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tamanho da Fonte</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setFontSize('small')}
                    className={`px-3 py-1 text-sm rounded ${settings.fontSize === 'small' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Aa
                  </button>
                  <button 
                    onClick={() => setFontSize('normal')}
                    className={`px-3 py-1 text-base rounded ${settings.fontSize === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Aa
                  </button>
                  <button 
                    onClick={() => setFontSize('large')}
                    className={`px-3 py-1 text-lg rounded ${settings.fontSize === 'large' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Aa
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Espaçamento</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setLineHeight('compact')}
                    className={`px-3 py-1 text-sm rounded flex items-center ${settings.lineHeight === 'compact' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <Minimize2 className="mr-1 w-4 h-4" /> Compacto
                  </button>
                  <button 
                    onClick={() => setLineHeight('normal')}
                    className={`px-3 py-1 text-sm rounded flex items-center ${settings.lineHeight === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <Type className="mr-1 w-4 h-4" /> Normal
                  </button>
                  <button 
                    onClick={() => setLineHeight('relaxed')}
                    className={`px-3 py-1 text-sm rounded flex items-center ${settings.lineHeight === 'relaxed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <Maximize2 className="mr-1 w-4 h-4" /> Ampliado
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => toggleSetting('highContrast')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded ${settings.highContrast ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  <span>Alto Contraste</span>
                  {settings.highContrast ? <Sun className="text-yellow-600 w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                
                <button 
                  onClick={() => toggleSetting('reducedMotion')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded ${settings.reducedMotion ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  <span>Reduzir Animações</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200">
                    {settings.reducedMotion ? 'Ativado' : 'Desativado'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all flex items-center space-x-2"
          aria-label="Menu de Configurações"
          aria-expanded={isOpen}
        >
          <Settings className="w-5 h-5" />
          <span>Configurações</span>
        </button>
      </div>
    </div>
  );
};

export default AccessibilityMenu;
