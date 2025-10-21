import { LoadingScreen } from '@/components/ui/LoadingScreen';
import useTheme from '../hooks/useTheme';
import { THEME_DARK, THEME_LIGHT, DEFAULT_THEME } from '../constants/theme';

/**
 * Wrapper de tema que aplica as classes CSS necessárias ao elemento raiz
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos que serão envolvidos
 */
function ThemeWrapper({ children }) {
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  // Aplicar classes de tema ao elemento raiz
  const applyTheme = useCallback(() => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const body = document.body;
    
    // Remover classes de tema existentes
    root.classList.remove(THEME_LIGHT, THEME_DARK, 'dark');
    body.classList.remove(THEME_LIGHT, THEME_DARK, 'dark');
    
    // Adicionar a classe do tema atual
    const currentTheme = theme || DEFAULT_THEME;
    root.classList.add(currentTheme);
    
    // Para compatibilidade com Tailwind dark mode
    if (currentTheme === THEME_DARK) {
      root.classList.add('dark');
    }
    
    // Definir o atributo data-theme para compatibilidade com outras bibliotecas
    root.setAttribute('data-theme', currentTheme);
    
    // Adicionar classe de transição suave após a primeira renderização
    const timer = setTimeout(() => {
      root.classList.add('transition-colors', 'duration-200');
    }, 0);
    
    if (loading) return <LoadingScreen />;

  return () => clearTimeout(timer);
  }, [theme]);
  
  // Efeito para aplicar o tema quando o componente for montado ou quando o tema mudar
  useEffect(() => {
    const cleanup = applyTheme();
    if (loading) return <LoadingScreen />;

  return () => {
      if (cleanup) cleanup();
      
      // Limpar classes ao desmontar
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.classList.remove(THEME_LIGHT, THEME_DARK, 'dark', 'transition-colors', 'duration-200');
        root.removeAttribute('data-theme');
      }
    };
  }, [applyTheme]);

  if (loading) return <LoadingScreen />;

  return (
    <>
      {children}
    </>
  );
}

export default ThemeWrapper;
