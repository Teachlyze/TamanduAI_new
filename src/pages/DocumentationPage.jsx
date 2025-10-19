import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronRight,
  Home,
  LayoutDashboard,
  Settings,
  Users,
  GraduationCap,
  Video,
  Calendar,
  MessageSquare,
  MessageCircle,
  FileText,
  BarChart,
  Shield,
  Code,
  HelpCircle,
  Menu,
  X,
  Zap,
  AlertTriangle,
  Info,
  UserPlus,
  UserCheck,
  UserX,
  Upload,
  Lock,
  Image,
  Bell,
  Monitor,
  Mic,
  LogIn,
  UserCog,
  Download,
  FolderOpen,
  Bot,
  Palette,
  Smartphone,
  Globe,
  Headphones,
  Clock,
  Star,
  TrendingUp,
  Activity,
  CheckCircle,
  PlayCircle,
  PlayCircle as PlayCircleIcon,
  PenTool,
  Layers,
  Sparkles,
  Brain,
  Database,
  Server,
  Cloud,
  Github,
  Terminal,
  Rocket,
  Award,
  Target,
  Lightbulb,
  Cpu,
  Wifi,
  Eye,
  Contrast,
  Languages,
  TestTube,
  Package,
  GitBranch,
  Container,
  Lock as LockIcon,
  Key,
  Fingerprint,
  EyeOff,
  Timer,
  HardDrive,
  Archive,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  XCircle,
  PlusCircle,
  MinusCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ShieldCheck,
  Database as DatabaseIcon,
  HardDrive as HardDriveIcon,
  Cloud as CloudIcon,
  Eye as EyeIcon,
  Globe as GlobeIcon,
  Smartphone as SmartphoneIcon,
  Clock as ClockIcon,
  CheckCircle2,
  AlertTriangle as AlertTriangleIcon,
  Info as InfoIcon,
  Zap as ZapIcon,
  Brain as BrainIcon,
  Shield as ShieldIcon,
  Globe as GlobeIcon2,
  Activity as ActivityIcon,
  Rocket as RocketIcon,
  Code as CodeIcon,
  TestTube as TestTubeIcon,
  HelpCircle as HelpCircleIcon,
  Server as ServerIcon,
  Terminal as TerminalIcon,
  Lock as LockIcon2,
  EyeOff as EyeOffIcon,
  RefreshCw as RefreshCwIcon,
  Github as GithubIcon,
  Package as PackageIcon,
  GitBranch as GitBranchIcon,
  Container as ContainerIcon,
  Layers as LayersIcon,
  Cpu as CpuIcon,
  Wifi as WifiIcon,
  Palette as PaletteIcon,
  Headphones as HeadphonesIcon,
  Download as DownloadIcon,
  FolderOpen as FolderOpenIcon,
  Upload as UploadIcon,
  Bell as BellIcon,
  Monitor as MonitorIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText as FileTextIcon,
  Users as UsersIcon,
  GraduationCap as GraduationCapIcon,
  Calendar as CalendarIcon,
  MessageCircle as MessageCircleIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Target as TargetIcon,
  Lightbulb as LightbulbIcon,
  Award as AwardIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  PlayCircle as PlayCircleIcon2,
  PenTool as PenToolIcon,
  Sparkles as SparklesIcon,
  Archive as ArchiveIcon,
  Timer as TimerIcon,
  Fingerprint as FingerprintIcon,
  Key as KeyIcon,
  Eye as EyeIcon2,
  Contrast as ContrastIcon,
  Languages as LanguagesIcon,
  HardDrive as HardDriveIcon2,
  RefreshCw as RefreshCwIcon2,
  AlertCircle as AlertCircleIcon2,
  CheckSquare as CheckSquareIcon,
  XCircle as XCircleIcon2,
  PlusCircle as PlusCircleIcon,
  MinusCircle as MinusCircleIcon,
  ExternalLink as ExternalLinkIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon2
} from 'lucide-react';

const DocumentationPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('introduction');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState([]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => (
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    ));
  };

  const sections = [
    {
      id: 'introduction',
      title: 'Introdução',
      icon: <BookOpen size={18} />,
      description: 'Visão geral da plataforma TamanduAI e seus recursos enterprise'
    },
    {
      id: 'platform-overview',
      title: 'Visão Geral da Plataforma',
      icon: <LayoutDashboard size={18} />,
      description: 'Arquitetura completa e recursos enterprise implementados',
      subsections: [
        'arquitetura',
        'recursos-principais',
        'seguranca-avancada',
        'performance-escalabilidade'
      ]
    },
    {
      id: 'security',
      title: 'Segurança Enterprise',
      icon: <Shield size={18} />,
      description: 'Sistema completo de segurança e proteção de dados',
      subsections: [
        'autenticacao-segura',
        'row-level-security',
        'xss-protection',
        'rate-limiting',
        'auditoria-compliance'
      ]
    },
    {
      id: 'ai-features',
      title: 'Recursos de IA',
      icon: <Brain size={18} />,
      description: 'Tecnologias de inteligência artificial integradas',
      subsections: [
        'winston-ai-plagio',
        'chatbot-educacional',
        'analise-preditiva'
      ]
    },
    {
      id: 'deployment',
      title: 'Deploy & DevOps',
      icon: <Rocket size={18} />,
      description: 'Sistema automatizado de deploy e infraestrutura',
      subsections: [
        'docker-production',
        'nginx-configuracao',
        'supabase-cloud',
        'monitoring-observability',
        'backup-recovery'
      ]
    },
    {
      id: 'getting-started',
      title: 'Primeiros Passos',
      icon: <Zap size={18} />,
      description: 'Guia completo para começar a usar a plataforma',
      subsections: [
        'criar-conta',
        'configurar-perfil',
        'navegacao-basica',
        'tutorial-onboarding'
      ]
    },
    {
      id: 'turmas',
      title: 'Gerenciamento de Turmas',
      icon: <Users size={18} />,
      description: 'Sistema completo de gestão de turmas e alunos',
      subsections: [
        'criar-turma',
        'gerenciar-alunos',
        'configuracoes-turma'
      ]
    },
    {
      id: 'atividades',
      title: 'Sistema de Atividades',
      icon: <FileText size={18} />,
      description: 'Criação, correção e acompanhamento de atividades',
      subsections: [
        'criar-atividade',
        'corrigir-atividades',
        'acompanhamento-desempenho'
      ]
    },
    {
      id: 'internationalization',
      title: 'Internacionalização',
      icon: <Globe size={18} />,
      description: 'Sistema multilíngue e localização',
      subsections: [
        'idiomas-suportados',
        'mudanca-dinamica',
        'traducao-contexto'
      ]
    },
    {
      id: 'accessibility',
      title: 'Acessibilidade',
      icon: <Eye size={18} />,
      description: 'Recursos completos de acessibilidade WCAG 2.1',
      subsections: [
        'alto-contraste',
        'navegacao-teclado',
        'screen-readers',
        'fonte-dislexia'
      ]
    },
    {
      id: 'monitoring',
      title: 'Monitoramento',
      icon: <Activity size={18} />,
      description: 'Sistema avançado de monitoramento e métricas',
      subsections: [
        'health-checks',
        'error-monitoring',
        'performance-tracking',
        'python-dashboards'
      ]
    },
    {
      id: 'api',
      title: 'API & Integrações',
      icon: <Code size={18} />,
      description: 'Documentação técnica para desenvolvedores',
      subsections: [
        'openapi-spec',
        'autenticacao-api',
        'rate-limiting-api',
        'webhooks-edge-functions'
      ]
    },
    {
      id: 'testing',
      title: 'Testes & Qualidade',
      icon: <TestTube size={18} />,
      description: 'Framework completo de testes e qualidade',
      subsections: [
        'testes-automatizados',
        'cobertura-codigo',
        'testes-e2e',
        'performance-tests'
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Suporte & Troubleshooting',
      icon: <HelpCircle size={18} />,
      description: 'Solução de problemas e suporte técnico',
      subsections: [
        'problemas-comuns',
        'debugging',
        'contato-suporte',
        'recursos-comunidade'
      ]
    }
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const renderSidebarSections = () => {
    const q = searchQuery.toLowerCase();
    const filteredSections = sections.filter((section) => {
      const matchTitle = section.title.toLowerCase().includes(q);
      const matchDesc = (section.description || '').toLowerCase().includes(q);
      const matchSubs = Array.isArray(section.subsections)
        ? section.subsections.some((sub) => String(sub).toLowerCase().includes(q))
        : false;
      return matchTitle || matchDesc || matchSubs;
    });

    return filteredSections.map(section => (
      <li key={section.id}>
        <button
          onClick={() => {
            const hasSubsections = Array.isArray(section.subsections) && section.subsections.length > 0;
            if (hasSubsections) {
              toggleSection(section.id);
            } else {
              setActiveSection(section.id);
              setIsMenuOpen(false);
            }
          }}
          className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-md transition-colors ${
            activeSection === section.id
              ? 'bg-secondary text-foreground font-medium'
              : 'text-muted-foreground hover:bg-accent'
          }`}
        >
          <div className="flex items-center">
            <span className="mr-3">{section.icon}</span>
            {section.title}
          </div>
          {Array.isArray(section.subsections) && section.subsections.length > 0 && (
            <span className="ml-2 text-muted-foreground">
              {expandedSections.includes(section.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
        </button>

        {Array.isArray(section.subsections) && expandedSections.includes(section.id) && (
          <ul className="ml-8 mt-1 space-y-1">
            {section.subsections.map((subsection) => (
              <li key={subsection}>
                <button
                  onClick={() => {
                    setActiveSection(`${section.id}-${subsection}`);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-1.5 text-left text-xs rounded-md text-muted-foreground hover:bg-accent"
                >
                  {subsection.split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </li>
    ));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'introduction':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mr-6 shadow-2xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-foreground mb-3">Bem-vindo ao TamanduAI</h1>
                  <p className="text-2xl text-muted-foreground mb-8">
                    Plataforma Educacional Enterprise com IA Avançada e Segurança Completa
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl">
                <p className="text-lg leading-relaxed">
                  O <strong>TamanduAI</strong> é uma plataforma educacional de última geração que combina
                  <strong> tecnologias de inteligência artificial</strong>,
                  <strong> segurança enterprise-grade</strong>,
                  <strong> arquitetura escalável</strong> e
                  <strong> experiência excepcional do usuário</strong> para transformar a educação moderna.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
                <div className="w-12 h-12 bg-blue-100 dark:bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">IA Avançada</h3>
                <p className="text-muted-foreground text-sm">
                  Detecção automática de plágio com Winston AI, assistente inteligente e análise preditiva.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Segurança Enterprise</h3>
                <p className="text-muted-foreground text-sm">
                  RLS, sanitização XSS, hCaptcha, rate limiting, auditoria completa e proteção OWASP Top 10.
                </p>
              </div>

              <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Global & Acessível</h3>
                <p className="text-muted-foreground text-sm">
                  3 idiomas suportados, acessibilidade WCAG 2.1 completa e design responsivo.
                </p>
              </div>

              <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Container className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Deploy Production-Ready</h3>
                <p className="text-muted-foreground text-sm">
                  Docker completo, Nginx otimizado, monitoramento 24/7 e backup automático.
                </p>
              </div>

              <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Dashboards Python</h3>
                <p className="text-muted-foreground text-sm">
                  Dashboards customizados em Python com métricas em tempo real e visualizações interativas.
                </p>
              </div>

              <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Supabase Cloud</h3>
                <p className="text-muted-foreground text-sm">
                  Banco de dados escalável, Edge Functions e autenticação integrada.
                </p>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-purple-50/90 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 rounded-3xl shadow-2xl">
              <h2 className="text-3xl font-black mb-6 flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-500" />
                Recursos Destacados
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Detecção de plágio com IA Winston</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Segurança enterprise-grade completa</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Deploy Docker production-ready</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Dashboards customizados em Python</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Internacionalização completa</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Acessibilidade WCAG 2.1</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Chatbot educacional inteligente</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Sistema de backup automático</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Rate limiting inteligente</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Cache multi-nível otimizado</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Sistema de testes completo</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Documentação técnica abrangente</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 dark:bg-muted/30 rounded-xl">
              <h2 className="text-xl font-bold mb-4">🚀 Production-Ready & Enterprise-Grade</h2>
              <p className="mb-4">
                Esta plataforma foi desenvolvida seguindo as <strong>melhores práticas da indústria</strong>
                e está <strong>100% pronta para produção</strong> com:
              </p>
              <ul className="space-y-2">
                <li>• <strong>Arquitetura escalável</strong> e moderna com Supabase Cloud</li>
                <li>• <strong>Segurança enterprise-grade</strong> com RLS e sanitização completa</li>
                <li>• <strong>Performance otimizada</strong> para milhares de usuários simultâneos</li>
                <li>• <strong>Dashboards customizados</strong> em Python com métricas personalizadas</li>
                <li>• <strong>Sistema de backup e recovery</strong> automático e confiável</li>
                <li>• <strong>Deploy automatizado</strong> com Docker e configurações otimizadas</li>
                <li>• <strong>Documentação técnica completa</strong> para desenvolvedores e DevOps</li>
              </ul>
            </div>
          </div>
        );

      case 'deployment-monitoring-observability':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h1>Monitoramento 24/7 - Sistema Completo de Observabilidade</h1>
            <p className="lead">
              Sistema avançado de monitoramento, métricas e logs para garantir disponibilidade e performance.
            </p>

            <div className="space-y-8">
              <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <Activity className="w-6 h-6 mr-2 text-green-600" />
                  Stack de Monitoramento
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-muted/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <BarChart className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-semibold">Prometheus</h4>
                    <p className="text-sm text-muted-foreground">
                      Coleta de métricas em tempo real
                    </p>
                  </div>

                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <Code className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <h4 className="font-semibold">Python Dashboards</h4>
                    <p className="text-sm text-muted-foreground">
                      Dashboards customizados em Python
                    </p>
                  </div>

                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Search className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold">Elasticsearch</h4>
                    <p className="text-sm text-muted-foreground">
                      Busca avançada e análise de logs
                    </p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-semibold">Vector</h4>
                    <p className="text-sm text-muted-foreground">
                      Agregação e processamento de logs
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <Code className="w-6 h-6 mr-2 text-blue-600" />
                  Dashboards Python Customizados
                </h2>

                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Vantagens dos Dashboards Python</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Flexibilidade total</strong>: Dashboards completamente customizáveis</li>
                      <li>• <strong>Integração direta</strong>: Conexão nativa com banco de dados e APIs</li>
                      <li>• <strong>Visualizações avançadas</strong>: Plotly, Dash e bibliotecas Python modernas</li>
                      <li>• <strong>Automatização</strong>: Scripts personalizados para métricas específicas</li>
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Tecnologias Utilizadas</h3>
                      <ul className="space-y-2">
                        <li>• <strong>Dash</strong>: Framework web para dashboards interativos</li>
                        <li>• <strong>Plotly</strong>: Biblioteca de visualização avançada</li>
                        <li>• <strong>Pandas</strong>: Manipulação e análise de dados</li>
                        <li>• <strong>Redis</strong>: Cache e métricas em tempo real</li>
                        <li>• <strong>PostgreSQL</strong>: Dados históricos e análises</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Recursos Implementados</h3>
                      <ul className="space-y-2">
                        <li>• <strong>Métricas em tempo real</strong>: Atualização automática</li>
                        <li>• <strong>Gráficos interativos</strong>: Zoom, filtros, drill-down</li>
                        <li>• <strong>Logs ao vivo</strong>: Monitoramento de eventos</li>
                        <li>• <strong>Health checks</strong>: Status de todos os serviços</li>
                        <li>• <strong>Alertas customizáveis</strong>: Notificações inteligentes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <BarChart className="w-6 h-6 mr-2 text-blue-600" />
                  Métricas Monitoradas
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Performance</h3>
                    <ul className="space-y-2">
                      <li>• Tempo de resposta da API</li>
                      <li>• Throughput de requests</li>
                      <li>• Uso de CPU e memória</li>
                      <li>• Cache hit rate</li>
                      <li>• Database query performance</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Negócio</h3>
                    <ul className="space-y-2">
                      <li>• Número de usuários ativos</li>
                      <li>• Taxa de conclusão de atividades</li>
                      <li>• Tempo médio de resposta</li>
                      <li>• Erros por usuário</li>
                      <li>• Popularidade de recursos</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <Bell className="w-6 h-6 mr-2 text-red-600" />
                  Alertas e Notificações
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-red-50/90 via-rose-50/70 to-pink-50/90 dark:from-red-950/40 dark:via-rose-950/30 dark:to-pink-950/40 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-800 dark:text-red-200">Alertas Críticos</h4>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• API indisponível por mais de 5 minutos</li>
                      <li>• Erro rate acima de 5%</li>
                      <li>• Tempo de resposta {'>'} 3 segundos</li>
                      <li>• Falha no banco de dados</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Alertas de Warning</h4>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Uso de CPU {'>'} 80%</li>
                      <li>• Memória {'>'} 85%</li>
                      <li>• Cache miss rate alto</li>
                      <li>• Backups com problemas</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                  Dashboards Disponíveis
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 dark:bg-muted/30 rounded-lg">
                      <h4 className="font-semibold">Visão Geral da Plataforma</h4>
                      <p className="text-sm text-muted-foreground">
                        Health checks, usuários ativos, performance geral
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold">Performance da API</h4>
                      <p className="text-sm text-muted-foreground">
                        Tempos de resposta, throughput, erros por endpoint
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold">Banco de Dados</h4>
                      <p className="text-sm text-muted-foreground">
                        Conexões, queries lentas, uso de recursos
                      </p>
                    </div>

                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <h4 className="font-semibold">Logs e Erros</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Análise de erros, padrões de uso, segurança
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-muted/30 p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-4">🔗 Acesso aos Dashboards</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-card text-card-foreground rounded-lg border border-border">
                    <div className="text-lg font-bold text-blue-600 mb-1">Python Dashboards</div>
                    <div className="text-sm text-muted-foreground">http://localhost:8050</div>
                    <div className="text-xs text-muted-foreground">Dashboards customizados</div>
                  </div>
                  <div className="text-center p-3 bg-card text-card-foreground rounded-lg border border-border">
                    <div className="text-lg font-bold text-green-600 mb-1">Prometheus</div>
                    <div className="text-sm text-muted-foreground">http://localhost:9090</div>
                    <div className="text-xs text-muted-foreground">Métricas em tempo real</div>
                  </div>
                  <div className="text-center p-3 bg-card text-card-foreground rounded-lg border border-border">
                    <div className="text-lg font-bold text-purple-600 mb-1">Elasticsearch</div>
                    <div className="text-sm text-muted-foreground">http://localhost:9200</div>
                    <div className="text-xs text-muted-foreground">Busca avançada de logs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'deployment-docker-production':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h1>Docker Production-Ready - Deploy Completo</h1>
            <p className="lead">
              Sistema completo de deploy containerizado com configurações otimizadas para produção.
            </p>

            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <Container className="w-6 h-6 mr-2 text-blue-600" />
                  Arquitetura Docker Atualizada
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Serviços Core</h3>
                    <ul className="space-y-2">
                      <li>• <strong>Frontend</strong>: React/Vite com produção otimizada</li>
                      <li>• <strong>Nginx</strong>: Proxy reverso com headers de segurança</li>
                      <li>• <strong>Redis</strong>: Cache com senha e persistência</li>
                      <li>• <strong>Edge Runtime</strong>: Ambiente para Supabase Functions</li>
                      <li>• <strong>Python Dashboards</strong>: Dashboards customizados em Python</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Serviços de Monitoramento</h3>
                    <ul className="space-y-2">
                      <li>• <strong>Prometheus</strong>: Coleta de métricas</li>
                      <li>• <strong>Elasticsearch</strong>: Busca avançada e logs</li>
                      <li>• <strong>Vector</strong>: Agregação de logs</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <Rocket className="w-6 h-6 mr-2 text-green-600" />
                  Comandos de Deploy
                </h2>

                <div className="space-y-4">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <div className="text-green-400 mb-2"># 1. Configurar ambiente</div>
                    <div>cp .env.example .env</div>
                    <div className="text-gray-400 mt-1"># Edite .env com suas configurações</div>
                  </div>

                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <div className="text-green-400 mb-2"># 2. Iniciar serviços</div>
                    <div>docker-compose up -d</div>
                    <div className="text-gray-400 mt-1"># Todos os serviços iniciam automaticamente</div>
                  </div>

                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <div className="text-green-400 mb-2"># 3. Verificar status</div>
                    <div>docker-compose ps</div>
                    <div className="text-gray-400 mt-1"># Verificar se todos os serviços estão rodando</div>
                  </div>

                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <div className="text-green-400 mb-2"># 4. Dashboards Python</div>
                    <div className="text-gray-400 mt-1"># Acesse http://localhost:8050 para os dashboards customizados</div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <Code className="w-6 h-6 mr-2 text-purple-600" />
                  Serviço Python Dashboards
                </h2>

                <div className="space-y-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Características do Serviço</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Baseado em Dash</strong>: Framework Python para dashboards web</li>
                      <li>• <strong>Visualizações com Plotly</strong>: Gráficos interativos e avançados</li>
                      <li>• <strong>Integração com banco</strong>: Conexão direta com PostgreSQL e Redis</li>
                      <li>• <strong>Atualização automática</strong>: Métricas em tempo real</li>
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Tecnologias</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Flask/Dash para interface web</li>
                        <li>• Plotly para visualizações</li>
                        <li>• Pandas para análise de dados</li>
                        <li>• Redis para métricas em tempo real</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Funcionalidades</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Gráficos interativos com zoom</li>
                        <li>• Filtros e drill-down</li>
                        <li>• Logs ao vivo</li>
                        <li>• Health checks de serviços</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                  Configuração de Produção
                </h3>
                <div className="space-y-3">
                  <p>
                    <strong>Dashboards Python:</strong> O serviço python-dashboards está configurado na porta 8050
                    e integrado com Prometheus para coleta de métricas.
                  </p>
                  <p>
                    <strong>Variáveis obrigatórias:</strong> Configure todas as variáveis no arquivo .env,
                    especialmente SUPABASE_URL, REDIS_PASSWORD e chaves de API.
                  </p>
                  <p>
                    <strong>SSL:</strong> Para produção, configure certificados SSL usando Let&apos;s Encrypt integrado.
                  </p>
                  <p>
                    <strong>Backup:</strong> O sistema de backup automático está configurado para PostgreSQL.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h1>Documentação TamanduAI</h1>
            <p className="lead">
              Plataforma educacional completa com IA avançada, segurança enterprise e deploy production-ready.
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4">🚀 Recursos Implementados</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Brain className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-sm">IA Winston</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Detecção automática de plágio com análise avançada
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-sm">Segurança</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    RLS, XSS protection, rate limiting e auditoria completa
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Container className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-semibold text-sm">Docker</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Deploy completo com Nginx, Redis e monitoramento
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Code className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="font-semibold text-sm">Python Dashboards</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Dashboards customizados com métricas em tempo real
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Globe className="w-5 h-5 text-teal-600 mr-2" />
                    <span className="font-semibold text-sm">i18n</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    3 idiomas suportados com expansão fácil
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Eye className="w-5 h-5 text-indigo-600 mr-2" />
                    <span className="font-semibold text-sm">Acessibilidade</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    WCAG 2.1 completo com recursos avançados
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                Status de Implementação
              </h2>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Funcional</div>
                </div>

                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Monitorado</div>
                </div>

                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">∞</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Escalável</div>
                </div>

                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-1">⚡</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Performance</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center ml-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Documentação TamanduAI</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar na documentação..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">v3.0.0</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full pt-16 md:pt-0">
            <div className="p-6">
              <div className="relative md:hidden mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar na documentação..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <nav className="space-y-2">
                <ul className="space-y-1">
                  {renderSidebarSections()}
                </ul>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>

        {/* Overlay for mobile */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentationPage;

