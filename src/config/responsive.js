// src/config/responsive.js
/**
 * Configuração global de responsividade para a plataforma TamanduAI
 */

// Breakpoints utilizados na aplicação
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Configurações de layout responsivo
export const RESPONSIVE_CONFIG = {
  // Layout principal
  layout: {
    sidebar: {
      width: {
        default: 'w-64',
        collapsed: 'w-16',
      },
      mobileBreakpoint: 'lg',
    },
    header: {
      height: 'h-16',
      mobileBreakpoint: 'md',
    },
    content: {
      padding: {
        mobile: 'p-4',
        tablet: 'p-6',
        desktop: 'p-8',
      },
    },
  },

  // Grid layouts
  grids: {
    cards: {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-2',
      desktop: 'grid-cols-3',
      large: 'grid-cols-4',
    },
    dashboard: {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-2',
      desktop: 'grid-cols-3',
    },
    navigation: {
      mobile: 'flex-col',
      desktop: 'flex-row',
    },
  },

  // Espaçamento responsivo
  spacing: {
    sections: {
      mobile: 'py-6',
      tablet: 'py-8',
      desktop: 'py-12',
    },
    components: {
      mobile: 'gap-4',
      tablet: 'gap-6',
      desktop: 'gap-8',
    },
  },

  // Tipografia responsiva
  typography: {
    headings: {
      h1: {
        mobile: 'text-2xl',
        tablet: 'text-3xl',
        desktop: 'text-4xl',
      },
      h2: {
        mobile: 'text-xl',
        tablet: 'text-2xl',
        desktop: 'text-3xl',
      },
      h3: {
        mobile: 'text-lg',
        tablet: 'text-xl',
        desktop: 'text-2xl',
      },
    },
    body: {
      mobile: 'text-base',
      tablet: 'text-base',
      desktop: 'text-lg',
    },
    small: {
      mobile: 'text-sm',
      tablet: 'text-sm',
      desktop: 'text-base',
    },
  },

  // Componentes específicos
  components: {
    button: {
      minHeight: {
        mobile: 'min-h-[44px]', // Padrão de acessibilidade para toque
        desktop: 'min-h-[40px]',
      },
      padding: {
        mobile: 'px-4 py-2',
        desktop: 'px-3 py-2',
      },
    },
    input: {
      minHeight: 'min-h-[48px]', // Padrão para toque
      fontSize: 'text-base', // Previne zoom no iOS
    },
    card: {
      padding: {
        mobile: 'p-4',
        tablet: 'p-6',
        desktop: 'p-8',
      },
    },
  },

  // Containers
  containers: {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-none',
  },

  // Utilitários para dispositivos móveis
  mobile: {
    touchTarget: 'min-h-[44px]', // Área mínima recomendada para toque
    fontSize: 'text-base', // Previne zoom automático no iOS
    scrollBehavior: 'smooth',
    tapHighlight: 'transparent',
  },
};

/**
 * Hook para usar configuração responsiva
 */
export const useResponsiveConfig = () => {
  return RESPONSIVE_CONFIG;
};

/**
 * Função helper para gerar classes responsivas
 */
export const responsiveClasses = (config) => {
  const classes = [];

  Object.entries(config).forEach(([breakpoint, className]) => {
    if (breakpoint === 'default') {
      classes.push(className);
    } else {
      classes.push(`${breakpoint}:${className}`);
    }
  });

  return classes.join(' ');
};

/**
 * Função para detectar se é dispositivo móvel
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;

  return window.innerWidth < BREAKPOINTS.lg;
};

/**
 * Função para detectar se é tablet
 */
export const isTabletDevice = () => {
  if (typeof window === 'undefined') return false;

  const width = window.innerWidth;
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
};

/**
 * Função para detectar se é desktop
 */
export const isDesktopDevice = () => {
  if (typeof window === 'undefined') return true;

  return window.innerWidth >= BREAKPOINTS.lg;
};

/**
 * Hook para detectar mudanças de breakpoint
 */
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = React.useState(() => {
    if (typeof window === 'undefined') return 'lg';

    const width = window.innerWidth;
    if (width < BREAKPOINTS.sm) return 'xs';
    if (width < BREAKPOINTS.md) return 'sm';
    if (width < BREAKPOINTS.lg) return 'md';
    if (width < BREAKPOINTS.xl) return 'lg';
    if (width < BREAKPOINTS['2xl']) return 'xl';
    return '2xl';
  });

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      let newBreakpoint;
      if (width < BREAKPOINTS.sm) newBreakpoint = 'xs';
      else if (width < BREAKPOINTS.md) newBreakpoint = 'sm';
      else if (width < BREAKPOINTS.lg) newBreakpoint = 'md';
      else if (width < BREAKPOINTS.xl) newBreakpoint = 'lg';
      else if (width < BREAKPOINTS['2xl']) newBreakpoint = 'xl';
      else newBreakpoint = '2xl';

      setBreakpoint(newBreakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

/**
 * Componente de viewport meta tag otimizado
 */
export const ResponsiveViewport = () => {
  React.useEffect(() => {
    // Atualiza viewport para diferentes dispositivos
    const updateViewport = () => {
      const viewport = document.querySelector('meta[name=viewport]');

      if (viewport && isMobileDevice()) {
        // Para dispositivos móveis, permite zoom mas otimiza para toque
        viewport.setAttribute('content',
          'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
        );
      } else if (viewport) {
        // Para desktop, mantém configuração padrão
        viewport.setAttribute('content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return null;
};

export default RESPONSIVE_CONFIG;
