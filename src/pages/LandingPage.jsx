import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SkipLinks from '@/components/SkipLinks';
import LanguageSelector from '@/components/ui/LanguageSelector';
import CookieBanner from '@/components/CookieBanner';
import {
  BookOpen, Users, Sparkles, TrendingUp, Brain,
  Clock, Lightbulb, Target, Rocket, Calendar, Shield,
  Star, Heart, CheckCircle, ArrowRight, Globe, Award,
  Zap, MessageSquare, FileText, BarChart3, Video,
  CheckCircle2, XCircle, Play, ChevronRight, Mail,
  Lock, Smartphone, Laptop, Headphones, BadgeCheck, Trophy, Bell, DollarSign
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    { icon: Brain, title: 'Chatbot com RAG v2.0', description: 'Treine o chatbot com seus materiais (PDF, Word, PPT, URLs) para responder dúvidas 24/7', gradient: "from-violet-500 to-purple-500", badge: 'Até 200 msgs/dia (Pro)' },
    { icon: Shield, title: 'Antiplágio Winston AI', description: 'Detecção automática de plágio com IA de última geração integrada', gradient: "from-red-500 to-pink-500", badge: '100 verificações/hora' },
    { icon: BarChart3, title: 'Analytics com ML', description: '4 modelos de Machine Learning: previsão de desempenho, clustering, sentimento e recomendações', gradient: "from-indigo-500 to-purple-500", badge: 'Inteligência Artificial' },
    { icon: Bell, title: 'Notificações Inteligentes', description: 'Lembretes automáticos de prazos, reuniões e aulas ao vivo via Push + Email', gradient: "from-emerald-500 to-teal-500", badge: 'Push + Email' },
    { icon: Calendar, title: 'Agenda Integrada', description: 'Agende reuniões, aulas ao vivo - integre com Google Meet e Zoom (links externos)', gradient: "from-blue-500 to-cyan-500", badge: 'Links externos' },
    { icon: Trophy, title: 'Gamificação Completa', description: 'Sistema de XP, níveis, badges e rankings que aumenta participação em 40%', gradient: "from-yellow-500 to-orange-500", badge: '+40% engajamento' },
    { icon: Users, title: 'Gestão Inteligente', description: 'Organize turmas, professores e alunos com facilidade', gradient: "from-purple-500 to-indigo-500", badge: 'Turmas ilimitadas' },
    { icon: Sparkles, title: 'Atividades Dinâmicas', description: 'Crie atividades interativas com correção automática', gradient: "from-pink-500 to-rose-500", badge: 'Correção automática' }
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
    { number: "15K+", label: "Professores Ativos" },
    { number: "80K+", label: "Alunos Beneficiados" },
    { number: "2M+", label: "Atividades Criadas" },
    { number: "98.5%", label: "Satisfação" }
  ];

  const allFeatures = [
    { icon: Brain, title: "Chatbot com RAG v2.0", description: "Treine o chatbot com seus materiais (PDF, Word, PPT, URLs) para responder dúvidas 24/7", color: "violet" },
    { icon: Shield, title: "Antiplágio Winston AI", description: "Detecção automática com IA (100 checks/hora) + backup Copyleaks", color: "red" },
    { icon: BarChart3, title: "Previsão de Desempenho", description: "ML prevê próxima nota e tendência do aluno com regressão linear", color: "indigo" },
    { icon: Brain, title: "Clustering de Alunos", description: "Agrupa alunos por desempenho automaticamente (K-Means)", color: "purple" },
    { icon: Target, title: "Análise de Sentimento", description: "Detecta feedbacks negativos automaticamente", color: "pink" },
    { icon: Lightbulb, title: "Recomendações IA", description: "Sugere materiais baseado em dificuldades do aluno", color: "yellow" },
    { icon: Bell, title: "Lembretes Automáticos", description: "Notificações 1h e 5min antes de prazos via cron", color: "emerald" },
    { icon: Trophy, title: "Gamificação Completa", description: "XP, níveis, badges e rankings (16 níveis)", color: "orange" },
    { icon: Calendar, title: "Agenda Sincronizada", description: "Calendário com todas atividades e eventos", color: "blue" },
    { icon: Users, title: "Gestão Multi-perfil", description: "Professor, Aluno e Escola em um só lugar", color: "cyan" },
    { icon: MessageSquare, title: "Banco de Questões", description: "Milhares de questões contribuídas por professores", color: "indigo" },
    { icon: DollarSign, title: "Programa de Descontos", description: "Até 30% OFF contribuindo questões ao banco", color: "green" },
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
    { q: "O TamanduAI é gratuito?", a: "Sim! Oferecemos 3 meses grátis no programa Beta com acesso completo. Depois, planos a partir de R$ 49/mês com desconto de até 30% ao contribuir questões." },
    { q: "Preciso de conhecimento técnico?", a: "Não! A interface é intuitiva e oferecemos tutoriais completos, documentação detalhada e suporte por chat para começar em minutos." },
    { q: "Meus dados estão seguros?", a: "Absolutamente! Usamos criptografia de ponta (AES-256), somos 100% compatíveis com a LGPD e seus dados ficam em servidores seguros no Brasil." },
    { q: "Posso usar em qualquer dispositivo?", a: "Sim! O TamanduAI é 100% responsivo e funciona perfeitamente em computadores, tablets e smartphones (iOS e Android)." },
    { q: "Como funciona o chatbot IA?", a: "Você treina o chatbot fazendo upload de PDFs, Word, PowerPoint ou URLs. Ele usa RAG v2.0 para responder dúvidas dos alunos 24/7 com precisão." },
    { q: "Tem limite de alunos ou turmas?", a: "Não! Você pode adicionar quantos alunos, turmas e professores precisar. Escalamos conforme seu crescimento." },
    { q: "Como funciona o sistema antiplágio?", a: "Usamos Winston AI (100 checks/hora) para detectar plágio e conteúdo gerado por IA automaticamente em todas as submissões." },
    { q: "Posso integrar com outras plataformas?", a: "Sim! Integramos com Google Meet, Zoom (via links) e estamos trabalhando em integrações com Google Classroom e Microsoft Teams." },
  ];

  const useCases = [
    { icon: BookOpen, title: "Professores", description: "Reduza trabalho manual e foque no ensino", gradient: "from-blue-500 to-cyan-500" },
    { icon: Users, title: "Escolas", description: "Centralize gestão de toda instituição", gradient: "from-purple-500 to-pink-500" },
    { icon: Brain, title: "Tutores", description: "Acompanhe alunos individualmente", gradient: "from-indigo-500 to-purple-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                TamanduAI
              </motion.span>
              <nav className="hidden md:flex space-x-6 ml-6">
                <a href="#features" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:underline underline-offset-4 font-medium transition-colors">{t('landing.navigation.features', 'Recursos')}</a>
                <a href="/pricing" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:underline underline-offset-4 font-medium transition-colors">{t('landing.navigation.pricing', 'Preços')}</a>
                <a href="#testimonials" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:underline underline-offset-4 font-medium transition-colors">{t('landing.navigation.testimonials', 'Depoimentos')}</a>
                <Link to="/docs" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:underline underline-offset-4 font-medium transition-colors">{t('landing.navigation.docs', 'Docs')}</Link>
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
                  variant="gradient"
                >
                  {t('landing.navigation.startFree', 'Começar Grátis')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main */}
      <main id="main-content" className="flex-grow w-full">
        <SkipLinks />
        {/* Hero */}
        <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-background">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0]
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0]
              }}
              transition={{ 
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                x: [0, 100, 0]
              }}
              transition={{ 
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
            />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center lg:text-left">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-gray-800 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />{t('landing.hero.subtitle', 'Revolucione sua forma de ensinar')}
                </motion.div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                  Educação Inteligente com <span className="inline-block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-5xl sm:text-6xl lg:text-7xl">Inteligência Artificial</span>
                </h1>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  <strong className="text-indigo-600 dark:text-indigo-400">Versão 2.0:</strong> Chatbot com RAG, Antiplágio Winston AI, Analytics com Machine Learning, Gamificação e Notificações Inteligentes. Tudo em uma plataforma!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-12">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/register')} 
                    leftIcon={<Rocket className="w-5 h-5" />}
                    variant="gradient"
                  >
                    {t('landing.hero.joinBeta', 'Participar do Beta')}
                  </Button>
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/pricing')} 
                    leftIcon={<Zap className="w-5 h-5" />}
                    variant="gradientOutline"
                    className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                  >
                    {t('landing.hero.viewPricing', 'Ver Preços')}
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }} className="text-center">
                      <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{stat.number}</div>
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

        {/* Features v2.0 */}
        <section id="features" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full text-xs font-semibold text-white shadow-sm mb-4">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />Novidades Versão 2.0
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Novas funcionalidades com <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Inteligência Artificial</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Chatbot RAG, Antiplágio, Analytics ML, Gamificação e muito mais</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: i * 0.1 }} className="group h-full">
                  <div className="relative p-6 bg-card text-card-foreground rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border h-full flex flex-col">
                    <div className={`w-16 h-16 bg-gradient-to-r ${f.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                      <f.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed flex-grow mb-4">{f.description}</p>
                    {f.badge && (
                      <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                        <Zap className="w-3 h-3 mr-1" />
                        {f.badge}
                      </div>
                    )}
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
                Resultados <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">comprovados</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Veja o impacto real na sua prática educacional</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: i * 0.1 }} className="group h-full">
                  <div className="p-6 bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                        <b.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{b.stat}</div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{b.title}</h3>
                    <p className="text-muted-foreground leading-relaxed flex-grow">{b.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* All Features Grid */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Tudo que você <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">precisa</span>
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
                  red: 'from-red-400 to-red-600',
                  purple: 'from-purple-400 to-purple-600',
                  yellow: 'from-yellow-400 to-yellow-600'
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
                {t('landing.navigation.howItWorks', 'Como')} <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">funciona</span>
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
                  <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-500/50 hover:scale-105">
                    <div className="relative inline-block mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <span className="text-3xl font-bold text-white">{step.step}</span>
                      </div>
                      <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-lg border-2 border-purple-200 dark:border-purple-800 group-hover:scale-110 transition-transform">
                        <step.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
                  </div>
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
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
                {t('landing.navigation.beforeAfter', 'Antes vs')} <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Depois</span>
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
                {t('landing.navigation.perfectForAll', 'Perfeito para')} <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">todos</span>
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
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full text-sm font-medium text-white shadow-sm mb-6">
                  <Play className="w-4 h-4 mr-2" />{t('landing.navigation.seeAction', 'Veja em ação')}
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Assista como é <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{t('landing.navigation.easy', 'fácil')}</span>
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
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button
                      size="lg"
                      onClick={() => navigate('/pricing')}
                      leftIcon={<Zap className="w-5 h-5" />}
                      variant="gradientOutline"
                      className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                    >
                      {t('landing.features.viewPricing', 'Ver Preços Detalhados')}
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => navigate('/register')}
                      leftIcon={<Rocket className="w-5 h-5" />}
                      variant="gradient"
                    >
                      {t('landing.features.startFree', 'Começar Grátis')}
                    </Button>
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
                {t('landing.navigation.frequentQuestions', 'Perguntas')} <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Frequentes</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">{t('landing.navigation.everythingYouNeed', 'Tudo que você precisa saber')}</p>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.05 }}>
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-start">
                      <span className="w-6 h-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">?</span>
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
        <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium text-white mb-6">
                <Rocket className="w-4 h-4 mr-2" />{t('landing.beta.exclusive', 'Programa Beta Exclusivo')}
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">{t('landing.beta.title', 'Seja um dos primeiros a testar o TamanduAI')}</h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">{t('landing.beta.description', 'Acesso gratuito por 3 meses a todas as funcionalidades. Vagas limitadas!')}</p>
              
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
                  <p className="text-white/80 text-sm">{t('landing.beta.fullAccess', 'Acesso completo a todas funcionalidades')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Shield className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">{t('landing.beta.noCommitment', 'Sem Compromisso')}</h3>
                  <p className="text-white/80 text-sm">{t('landing.beta.cancelAnytime', 'Cancele quando quiser, sem taxas')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Users className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">{t('landing.beta.exclusiveSupport', 'Suporte Exclusivo')}</h3>
                  <p className="text-white/80 text-sm">{t('landing.beta.prioritySupport', 'Atendimento prioritário para beta testers')}</p>
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
                O que dizem nossos <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">educadores</span>
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
        <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">{t('landing.cta.title', 'Pronto para transformar sua educação?')}</h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">{t('landing.cta.description', 'Junte-se a milhares de educadores que já descobriram o poder da IA. Comece gratuitamente!')}</p>
              
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
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">TamanduAI</span>
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
      
      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
}


