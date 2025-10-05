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
  ChevronRight as ChevronRightIcon
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
      description: 'Visão geral da plataforma TamanduAI e seus recursos avançados'
    },
    {
      id: 'platform-overview',
      title: 'Visão Geral da Plataforma',
      icon: <LayoutDashboard size={18} />,
      description: 'Arquitetura e recursos enterprise implementados',
      subsections: [
        'arquitetura',
        'recursos-principais',
        'seguranca',
        'performance'
      ]
    },
    {
      id: 'ai-features',
      title: 'Recursos de IA',
      icon: <Brain size={18} />,
      description: 'Tecnologias de inteligência artificial integradas',
      subsections: [
        'winston-ai',
        'chatbot-educacional',
        'analise-preditiva'
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
        'analytics'
      ]
    },
    {
      id: 'deployment',
      title: 'Deploy & DevOps',
      icon: <Rocket size={18} />,
      description: 'Sistema automatizado de deploy e manutenção',
      subsections: [
        'deploy-automatizado',
        'ci-cd',
        'backup-recovery',
        'monitoramento-producao'
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
        'rate-limiting',
        'webhooks'
      ]
    },
    {
      id: 'security',
      title: 'Segurança',
      icon: <Shield size={18} />,
      description: 'Medidas de segurança enterprise implementadas',
      subsections: [
        'autenticacao-segura',
        'protecao-dados',
        'auditoria',
        'compliance'
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
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center">
            <span className="mr-3">{section.icon}</span>
            {section.title}
          </div>
          {Array.isArray(section.subsections) && section.subsections.length > 0 && (
            <span className="ml-2 text-gray-500">
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
                  className="flex items-center w-full px-3 py-1.5 text-left text-xs rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
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
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Bem-vindo ao TamanduAI</h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    Plataforma Educacional Enterprise com IA Avançada
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl">
                <p className="text-lg leading-relaxed">
                  O <strong>TamanduAI</strong> é uma plataforma educacional de última geração que combina
                  <strong> tecnologias de inteligência artificial</strong>,
                  <strong> segurança enterprise</strong> e
                  <strong> experiência excepcional do usuário</strong> para transformar a educação moderna.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">IA Avançada</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Detecção automática de plágio com Winston AI e assistente inteligente treinado por turma.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Segurança Enterprise</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  hCaptcha, rate limiting inteligente, auditoria completa e proteção OWASP Top 10.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Global & Acessível</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  3 idiomas suportados, acessibilidade WCAG 2.1 completa e design responsivo.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
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
                    <span>Chatbot educacional inteligente</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Sistema de segurança enterprise</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Internacionalização completa</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Acessibilidade WCAG 2.1</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Monitoramento em tempo real</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Deploy automatizado</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span>Sistema de testes completo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h2 className="text-xl font-bold mb-4">🚀 Pronto para Produção</h2>
              <p className="mb-4">
                Esta plataforma foi desenvolvida seguindo as <strong>melhores práticas da indústria</strong>
                e está <strong>100% pronta para produção</strong> com:
              </p>
              <ul className="space-y-2">
                <li>• Arquitetura escalável e moderna</li>
                <li>• Segurança enterprise-grade</li>
                <li>• Performance otimizada para milhares de usuários</li>
                <li>• Monitoramento profissional 24/7</li>
                <li>• Sistema de backup e recovery automático</li>
                <li>• Documentação técnica completa</li>
              </ul>
            </div>
          </div>
        );

      case 'platform-overview':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h1>Visão Geral da Plataforma</h1>
            <p className="lead">
              Arquitetura completa e recursos enterprise da plataforma TamanduAI.
            </p>

            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <Server className="w-6 h-6 mr-2 text-blue-600" />
                  Arquitetura Técnica
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Backend</h3>
                    <ul className="space-y-2">
                      <li>• <strong>Supabase</strong> com Edge Functions</li>
                      <li>• <strong>PostgreSQL</strong> com migrações automáticas</li>
                      <li>• <strong>Redis</strong> para cache multi-nível</li>
                      <li>• <strong>Row Level Security (RLS)</strong> completo</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Frontend</h3>
                    <ul className="space-y-2">
                      <li>• <strong>React 18</strong> com hooks avançados</li>
                      <li>• <strong>Vite</strong> para build ultra-rápido</li>
                      <li>• <strong>TypeScript</strong> para type safety</li>
                      <li>• <strong>Sistema de design</strong> completo</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <Zap className="w-6 h-6 mr-2 text-yellow-600" />
                  Recursos Avançados
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Brain className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-semibold">IA Winston</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Detecção automática de plágio
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold">Segurança</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      hCaptcha + auditoria completa
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-semibold">i18n</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      3 idiomas + expansão fácil
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <Activity className="w-6 h-6 mr-2 text-green-600" />
                  Monitoramento & Performance
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Health Checks</h3>
                    <ul className="space-y-2">
                      <li>• Monitoramento automático 24/7</li>
                      <li>• Heartbeat para detectar problemas</li>
                      <li>• Reconexão automática inteligente</li>
                      <li>• Métricas de performance em tempo real</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Otimização</h3>
                    <ul className="space-y-2">
                      <li>• Cache inteligente multi-nível</li>
                      <li>• Code splitting automático</li>
                      <li>• Bundle analysis integrado</li>
                      <li>• Service worker avançado</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai-features-winston-ai':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h1>Detecção de Plágio com Winston AI</h1>
            <p className="lead">
              Sistema avançado de detecção de plágio usando inteligência artificial de última geração.
            </p>

            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <Brain className="w-6 h-6 mr-2 text-blue-600" />
                  Como Funciona
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Análise de Texto</h3>
                    <p className="mb-3">
                      O Winston AI analisa o texto submetido comparando com bilhões de fontes online
                      e conteúdo acadêmico para identificar similaridades.
                    </p>
                    <ul className="space-y-2">
                      <li>• <strong>Score de similaridade</strong> detalhado (0-100%)</li>
                      <li>• <strong>Identificação de fontes</strong> originais</li>
                      <li>• <strong>Detecção de paráfrase</strong> inteligente</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Detecção de IA</h3>
                    <p className="mb-3">
                      Além de plágio tradicional, o sistema identifica conteúdo gerado por outras IAs,
                      garantindo integridade acadêmica completa.
                    </p>
                    <ul className="space-y-2">
                      <li>• <strong>Análise de padrões</strong> de geração de IA</li>
                      <li>• <strong>Confiança do resultado</strong> com probabilidade</li>
                      <li>• <strong>Relatórios detalhados</strong> para professores</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <MessageCircle className="w-6 h-6 mr-2 text-green-600" />
                  Integração com o Sistema
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0">1</div>
                    <div>
                      <h3 className="font-semibold">Submissão de Atividade</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Aluno submete atividade normalmente através da plataforma
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0">2</div>
                    <div>
                      <h3 className="font-semibold">Análise Automática</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sistema envia texto para análise na API Winston em background
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0">3</div>
                    <div>
                      <h3 className="font-semibold">Notificação ao Professor</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Professor recebe relatório detalhado com score e fontes identificadas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="flex items-center text-2xl font-bold mb-4">
                  <BarChart className="w-6 h-6 mr-2 text-purple-600" />
                  Relatórios e Métricas
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Relatório Detalhado</h3>
                    <ul className="space-y-2">
                      <li>• <strong>Score geral</strong> de similaridade</li>
                      <li>• <strong>Fontes identificadas</strong> com links</li>
                      <li>• <strong>Trechos destacados</strong> idênticos</li>
                      <li>• <strong>Nível de confiança</strong> da análise</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Métricas da Turma</h3>
                    <ul className="space-y-2">
                      <li>• <strong>Taxa de plágio</strong> por período</li>
                      <li>• <strong>Tendências</strong> de comportamento</li>
                      <li>• <strong>Comparativos</strong> entre alunos</li>
                      <li>• <strong>Alertas automáticos</strong> configuráveis</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                  Considerações Éticas e Legais
                </h3>
                <div className="space-y-3">
                  <p>
                    <strong>Privacidade:</strong> Todo o conteúdo é analisado de forma segura e confidencial.
                    Não armazenamos o conteúdo das submissões após a análise.
                  </p>
                  <p>
                    <strong>Conformidade:</strong> O sistema está em conformidade com LGPD e outras
                    regulamentações de proteção de dados.
                  </p>
                  <p>
                    <strong>Transparência:</strong> Professores e alunos são informados sobre o uso da tecnologia
                    através dos termos de uso e política de privacidade.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h1>Documentação</h1>
            <p className="lead">
              Selecione um tópico no menu lateral para explorar a documentação completa da plataforma TamanduAI.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4">🚀 Plataforma Production-Ready</h2>
              <p>
                Esta documentação cobre todos os aspectos da plataforma TamanduAI, desde recursos básicos
                até funcionalidades avançadas de IA, segurança enterprise e deploy automatizado.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Funcional</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Monitorado</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">∞</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Escalável</div>
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
