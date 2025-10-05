// @ts-nocheck
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  
  return {
    // Configuração do diretório raiz
    root: '.',
    
    define: {
      'process.env.NODE_ENV': `"${mode}"`,
      __APP_VERSION__: JSON.stringify(env.npm_package_version || '1.0.0'),
      'import.meta.env.VITE_WS_URL': JSON.stringify(env.VITE_WS_URL || 'ws://localhost:3001'),
      global: 'globalThis',
      // Polyfills for Node.js modules in browser
      'process.browser': true,
      'process.version': JSON.stringify('v18.0.0'),
    },
    
    server: {
      port: 3000,
      strictPort: true,
      host: true,
      open: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        clientPort: 3000,
        overlay: true,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        protocolImports: true,
      }),
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        'url-toolkit': 'url-toolkit/src/url-toolkit.js',
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    build: {
      reportCompressedSize: true,
      target: 'es2022',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProd,
      minify: isProd ? 'esbuild' : false,
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      modulePreload: {
        polyfill: true,
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
        esmExternals: true
      },
      dynamicImportVarsOptions: {
        exclude: [/node_modules/],
      },
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        onwarn(warning, warn) {
          // Ignorar avisos específicos se necessário
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return;
          }
          warn(warning);
        },
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router-dom/')) {
                return 'react-vendor';
              }
              if (id.includes('@supabase/')) {
                return 'supabase-vendor';
              }
              if (id.includes('@radix-ui/')) {
                return 'ui-vendor';
              }
              if (id.includes('recharts') || id.includes('chart.js')) {
                return 'chart-vendor';
              }
              if (id.includes('pdfkit') || id.includes('blob-stream')) {
                return 'pdf-vendor';
              }
              if (id.includes('agora-rtm-sdk') || id.includes('agora-rtc-sdk')) {
                return 'agora-vendor';
              }
              if (id.includes('react-hook-form') || id.includes('zod')) {
                return 'form-vendor';
              }
              if (id.includes('date-fns') || id.includes('lodash') || id.includes('es-toolkit')) {
                return 'utils-vendor';
              }
              if (id.includes('i18next') || id.includes('react-i18next')) {
                return 'i18n-vendor';
              }
              if (id.includes('exceljs')) {
                return 'exceljs-vendor';
              }
              if (id.includes('lucide-react')) {
                return 'icons-vendor';
              }
              if (id.includes('antd/') || (id.includes('rc-') && !id.includes('rc-component'))) {
                return 'antd-vendor';
              }
              if (id.includes('@mui/')) {
                return 'mui-vendor';
              }
              if (id.includes('fontkit')) {
                return 'fontkit-vendor';
              }
              if (id.includes('@react-pdf/')) {
                return 'react-pdf-vendor';
              }
              if (id.includes('framer-motion') || id.includes('motion-dom')) {
                return 'motion-vendor';
              }
              if (id.includes('crypto-js')) {
                return 'crypto-vendor';
              }
              
              if (['clsx', 'class-variance-authority', 'tailwind-merge'].some(pkg => id.includes(pkg))) {
                return 'utils-small';
              }
              
              const skipPackages = [
                'dayjs', 'prop-types', 'uuid', 'tiny-warning', 'tiny-invariant',
                'detect-node-es', 'void-elements', 'dom-helpers', 'hoist-non-react-statics',
                'html-parse-stringify', 'json2mq', 'set-cookie-parser', 'string-convert',
                'rc-cascader', 'rc-collapse', 'rc-dialog', 'rc-drawer', 'rc-field-form',
                'rc-image', 'rc-input-number', 'rc-mentions', 'rc-progress', 'rc-rate',
                'rc-segmented', 'rc-slider', 'rc-steps', 'rc-switch', 'rc-tree-select',
                'rc-upload', 'compute-scroll-into-view', 'scroll-into-view-if-needed', 
                'popperjs', 'prismjs', 'get-nonce', 'redux-thunk', 'toggle-selection'
              ];
              
              const packageName = id.split('node_modules/')[1]?.split('/')[0];
              
              if (packageName && !skipPackages.includes(packageName)) {
                const largePrefixes = ['vendor-', '@', 'react-', 'd3-', 'babel', 'emotion', 'formik'];
                
                if (largePrefixes.some(prefix => packageName.startsWith(prefix) || packageName.includes(prefix))) {
                  if (packageName.startsWith('@')) {
                    const scopedName = packageName.substring(1).split('/')[0];
                    return `vendor-${scopedName}`;
                  }
                  return `vendor-${packageName}`;
                }
              }
              
              return undefined;
            }
            
            if (id.includes('src/pages/')) {
              const page = id.split('src/pages/')[1]?.split('/')[0];
              if (page) {
                const heavyPages = [
                  'DocumentationPage',
                  'Dashboard',
                  'CreateActivityPage',
                  'MeetingRoomPage',
                  'ReportsPage'
                ];
                
                if (heavyPages.some(p => id.includes(p))) {
                  return `lazy-${page}`;
                }
                
                return `page-${page}`;
              }
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          experimentalMinChunkSize: 20000,
          hoistTransitiveImports: false,
        },
        
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
        
        external: ['fs', 'path', 'os', 'crypto', 'http', 'https', 'url', 'zlib', 'tty', 'util', 'net', 'tls', 'child_process', 'dns'],
      },
    },
    
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        loader: {
          '.js': 'jsx',
        },
        target: 'es2022',
        treeShaking: true,
        minify: isProd,
        keepNames: true,
        sourcemap: false,
        logLevel: 'warning',
        legalComments: 'none',
      },
      
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        '@supabase/supabase-js',
        'date-fns',
        'react-hook-form',
        'zod',
        'i18next',
        'react-i18next',
        'lucide-react',
        'recharts',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-select',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-tabs',
        '@radix-ui/react-checkbox',
        'chart.js',
        'lodash',
        'tailwindcss',
        'tailwindcss/nesting',
        'autoprefixer',
        // Polyfills for Node.js modules
        'buffer',
        'stream-browserify',
        'util',
        'events'
      ],
      exclude: isProd ? ['console', 'debugger'] : [],
    },
  };
});
