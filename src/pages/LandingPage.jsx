import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SkipLinks } from '@/components/SkipLinks';
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TamanduAI</span>
              <nav className="hidden md:flex space-x-8 ml-8">
                <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.navigation.features', 'Recursos')}</a>
                <a href="#benefits" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.navigation.benefits', 'Benefícios')}</a>
                <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.navigation.testimonials', 'Depoimentos')}</a>
                <Link to="/docs" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.navigation.docs', 'Docs')}</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800">{t('landing.navigation.login', 'Entrar')}</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                  {t('landing.navigation.startFree', 'Começar Grátis')} <ArrowRight className="ml-2 w-4 h-4" />
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
        <section className="relative overflow-hidden py-6 lg:py-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left">
                <div className="flex lg:text-left mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
                    <Sparkles className="w-4 h-4 mr-2" />{t('landing.hero.subtitle', 'Revolucione sua forma de ensinar')}
                  </div>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                  {t('landing.hero.title', 'O futuro da')} <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">{t('landing.hero.title2', 'educação')}</span> {t('landing.hero.title3', 'é agora')}
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl">
                  {t('landing.hero.description', 'Plataforma educacional com IA que reduz sobrecarga administrativa e potencializa o aprendizado. Junte-se a milhares de educadores!')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button size="lg" onClick={() => navigate('/register')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl">
                    <Rocket className="w-5 h-5 mr-2" />Participar do Beta
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/docs')} className="border-2 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400">
                    <Globe className="w-5 h-5 mr-2" />Ver Documentação
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }} className="text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.number}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
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
        <section id="features" className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Recursos que fazem a <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">diferença</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Ferramentas modernas desenvolvidas para educadores</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: i * 0.1 }} className="group h-full">
                  <div className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                    <div className={`w-16 h-16 bg-gradient-to-r ${f.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                      <f.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{f.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Resultados <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">comprovados</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Veja o impacto real na sua prática educacional</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: i * 0.1 }} className="group h-full">
                  <div className="relative h-full flex flex-col p-8 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <b.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{b.stat}</div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{b.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">{b.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* All Features Grid */}
        <section className="py-20 bg-white/50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Tudo que você <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">precisa</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Uma plataforma completa para modernizar sua educação</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {allFeatures.map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.05 }} className="group">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
                    <div className={`w-12 h-12 bg-gradient-to-r from-${feature.color}-400 to-${feature.color}-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {t('landing.navigation.howItWorks', 'Como')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">funciona</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t('landing.navigation.startInSteps', 'Comece em 4 passos simples')}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: i * 0.1 }} className="relative">
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                        {step.step}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                        <step.icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                  </div>
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full">
                      <ChevronRight className="w-8 h-8 text-blue-400 mx-auto" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {t('landing.navigation.beforeAfter', 'Antes vs')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Depois</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">{t('landing.navigation.seeTransformation', 'Veja a transformação na sua rotina')}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="grid grid-cols-3 gap-px bg-gray-200 dark:bg-gray-700">
                <div className="col-span-1 bg-white dark:bg-gray-800 p-4"></div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 text-center">
                  <div className="inline-flex items-center space-x-2 text-red-600 dark:text-red-400 font-bold">
                    <XCircle className="w-5 h-5" />
                    <span>Sem TamanduAI</span>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 text-center">
                  <div className="inline-flex items-center space-x-2 text-green-600 dark:text-green-400 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Com TamanduAI</span>
                  </div>
                </div>

                {comparison.map((item, i) => (
                  <React.Fragment key={i}>
                    <div className="bg-white dark:bg-gray-800 p-4 flex items-center">
                      <span className="text-gray-900 dark:text-white font-medium">{item.feature}</span>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 flex items-center justify-center">
                      {item.before ? <CheckCircle2 className="w-6 h-6 text-red-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 flex items-center justify-center">
                      {item.after ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
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
                      <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                        Saiba Mais <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Video/Demo Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-6">
                  <Play className="w-4 h-4 mr-2" />{t('landing.navigation.seeAction', 'Veja em ação')}
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  Assista como é <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('landing.navigation.easy', 'fácil')}</span>
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Veja em apenas 3 minutos como o TamanduAI pode transformar sua prática educacional.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Interface intuitiva e moderna</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Configuração em minutos</span>
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
                      <span className="text-sm font-medium">Tour pela plataforma</span>
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
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-start">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold mr-3 mt-0.5">?</span>
                      {faq.q}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 pl-9">{faq.a}</p>
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
                  <div className="font-bold text-gray-900 dark:text-white">{t('landing.navigation.lgpdCompliant', 'LGPD Compliant')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('landing.navigation.privacyProtection', 'Dados Protegidos')}</div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex items-center space-x-3">
                <Smartphone className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Multi-Plataforma</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Web, iOS, Android</div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex items-center space-x-3">
                <Headphones className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Suporte 24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sempre disponível</div>
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
                <Rocket className="w-4 h-4 mr-2" />Programa Beta Exclusivo
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Seja um dos primeiros a testar o TamanduAI</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Acesso gratuito por 3 meses a todas as funcionalidades. Vagas limitadas!</p>
              
              <Link to="/register">
                <Button className="bg-white text-purple-600 hover:bg-gray-50 shadow-xl px-8 py-3">
                  <Rocket className="w-5 h-5 mr-2" />Participar do Beta
                </Button>
              </Link>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Calendar className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">3 Meses Grátis</h3>
                  <p className="text-blue-100 text-sm">Acesso completo a todas funcionalidades</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Shield className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Sem Compromisso</h3>
                  <p className="text-blue-100 text-sm">Cancele quando quiser, sem taxas</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Users className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Suporte Exclusivo</h3>
                  <p className="text-blue-100 text-sm">Atendimento prioritário para beta testers</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                O que dizem nossos <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">educadores</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Histórias reais de transformação</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: i * 0.1 }} className="group">
                  <div className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="flex items-center space-x-4 mb-6">
                      <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full object-cover shadow-lg" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.name}</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
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
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Pronto para transformar sua educação?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Junte-se a milhares de educadores que já descobriram o poder da IA. Comece gratuitamente!</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/register')} className="bg-white text-purple-600 hover:bg-gray-50 shadow-xl">
                  <CheckCircle className="w-5 h-5 mr-2" />Começar Gratuitamente
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/contact')} className="bg-transparent text-white border-2 border-white hover:bg-white/10">
                  <Globe className="w-5 h-5 mr-2" />Falar com Especialista
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="footer" className="w-full bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">TamanduAI</span>
              </div>
              <p className="text-gray-400 max-w-md">Revolucionando a educação através da inteligência artificial.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
                <li><Link to="/docs" className="hover:text-white transition-colors">Documentação</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-white transition-colors">Contato</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 TamanduAI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
