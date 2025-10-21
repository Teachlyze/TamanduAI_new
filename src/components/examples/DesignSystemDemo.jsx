// src/components/examples/DesignSystemDemo.jsx
import { motion } from 'framer-motion';
import {
  BookOpen,
  Shield,
  Users,
  Zap,
  Heart,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { EnhancedLayout, EnhancedSidebar, EnhancedCard, EnhancedButton, ResponsiveContainer } from '@/components/ui/EnhancedLayout';

/**
 * Demonstração completa do sistema de design aprimorado
 * Mostra como usar Tailwind + DaisyUI + componentes customizados
 */
const DesignSystemDemo = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sidebarItems = [
    { id: 'overview', label: 'Visão Geral', icon: BookOpen },
    { id: 'components', label: 'Componentes', icon: Shield },
    { id: 'layout', label: 'Layout', icon: Users },
    { id: 'animations', label: 'Animações', icon: Zap },
    { id: 'accessibility', label: 'Acessibilidade', icon: Heart },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;

      case 'components':
        return <ComponentsSection />;

      case 'layout':
        return <LayoutSection />;

      case 'animations':
        return <AnimationsSection />;

      case 'accessibility':
        return <AccessibilitySection />;

      default:
        return <OverviewSection />;
    }
  };

  return (
    <EnhancedLayout
      title="Sistema de Design TamanduAI"
      subtitle="Demonstração completa do design system aprimorado"
      sidebarContent={
        <EnhancedSidebar
          items={sidebarItems}
          activeItem={activeSection}
          onItemClick={setActiveSection}
        />
      }
    >
      <div className="space-y-8">
        {renderContent()}
      </div>
    </EnhancedLayout>
  );
};

/**
 * Seção de visão geral com métricas
 */
const OverviewSection = () => {
  // Dados mockados configuráveis através de variáveis de ambiente
  const demoMetrics = [
    {
      label: 'Usuários Ativos',
      value: import.meta.env.VITE_DEFAULT_TOTAL_STUDENTS || '150',
      change: `+${import.meta.env.VITE_MOCK_STUDENTS_CHANGE_PERCENTAGE || '12'}%`,
      trend: 'up'
    },
    {
      label: 'Taxa de Sucesso',
      value: `${import.meta.env.VITE_DEFAULT_COMPLETION_RATE || '87'}%`,
      change: `+${import.meta.env.VITE_MOCK_COMPLETION_RATE_CHANGE_PERCENTAGE || '3'}%`,
      trend: 'up'
    },
    {
      label: 'Tempo Médio',
      value: '2.4s',
      change: '-0.3s',
      trend: 'down'
    },
    {
      label: 'Satisfação',
      value: '4.8/5',
      change: `+${import.meta.env.VITE_MOCK_ACTIVITIES_CHANGE_PERCENTAGE || '5'}`,
      trend: 'up'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {demoMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <EnhancedCard className="text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {metric.value}
                </div>
                <div className="text-sm font-medium text-base-content/70">
                  {metric.label}
                </div>
                <div className={`text-sm font-semibold ${
                  metric.trend === 'up' ? 'text-success' : 'text-error'
                }`}>
                  {metric.change}
                </div>
              </div>
            </EnhancedCard>
          </motion.div>
        ))}
      </div>

      <EnhancedCard title="Recursos do Design System">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">🎨 Visual</h3>
            <ul className="space-y-2 text-sm">
              <li>• Paleta de cores consistente</li>
              <li>• Tipografia otimizada</li>
              <li>• Espaçamento padronizado</li>
              <li>• Sombras e elevação</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">⚡ Performance</h3>
            <ul className="space-y-2 text-sm">
              <li>• Lazy loading inteligente</li>
              <li>• Animações otimizadas</li>
              <li>• Cache eficiente</li>
              <li>• Bundle size controlado</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">♿ Acessibilidade</h3>
            <ul className="space-y-2 text-sm">
              <li>• WCAG 2.1 compliance</li>
              <li>• Navegação por teclado</li>
              <li>• Screen reader support</li>
              <li>• High contrast mode</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">📱 Responsivo</h3>
            <ul className="space-y-2 text-sm">
              <li>• Mobile-first design</li>
              <li>• Breakpoints otimizados</li>
              <li>• Touch-friendly</li>
              <li>• Adaptive layouts</li>
            </ul>
          </div>
        </div>
      </EnhancedCard>
    </motion.div>
  );
};

/**
 * Seção demonstrando componentes
 */
const ComponentsSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Botões */}
      <EnhancedCard title="Botões Aprimorados">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <EnhancedButton variant="primary">Primário</EnhancedButton>
            <EnhancedButton variant="secondary">Secundário</EnhancedButton>
            <EnhancedButton variant="accent">Accent</EnhancedButton>
          </div>
          <div className="flex flex-wrap gap-2">
            <EnhancedButton variant="ghost">Ghost</EnhancedButton>
            <EnhancedButton variant="outline">Outline</EnhancedButton>
            <EnhancedButton variant="error">Erro</EnhancedButton>
          </div>
          <div className="flex flex-wrap gap-2">
            <EnhancedButton size="sm">Pequeno</EnhancedButton>
            <EnhancedButton size="lg">Grande</EnhancedButton>
            <EnhancedButton loading>Carregando</EnhancedButton>
          </div>
        </div>
      </EnhancedCard>

      {/* Estados */}
      <EnhancedCard title="Estados e Feedback">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-sm">Operação concluída</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span className="text-sm">Atenção necessária</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-info" />
            <span className="text-sm">Informação útil</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="h-5 w-5 text-error" />
            <span className="text-sm">Erro encontrado</span>
          </div>
        </div>
      </EnhancedCard>
    </div>

    {/* Badges e Tags */}
    <EnhancedCard title="Badges e Indicadores">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-primary">Primário</span>
          <span className="badge badge-secondary">Secundário</span>
          <span className="badge badge-accent">Accent</span>
          <span className="badge badge-success">Sucesso</span>
          <span className="badge badge-warning">Aviso</span>
          <span className="badge badge-error">Erro</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="badge badge-outline">Outline</span>
          <span className="badge badge-ghost">Ghost</span>
          <span className="badge badge-neutral">Neutro</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-circle">1</span>
          <span className="badge badge-circle badge-success">✓</span>
          <span className="badge badge-circle badge-warning">!</span>
        </div>
      </div>
    </EnhancedCard>
  </motion.div>
);

/**
 * Seção de layout responsivo
 */
const LayoutSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <EnhancedCard className="lg:col-span-2">
        <h3 className="font-semibold mb-4">Layout Responsivo</h3>
        <p className="text-base-content/70 mb-4">
          Demonstração de como o layout se adapta automaticamente a diferentes tamanhos de tela.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-base-200 rounded-lg p-4 text-center">
              Item {i}
            </div>
          ))}
        </div>
      </EnhancedCard>

      <EnhancedCard>
        <h3 className="font-semibold mb-4">Sidebar Behavior</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span>Desktop: Sidebar sempre visível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Mobile: Sidebar colapsável</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span>Overlay com backdrop blur</span>
          </div>
        </div>
      </EnhancedCard>
    </div>
  </motion.div>
);

/**
 * Seção de animações
 */
const AnimationsSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <EnhancedCard>
        <h3 className="font-semibold mb-4">Micro-interações</h3>
        <div className="space-y-4">
          <motion.button
            className="btn btn-primary w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Hover + Tap Animation
          </motion.button>

          <motion.div
            className="bg-gradient-to-r from-primary to-accent p-4 rounded-lg cursor-pointer"
            whileHover={{ scale: 1.05 }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Gradiente Animado
          </motion.div>
        </div>
      </EnhancedCard>

      <EnhancedCard>
        <h3 className="font-semibold mb-4">Estados de Loading</h3>
        <div className="space-y-4">
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-3/4"></div>
          <div className="skeleton h-4 w-1/2"></div>

          <div className="flex items-center gap-2">
            <div className="loading loading-spinner loading-sm"></div>
            <span className="text-sm">Carregando dados...</span>
          </div>
        </div>
      </EnhancedCard>
    </div>

    <EnhancedCard title="Animações Contextuais">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="bg-base-200 rounded-lg p-6 text-center cursor-pointer"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            Card Animado {i}
          </motion.div>
        ))}
      </div>
    </EnhancedCard>
  </motion.div>
);

/**
 * Seção de acessibilidade
 */
const AccessibilitySection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <EnhancedCard title="Configurações de Acessibilidade">
        <div className="space-y-4">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Texto ampliado</span>
              <input type="checkbox" className="toggle toggle-primary" />
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Alto contraste</span>
              <input type="checkbox" className="toggle toggle-secondary" />
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Reduzir movimento</span>
              <input type="checkbox" className="toggle toggle-accent" />
            </label>
          </div>
        </div>
      </EnhancedCard>

      <EnhancedCard title="Navegação por Teclado">
        <div className="space-y-4">
          <div className="alert alert-info">
            <Info className="h-5 w-5" />
            <div>
              <p>Use <kbd className="kbd kbd-sm">Tab</kbd> para navegar</p>
              <p>Use <kbd className="kbd kbd-sm">Enter</kbd> para ativar</p>
            </div>
          </div>

          <div className="space-y-2">
            <button className="btn btn-outline w-full justify-start">
              <span className="mr-2">🏠</span>
              Página Inicial
            </button>
            <button className="btn btn-outline w-full justify-start">
              <span className="mr-2">👥</span>
              Turmas
            </button>
            <button className="btn btn-outline w-full justify-start">
              <span className="mr-2">📚</span>
              Atividades
            </button>
          </div>
        </div>
      </EnhancedCard>
    </div>

    <EnhancedCard title="Suporte a Screen Readers">
      <div className="space-y-4">
        <p className="text-base-content/70">
          Todos os componentes incluem atributos ARIA apropriados e anúncios para screen readers.
        </p>

        <div className="bg-base-200 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Exemplo de anúncio:</h4>
          <p className="text-sm">
            Botão Entrar pressionado. Fazendo login na conta...
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat">
            <div className="stat-title">WCAG 2.1</div>
            <div className="stat-value text-success">✓</div>
            <div className="stat-desc">Compliance total</div>
          </div>

          <div className="stat">
            <div className="stat-title">Screen Reader</div>
            <div className="stat-value text-primary">✓</div>
            <div className="stat-desc">Suporte completo</div>
          </div>

          <div className="stat">
            <div className="stat-title">Keyboard Nav</div>
            <div className="stat-value text-accent">✓</div>
            <div className="stat-desc">Navegação total</div>
          </div>
        </div>
      </div>
    </EnhancedCard>
  </motion.div>
);

export default DesignSystemDemo;
