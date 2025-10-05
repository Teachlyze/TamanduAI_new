/**
 * Configuração otimizada para tree shaking e bundle analysis
 */

// Configuração de build otimizada
export const buildConfig = {
  // Configurações de tree shaking
  rollupOptions: {
    output: {
      // Separar chunks por tipo de dependência
      manualChunks: {
        // Vendor chunks para bibliotecas externas
        vendor: ['react', 'react-dom', 'react-router-dom'],
        ui: ['@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        charts: ['recharts', 'd3'],
        editor: ['@lexical/react', 'lexical'],
        media: ['react-player', 'hls.js'],
        utils: ['lodash', 'date-fns', 'clsx'],
        forms: ['react-hook-form', 'zod'],
        state: ['zustand', '@tanstack/react-query'],
        animations: ['framer-motion', 'react-intersection-observer'],
        icons: ['lucide-react', 'react-icons'],
        database: ['@supabase/supabase-js', 'supabase'],
        auth: ['@supabase/auth-helpers-react'],
        storage: ['localforage'],
        i18n: ['react-i18next', 'i18next'],
        testing: ['@testing-library/react', 'vitest'],
      },

      // Otimizações de chunk
      chunkFileNames: (chunkInfo) => {
        const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
        return `chunks/${facadeModuleId}-[hash].js`;
      },

      // Nomes de assets otimizados
      assetFileNames: (assetInfo) => {
        const info = assetInfo.name.split('.');
        const ext = info[info.length - 1];
        if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
          return `images/[name]-[hash][extname]`;
        }
        if (/css/i.test(ext)) {
          return `styles/[name]-[hash][extname]`;
        }
        return `assets/[name]-[hash][extname]`;
      },

      // Source maps apenas em desenvolvimento
      sourcemap: process.env.NODE_ENV === 'development',
    },

    // Externals para reduzir bundle size
    external: (id) => {
      // Manter algumas dependências externas em produção
      if (process.env.NODE_ENV === 'production') {
        return ['react', 'react-dom'].includes(id);
      }
      return false;
    },

    // Tree shaking otimizado
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
  },

  // Configurações de build
  build: {
    // Target moderno para melhor tree shaking
    target: 'esnext',

    // Minificação otimizada
    minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,

    // CSS code splitting
    cssCodeSplit: true,

    // Rollup options específicas
    rollupOptions: {
      // Remover comentários desnecessários
      output: {
        comments: false,
      },
    },

    // Report de análise de bundle
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },

  // Otimizações específicas
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-slot',
      '@radix-ui/react-dialog',
      'clsx',
      'tailwind-merge',
    ],

    // Excluir dependências que não precisam ser pré-otimizadas
    exclude: [
      '@vite/client',
      '@vite/env',
    ],
  },

  // Configurações de preview
  preview: {
    port: 3000,
    host: true,
  },

  // Configurações de servidor de desenvolvimento
  server: {
    fs: {
      // Permitir acesso a arquivos fora do diretório raiz
      allow: ['..'],
    },
  },
};

// Função para analisar bundle em desenvolvimento
export const analyzeBundle = async () => {
  if (process.env.NODE_ENV !== 'development') return;

  try {
    const { analyze } = await import('rollup-plugin-visualizer');
    return analyze({
      filename: 'bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    });
  } catch (error) {
    console.warn('Bundle analyzer não disponível:', error);
  }
};

// Hook para monitorar performance de componentes
export const useComponentPerformance = (componentName) => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });

  useEffect(() => {
    const startTime = performance.now();

    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
    }));

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      setMetrics(prev => ({
        ...prev,
        lastRenderTime: renderTime,
        averageRenderTime: (prev.averageRenderTime * prev.renderCount + renderTime) / (prev.renderCount + 1),
      }));

      // Log em desenvolvimento
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`🚨 ${componentName} demorou ${renderTime.toFixed(2)}ms para renderizar`);
      }
    };
  });

  return metrics;
};

// Sistema de lazy loading inteligente baseado em recursos do dispositivo
export const getOptimalLazyStrategy = () => {
  const isMobile = window.innerWidth < 768;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  // Em dispositivos móveis com conexão lenta
  if (isMobile && connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
    return {
      strategy: 'timeout',
      timeout: 10000, // Carregar após 10 segundos
      threshold: 0.01,
    };
  }

  // Em desktop com conexão rápida
  if (!isMobile && connection && connection.effectiveType === '4g') {
    return {
      strategy: 'intersection',
      threshold: 0.1,
      rootMargin: '100px',
    };
  }

  // Configuração padrão
  return {
    strategy: 'intersection',
    threshold: 0.1,
    rootMargin: '50px',
  };
};

// Configuração de cache para recursos estáticos
export const staticAssetsConfig = {
  // Cache de longo prazo para assets estáticos
  cacheControl: {
    images: 'public, max-age=31536000, immutable', // 1 ano
    fonts: 'public, max-age=31536000, immutable',   // 1 ano
    js: 'public, max-age=31536000, immutable',      // 1 ano
    css: 'public, max-age=31536000, immutable',     // 1 ano
    vendor: 'public, max-age=2592000, immutable',   // 30 dias
  },

  // Headers de segurança
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },

  // Compressão
  compression: {
    gzip: true,
    brotli: true,
  },
};

export default buildConfig;
