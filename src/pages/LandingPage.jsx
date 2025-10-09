import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/button';
import SkipLinks from '@/components/SkipLinks';
import {
  BookOpen, Users, Sparkles, TrendingUp, Brain,
  Clock, Lightbulb, Target, Rocket, Calendar, Shield,
  Star, Heart, CheckCircle, ArrowRight, Globe, Award,
  Zap, MessageSquare, FileText, BarChart3, Video,
  CheckCircle2, XCircle, Play, ChevronRight, Mail,
  Lock, Smartphone, Laptop, Headphones, BadgeCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    { icon: Brain, title: t('landing.features.advancedAI', 'IA Educacional Avançada'), description: t('landing.features.aiChatbot', 'Chatbot inteligente treinado para cada turma'), gradient: "from-violet-500 to-purple-500" },
    { icon: Users, title: t('landing.features.smartManagement', 'Gestão Inteligente'), description: t('landing.features.organizeClasses', 'Organize turmas e professores com facilidade'), gradient: "from-blue-500 to-cyan-500" },
    { icon: Sparkles, title: t('landing.features.dynamicActivities', 'Atividades Dinâmicas'), description: t('landing.features.createInteractive', 'Crie atividades interativas sem limitações'), gradient: "from-indigo-500 to-purple-500" },
    { icon: TrendingUp, title: t('landing.features.intelligentAnalytics', 'Analytics Inteligente'), description: t('landing.features.detailedReports', 'Relatórios detalhados sobre progresso'), gradient: "from-emerald-500 to-teal-500" }
  ];

  const benefits = [
    { icon: Clock, title: t('landing.benefits.saveTime', 'Economiza Tempo'), description: t('landing.benefits.reduceAdmin', 'Reduza 70% do tempo em tarefas administrativas'), stat: "70%" },
    { icon: TrendingUp, title: t('landing.benefits.improveResults', 'Melhora Resultados'), description: t('landing.benefits.increaseEngagement', 'Aumento no engajamento dos alunos'), stat: "+45%" },
    { icon: Lightbulb, title: t('landing.benefits.facilitatesTeaching', 'Facilita Ensino'), description: t('landing.benefits.empowerMethodology', 'Ferramentas que potencializam sua metodologia'), stat: "100%" },
    { icon: Target, title: t('landing.benefits.focusEssential', 'Foco no Essencial'), description: t('landing.benefits.moreTimeTeaching', 'Mais tempo para ensinar, menos burocracia'), stat: "∞" }
  ];

  const testimonials = [
    { name: "Prof.ª Ana Clara Silva", role: "Matemática • Colégio Inovação", quote: "O TamanduAI revolucionou minha forma de ensinar. O chatbot responde dúvidas 24/7!", avatar: "https://ui-avatars.com/api/?name=Ana+Silva&background=4f46e5&color=fff", rating: 5 },
    { name: "Prof. Carlos Mendes", role: "Física • Instituto Federal", quote: "Nunca vi ferramenta tão completa. Os relatórios são perfeitos!", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop", rating: 5 },
    { name: "Prof.ª Juliana Santos", role: "Biologia • Escola Moderna", quote: "Meus alunos estão mais engajados. Acompanho tudo em tempo real!", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop", rating: 5 }
  ];

  const stats = [
    { number: "10K+", label: "Professores Ativos" },
    { number: "50K+", label: "Alunos Beneficiados" },
    { number: "1M+", label: "Atividades Criadas" },
    { number: "99%", label: "Satisfação" }
  ];

  const allFeatures = [
    { icon: Brain, title: "Chatbot IA Personalizado", description: "Assistente inteligente treinado com seu conteúdo", color: "violet" },
    { icon: MessageSquare, title: "Chat em Tempo Real", description: "Comunicação instantânea com alunos e pais", color: "blue" },
    { icon: FileText, title: "Criação de Atividades", description: "Editor poderoso com múltiplos tipos de questões", color: "indigo" },
    { icon: BarChart3, title: "Relatórios Avançados", description: "Analytics completo de desempenho", color: "emerald" },
    { icon: Video, title: "Videoconferências", description: "Aulas ao vivo integradas na plataforma", color: "pink" },
    { icon: Calendar, title: "Agenda Inteligente", description: "Calendário sincronizado com todas atividades", color: "orange" },
    { icon: Users, title: "Gestão de Turmas", description: "Organize alunos, professores e coordenadores", color: "cyan" },
    { icon: Shield, title: "Segurança Total", description: "Criptografia e proteção de dados LGPD", color: "red" },
  ];

  const howItWorks = [
    { step: "1", title: "Cadastre-se Grátis", description: "Crie sua conta em menos de 2 minutos", icon: Rocket },
    { step: "2", title: "Configure sua Turma", description: "Adicione alunos e defina o conteúdo", icon: Users },
    { step: "3", title: "Crie Atividades", description: "Use nossa IA para gerar conteúdo", icon: Sparkles },
    { step: "4", title: "Acompanhe Resultados", description: "Veja analytics em tempo real", icon: TrendingUp },
  ];

  const comparison = [
    { feature: "Correção automática de atividades", before: false, after: true },
    { feature: "Chatbot 24/7 para dúvidas", before: false, after: true },
    { feature: "Relatórios personalizados", before: false, after: true },
    { feature: "Videoconferências integradas", before: false, after: true },
    { feature: "Comunicação centralizada", before: false, after: true },
    { feature: "Tempo gasto em burocracia", before: true, after: false },
  ];

  const faqs = [
    { q: "O TamanduAI é gratuito?", a: "Sim! Oferecemos 3 meses grátis no programa Beta. Depois, planos a partir de R$ 49/mês." },
    { q: "Preciso de conhecimento técnico?", a: "Não! A interface é intuitiva e oferecemos tutoriais completos para começar." },
    { q: "Meus dados estão seguros?", a: "Absolutamente! Usamos criptografia de ponta e somos 100% compatíveis com a LGPD." },
    { q: "Posso usar em qualquer dispositivo?", a: "Sim! O TamanduAI funciona perfeitamente em computadores, tablets e smartphones." },
    { q: "Como funciona o chatbot IA?", a: "Você treina o chatbot com seu material didático e ele responde dúvidas dos alunos 24/7." },
    { q: "Tem limite de alunos?", a: "Não! Você pode adicionar quantos alunos e turmas precisar." },
  ];

  const useCases = [
    { icon: BookOpen, title: "Professores", description: "Reduza trabalho manual e foque no ensino", gradient: "from-blue-500 to-cyan-500" },
    { icon: Users, title: "Escolas", description: "Centralize gestão de toda instituição", gradient: "from-purple-500 to-pink-500" },
    { icon: Brain, title: "Tutores", description: "Acompanhe alunos individualmente", gradient: "from-indigo-500 to-purple-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">TamanduAI</span>
              <nav className="hidden md:flex space-x-6 ml-6">
                <a href="#features" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.navigation.features', 'Recursos')}</a>
                <a href="#benefits" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.navigation.benefits', 'Benefícios')}</a>
                <a href="#testimonials" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.navigation.testimonials', 'Depoimentos')}</a>
                <Link to="/docs" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.navigation.docs', 'Docs')}</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-sm">{t('landing.navigation.login', 'Entrar')}</Button>
              </Link>
              <Link to="/register">
                <Button 
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />} 
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {t('landing.navigation.startFree', 'Começar Grátis')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="flex-grow w-full">
        <SkipLinks />
        {/* Hero */}
        <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-background">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center lg:text-left">
                <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />{t('landing.hero.subtitle', 'Revolucione sua forma de ensinar')}
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                  {t('landing.hero.title', 'O futuro da')} <span className="text-blue-600">{t('landing.hero.title2', 'educação')}</span> {t('landing.hero.title3', 'é agora')}
                </h1>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  {t('landing.hero.description', 'Plataforma educacional com IA que reduz sobrecarga administrativa e potencializa o aprendizado. Junte-se a milhares de educadores!')}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-12">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/register')} 
                    leftIcon={<Rocket className="w-5 h-5" />}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {t('landing.hero.joinBeta', 'Participar do Beta')}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => navigate('/docs')} 
                    leftIcon={<Play className="w-5 h-5" />}
                    className="border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-500 transition-all duration-200"
                  >
                    {t('landing.hero.viewDocs', 'Ver Demonstração')}
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }} className="text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stat.number}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
                <div className="relative">
                  <div className="w-full h-96 bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100 rounded-3xl shadow-2xl overflow-hidden relative">
                    <div className="absolute inset-4 bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full"></div>
                          <div className="w-6 h-6 bg-yellow-100 rounded-full"></div>
                          <div className="w-6 h-6 bg-red-100 rounded-full"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                        <div className="h-3 bg-violet-100 rounded w-2/3"></div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="h-16 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg"></div>
                        <div className="h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg"></div>
                      </div>
                      <div className="mt-4 flex justify-center">
                        <div className="w-32 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl shadow-xl flex items-center justify-center">
                    <Brain className="w-10 h-10 text-white" />
                  </motion.div>
                  <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl shadow-xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 2 }} className="absolute top-1/2 -left-6 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Recursos que fazem a <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">diferença</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Ferramentas modernas desenvolvidas para educadores</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: i * 0.1 }} className="group h-full">
                  <div className="relative p-6 bg-card text-card-foreground rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border h-full flex flex-col">
                    <div className={`w-16 h-16 bg-gradient-to-r ${f.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                      <f.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed flex-grow">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Resultados <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">comprovados</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Veja o impacto real na sua prática educacional</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: i * 0.1 }} className="group h-full">
                  <div className="p-6 bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                        <b.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{b.stat}</div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{b.title}</h3>
                    <p className="text-muted-foreground leading-relaxed flex-grow">{b.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-gradient-to-b from-white to-blue-50/30 dark:from-background dark:to-blue-950/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6">
                <Zap className="w-3.5 h-3.5 mr-1.5" />Oferta Especial de Lançamento
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                Planos que <span className="text-blue-600">cabem no seu bolso</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Escolha o plano ideal para você. Sem taxas ocultas, cancele quando quiser.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Plano Gratuito */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
                <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-8 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gratuito</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Para começar</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold text-gray-900 dark:text-white">R$ 0</span>
                    <span className="text-gray-600 dark:text-gray-400">/mês</span>
                  </div>
                  <Button onClick={() => navigate('/register')} variant="outline" className="w-full mb-6">
                    Começar Grátis
                  </Button>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Até 30 alunos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">1 turma</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Atividades básicas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Suporte por email</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Plano Pro - Destaque */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    MAIS POPULAR
                  </span>
                </div>
                <div className="h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                    <p className="text-blue-100 text-sm">Para profissionais</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold text-white">R$ 49</span>
                    <span className="text-blue-100">/mês</span>
                    <div className="mt-2">
                      <span className="text-sm text-blue-100 line-through">R$ 99/mês</span>
                      <span className="ml-2 text-xs bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full font-bold">50% OFF</span>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/register')} className="w-full mb-6 bg-white text-blue-600 hover:bg-blue-50">
                    Começar Agora
                  </Button>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white font-medium">Alunos ilimitados</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white font-medium">Turmas ilimitadas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white font-medium">Chatbot IA personalizado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white font-medium">Videoconferências</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white font-medium">Analytics avançado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white font-medium">Suporte prioritário</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Plano Instituição */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="relative">
                <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-8 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Instituição</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Para escolas</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold text-gray-900 dark:text-white">Custom</span>
                  </div>
                  <Button onClick={() => navigate('/contact')} variant="outline" className="w-full mb-6">
                    Falar com Vendas
                  </Button>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Tudo do Pro</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Múltiplos professores</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Gestão centralizada</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Treinamento dedicado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">SLA garantido</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-center mt-12">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                🎉 <span className="font-semibold">Oferta Beta:</span> Primeiros 1000 usuários ganham 3 meses grátis no plano Pro!
              </p>
            </motion.div>
          </div>
        </section>

        {/* All Features Grid */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Tudo que você <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">precisa</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Uma plataforma completa para modernizar sua educação</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {allFeatures.map((feature, i) => {
                const colorMap = {
                  violet: 'from-violet-400 to-violet-600',
                  blue: 'from-blue-400 to-blue-600',
                  indigo: 'from-indigo-400 to-indigo-600',
                  emerald: 'from-emerald-400 to-emerald-600',
                  pink: 'from-pink-400 to-pink-600',
                  orange: 'from-orange-400 to-orange-600',
                  cyan: 'from-cyan-400 to-cyan-600',
                  red: 'from-red-400 to-red-600'
                };
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.05 }} className="group">
                    <div className="p-4 bg-card text-card-foreground rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-border h-full hover:scale-105 hover:border-primary/50">
                      <div className={`w-10 h-10 bg-gradient-to-r ${colorMap[feature.color] || 'from-blue-400 to-blue-600'} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {t('landing.navigation.howItWorks', 'Como')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">funciona</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t('landing.navigation.startInSteps', 'Comece em 4 passos simples')}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.6, delay: i * 0.1 }} 
                  className="relative group"
                >
                  <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500/50 hover:scale-105">
                    <div className="relative inline-block mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <span className="text-3xl font-bold text-white">{step.step}</span>
                      </div>
                      <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-lg border-2 border-blue-200 dark:border-blue-800 group-hover:scale-110 transition-transform">
                        <step.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
                  </div>
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {t('landing.navigation.beforeAfter', 'Antes vs')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Depois</span>
              </h2>
              <p className="text-xl text-muted-foreground">{t('landing.navigation.seeTransformation', 'Veja a transformação na sua rotina')}</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Antes */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.8 }}
                className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-8 shadow-xl border-2 border-red-200 dark:border-red-800"
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <XCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-red-700 dark:text-red-400 mb-6">{t('landing.comparison.without', 'Sem TamanduAI')}</h3>
                <ul className="space-y-4">
                  {comparison.filter(item => item.before).map((item, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{item.feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Depois */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.8 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 shadow-xl border-2 border-green-200 dark:border-green-800 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full -mr-16 -mt-16"></div>
                <div className="flex items-center justify-center mb-6 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-green-700 dark:text-green-400 mb-6 relative z-10">{t('landing.comparison.with', 'Com TamanduAI')}</h3>
                <ul className="space-y-4 relative z-10">
                  {comparison.filter(item => item.after).map((item, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{item.feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {t('landing.navigation.perfectForAll', 'Perfeito para')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">todos</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">{t('landing.navigation.idealSolution', 'Independente do seu perfil, temos a solução ideal')}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {useCases.map((useCase, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: i * 0.1 }} className="group">
                  <div className={`relative p-8 bg-gradient-to-br ${useCase.gradient} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                        <useCase.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">{useCase.title}</h3>
                      <p className="text-white/90 leading-relaxed mb-6">{useCase.description}</p>
                      <Button 
                        variant="outline" 
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {t('landing.useCases.learnMore', 'Saiba Mais')}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Video/Demo Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-6">
                  <Play className="w-4 h-4 mr-2" />{t('landing.navigation.seeAction', 'Veja em ação')}
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Assista como é <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('landing.navigation.easy', 'fácil')}</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8">Veja em apenas 3 minutos como o TamanduAI pode transformar sua prática educacional.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-foreground">Interface intuitiva e moderna</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-foreground">Configuração em minutos</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Resultados imediatos</span>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl shadow-2xl overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
                      <Play className="w-8 h-8 text-blue-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm font-medium">{t('landing.video.platformTour', 'Tour pela plataforma')}</span>
                      <span className="text-sm">3:24</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {t('landing.navigation.frequentQuestions', 'Perguntas')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Frequentes</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">{t('landing.navigation.everythingYouNeed', 'Tudo que você precisa saber')}</p>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.05 }}>
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-start">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold mr-3 mt-0.5">?</span>
                      {faq.q}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{faq.a}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-12">
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-green-600" />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{t('landing.navigation.trustedBy', '100% Seguro')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('landing.navigation.dataSecurity', 'Criptografia SSL')}</div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex items-center space-x-3">
                <BadgeCheck className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="font-bold text-foreground">{t('landing.navigation.lgpdCompliant', 'LGPD Compliant')}</div>
                  <div className="text-sm text-muted-foreground">{t('landing.navigation.privacyProtection', 'Dados Protegidos')}</div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex items-center space-x-3">
                <Smartphone className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="font-bold text-foreground">{t('landing.trust.multiPlatform', 'Multi-Plataforma')}</div>
                  <div className="text-sm text-muted-foreground">{t('landing.trust.platforms', 'Web, iOS, Android')}</div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex items-center space-x-3">
                <Headphones className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="font-bold text-foreground">{t('landing.trust.support247', 'Suporte 24/7')}</div>
                  <div className="text-sm text-muted-foreground">{t('landing.trust.alwaysAvailable', 'Sempre disponível')}</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Beta */}
        <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium text-white mb-6">
                <Rocket className="w-4 h-4 mr-2" />{t('landing.beta.exclusive', 'Programa Beta Exclusivo')}
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">{t('landing.beta.title', 'Seja um dos primeiros a testar o TamanduAI')}</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">{t('landing.beta.description', 'Acesso gratuito por 3 meses a todas as funcionalidades. Vagas limitadas!')}</p>
              
              <Link to="/register">
                <Button 
                  size="lg"
                  leftIcon={<Rocket className="w-5 h-5" />}
                  className="bg-white text-purple-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg px-8 py-6"
                >
                  {t('landing.beta.joinBeta', 'Participar do Beta')}
                </Button>
              </Link>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Calendar className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">{t('landing.beta.freeMonths', '3 Meses Grátis')}</h3>
                  <p className="text-blue-100 text-sm">{t('landing.beta.fullAccess', 'Acesso completo a todas funcionalidades')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Shield className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">{t('landing.beta.noCommitment', 'Sem Compromisso')}</h3>
                  <p className="text-blue-100 text-sm">{t('landing.beta.cancelAnytime', 'Cancele quando quiser, sem taxas')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Users className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">{t('landing.beta.exclusiveSupport', 'Suporte Exclusivo')}</h3>
                  <p className="text-blue-100 text-sm">{t('landing.beta.prioritySupport', 'Atendimento prioritário para beta testers')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                O que dizem nossos <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">educadores</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Histórias reais de transformação</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: i * 0.1 }} className="group">
                  <div className="relative p-8 bg-card text-card-foreground rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-border">
                    <div className="flex items-center space-x-4 mb-6">
                      <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full object-cover shadow-lg" />
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{t.name}</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground italic mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex space-x-1">
                      {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">{t('landing.cta.title', 'Pronto para transformar sua educação?')}</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">{t('landing.cta.description', 'Junte-se a milhares de educadores que já descobriram o poder da IA. Comece gratuitamente!')}</p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/register')} 
                  leftIcon={<CheckCircle className="w-6 h-6" />}
                  className="bg-white text-purple-600 hover:bg-gray-50 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 text-xl px-10 py-7 font-bold"
                >
                  {t('landing.cta.startFree', 'Começar Gratuitamente')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/contact')} 
                  leftIcon={<Globe className="w-6 h-6" />}
                  className="bg-transparent text-white border-2 border-white hover:bg-white/20 hover:scale-110 transition-all duration-300 text-xl px-10 py-7 font-bold shadow-xl"
                >
                  {t('landing.cta.talkSpecialist', 'Falar com Especialista')}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="footer" className="w-full bg-background text-foreground py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">TamanduAI</span>
              </div>
              <p className="text-muted-foreground max-w-md">{t('landing.footer.tagline', 'Revolucionando a educação através da inteligência artificial.')}</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">{t('landing.footer.product', 'Produto')}</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">{t('landing.footer.features', 'Recursos')}</a></li>
                <li><Link to="/docs" className="hover:text-foreground transition-colors">{t('landing.footer.documentation', 'Documentação')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">{t('landing.footer.support', 'Suporte')}</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/contact" className="hover:text-foreground transition-colors">{t('landing.footer.contact', 'Contato')}</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">{t('landing.footer.privacy', 'Privacidade')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p>{t('landing.footer.copyright', '© 2025 TamanduAI. Todos os direitos reservados.')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

