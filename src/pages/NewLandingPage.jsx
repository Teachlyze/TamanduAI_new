import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

const Container = ({ children, className = '', ...props }) => (
  <div 
    className={`max-w-2xl md:max-w-3xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-none mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 ${className}`}
    {...props}
  >
    {children}
  </div>
);

import { 
  BookOpen, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Zap, 
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  Brain,
  Sparkles,
  TrendingUp,
  Clock,
  Award,
  Globe,
  Lightbulb,
  Target,
  Rocket,
  Mail,
  Calendar,
  Heart,
} from 'lucide-react';

// src/pages/LandingPage.jsx
export default function NewLandingPage() {
  const { t } = useTranslation();
  // Removed unused beta form states/handlers and scroll transform to satisfy lints

  const features = [
    {
      icon: Brain,
      title: t('landing.features.ai.title'),
      description: t('landing.features.ai.desc'),
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: t('landing.features.management.title'),
      description: t('landing.features.management.desc'),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Sparkles,
      title: t('landing.features.activities.title'),
      description: t('landing.features.activities.desc'),
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: TrendingUp,
      title: t('landing.features.analytics.title'),
      description: t('landing.features.analytics.desc'),
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: t('landing.benefits.time.title'),
      description: t('landing.benefits.time.desc'),
      stat: "70%"
    },
    {
      icon: TrendingUp,
      title: t('landing.benefits.results.title'),
      description: t('landing.benefits.results.desc'),
      stat: "+45%"
    },
    {
      icon: Lightbulb,
      title: t('landing.benefits.teaching.title'),
      description: t('landing.benefits.teaching.desc'),
      stat: "100%"
    },
    {
      icon: Target,
      title: t('landing.benefits.focus.title'),
      description: t('landing.benefits.focus.desc'),
      stat: "∞"
    }
  ];

  const testimonials = [
    {
      name: "Prof.ª Ana Clara Silva",
      role: "Matemática • Colégio Inovação",
      quote: "O TamanduAI revolucionou minha forma de ensinar. O chatbot responde dúvidas dos alunos 24/7, e eu posso focar no que realmente importa: criar experiências de aprendizado incríveis.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Prof. Carlos Mendes",
      role: "Física • Instituto Federal",
      quote: "Nunca vi uma ferramenta tão completa e fácil de usar. Os relatórios me ajudam a identificar exatamente onde cada aluno precisa de mais atenção. É como ter um assistente pessoal!",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Prof.ª Juliana Santos",
      role: "Biologia • Escola Moderna",
      quote: "A integração com as atividades é perfeita. Meus alunos estão mais engajados e eu consigo acompanhar o progresso de cada um em tempo real. Recomendo para todos os educadores!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5
    }
  ];

  const stats = [
    { number: "10K+", label: t('landing.stats.teachers') },
    { number: "50K+", label: t('landing.stats.students') },
    { number: "1M+", label: t('landing.stats.activities') },
    { number: "99%", label: t('landing.stats.satisfaction') }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-50 shadow-sm">
        <Container>
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TamanduAI
              </span>
              <nav className="hidden md:flex space-x-6 lg:space-x-8 ml-8">
                <a href="#features" className="text-gray-800 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.nav.features')}</a>
                <a href="#benefits" className="text-gray-800 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.nav.benefits')}</a>
                <a href="#testimonials" className="text-gray-800 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.nav.testimonials')}</a>
                <a href="#beta" className="text-gray-800 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.nav.beta')}</a>
                <Link to="/pricing" className="text-gray-800 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.nav.pricing')}</Link>
                <Link to="/docs" className="text-gray-800 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors">{t('landing.nav.docs')}</Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/contact">
                <Button variant="outline" className="border-gray-300 text-gray-900 dark:border-gray-600 dark:text-gray-100">
                  {t('landing.cta.contact')}
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="border-gray-300 text-gray-900 dark:border-gray-600 dark:text-gray-100">
                  {t('landing.cta.signin')}
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="gradient" className="font-medium">
                  {t('landing.cta.getStarted')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-8 md:py-12 lg:py-20 xl:py-24 2xl:py-32">
          <div className="relative">
            <div className="absolute inset-0 overflow-hidden -z-10">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            </div>
            
            <Container className="relative">
            <div className="grid lg:grid-cols-2 gap-4 md:gap-6 lg:gap-12 xl:gap-16 2xl:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-1"
              >
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-800 dark:text-blue-300 mb-6">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('landing.hero.tag')}
                </div>
                
                <h1 className="text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                  {t('landing.hero.title.before')}{' '}
                  <span className="shimmer-text">
                    {t('landing.hero.title.highlight')}
                  </span>{' '}
                  {t('landing.hero.title.after')}
                </h1>
                
                <p className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl">
                  {t('landing.hero.subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link to="/beta">
                    <Button size="lg" variant="gradient" className="shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                      <Rocket className="w-5 h-5 mr-2" />
                      {t('landing.hero.primaryCta')}
                    </Button>
                  </Link>
                  <Link to="/docs">
                    <Button variant="outline" size="lg" className="border-2">
                      <Globe className="w-5 h-5 mr-2" />
                      {t('landing.hero.secondaryCta')}
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {stat.number}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Trusted by */}
                <div className="mt-10">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center mb-4">
                    {t('landing.trusted.title')}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-6 opacity-80">
                    <div className="h-8 w-24 bg-gray-300/40 dark:bg-gray-700/40 rounded" aria-hidden="true"></div>
                    <div className="h-8 w-24 bg-gray-300/40 dark:bg-gray-700/40 rounded" aria-hidden="true"></div>
                    <div className="h-8 w-24 bg-gray-300/40 dark:bg-gray-700/40 rounded" aria-hidden="true"></div>
                    <div className="h-8 w-24 bg-gray-300/40 dark:bg-gray-700/40 rounded" aria-hidden="true"></div>
                    <div className="h-8 w-24 bg-gray-300/40 dark:bg-gray-700/40 rounded" aria-hidden="true"></div>
                  </div>
                </div>
              </motion.div>

              {/* Hero Image - Voltando à animação anterior */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div className="relative">
                  {/* Main illustration - usando SVG ou elementos visuais em vez de imagem */}
                  <div className="w-full h-80 md:h-96 lg:h-[300px] xl:h-[350px] 2xl:h-[400px] bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100 rounded-3xl shadow-2xl overflow-hidden relative">
                    {/* Dashboard mockup com elementos visuais */}
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
                  
                  {/* Floating elements */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl shadow-xl flex items-center justify-center"
                  >
                    <Brain className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl shadow-xl flex items-center justify-center"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                    className="absolute top-1/2 -left-6 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg flex items-center justify-center"
                  >
                    <Heart className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </Container>
        </div>
        </section>

        {/* Compare Section */}
        <section id="compare" className="py-20">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('landing.compare.title')}
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('landing.compare.teachers.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('landing.compare.teachers.items')}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('landing.compare.schools.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('landing.compare.schools.items')}</p>
              </div>
            </div>
          </Container>
        </section>

        {/* How it works */}
        <section id="how" className="py-20">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('landing.how.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Descubra como nossa plataforma funciona em três passos simples
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-6 text-xl font-bold">1</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{t('landing.how.step1.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t('landing.how.step1.text')}</p>
              </div>
              <div className="p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-6 text-xl font-bold">2</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{t('landing.how.step2.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t('landing.how.step2.text')}</p>
              </div>
              <div className="p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mb-6 text-xl font-bold">3</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{t('landing.how.step3.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t('landing.how.step3.text')}</p>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t('landing.features.title.before')}{' '}
                <span className="shimmer-text">
                  {t('landing.features.title.highlight')}
                </span>
              </h2>
              <p className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                {t('landing.features.subtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="group h-full"
                >
                  <div className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-8 h-8 text-white drop-shadow-sm" />
                    </div>
                    <h3 className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t('landing.benefits.title.before')}{' '}
                <span className="shimmer-text">
                  {t('landing.benefits.title.highlight')}
                </span>
              </h2>
              <p className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                {t('landing.benefits.subtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative p-8 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <benefit.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {benefit.stat}
                      </div>
                    </div>
                    <h3 className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-bold text-gray-900 dark:text-white mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Students Benefits Section */}
        <section id="students-benefits" className="py-20 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t('landing.students.title.before')}{' '}
                <span className="shimmer-text">
                  {t('landing.students.title.highlight')}
                </span>
              </h2>
              <p className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                {t('landing.students.subtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg mb-4 flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex-grow">{t('landing.students.item1.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t('landing.students.item1.desc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg mb-4 flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex-grow">{t('landing.students.item2.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t('landing.students.item2.desc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg mb-4 flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex-grow">{t('landing.students.item3.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t('landing.students.item3.desc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mb-4 flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex-grow">{t('landing.students.item4.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t('landing.students.item4.desc')}</p>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Beta Section */}
        <section id="beta" className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium text-white mb-6">
                <Rocket className="w-4 h-4 mr-2" />
                {t('landing.beta.tag')}
              </div>
              
              <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-white mb-6">
                {t('landing.beta.title')}
              </h2>
              <p className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
                {t('landing.beta.subtitle')}
              </p>
              
              <div className="max-w-md mx-auto">
                <Link to="/beta">
                  <Button size="lg" variant="outline" className="bg-white text-purple-700 hover:bg-purple-600 hover:text-white border-white">
                    <Rocket className="w-5 h-5 mr-2" />
                    {t('landing.beta.cta')}
                  </Button>
                </Link>
                <p className="text-blue-100 text-sm mt-4">
                  {t('landing.beta.note')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Calendar className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">{t('landing.beta.card1.title')}</h3>
                  <p className="text-blue-100 text-sm">{t('landing.beta.card1.text')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Shield className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">{t('landing.beta.card2.title')}</h3>
                  <p className="text-blue-100 text-sm">{t('landing.beta.card2.text')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Users className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">{t('landing.beta.card3.title')}</h3>
                  <p className="text-blue-100 text-sm">{t('landing.beta.card3.text')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
          <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                O que dizem nossos{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  educadores
                </span>
              </h2>
              <p className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Histórias reais de transformação na educação
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="flex items-center space-x-4 mb-6">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover shadow-lg"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{testimonial.name}</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">{testimonial.role}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed">
                      <span aria-hidden="true">&ldquo;</span>{testimonial.quote}<span aria-hidden="true">&rdquo;</span>
                    </p>
                    
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
          <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-white mb-6">
                {t('landing.cta.title')}
              </h2>
              <p className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
                {t('landing.cta.subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" variant="outline" className="bg-white text-purple-700 hover:bg-purple-600 hover:text-white border-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <Award className="w-5 h-5 mr-2" />
                    {t('landing.cta.primary')}
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="border-2 border-white/80 bg-white/80 text-purple-900 hover:bg-white hover:text-purple-700 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <Globe className="w-5 h-5 mr-2" />
                    {t('landing.cta.secondary')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TamanduAI
                </span>
              </div>
              <p className="text-gray-400 max-w-md">
                Revolucionando a educação através da inteligência artificial. 
                Capacitando educadores para criar experiências de aprendizado extraordinárias.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Preços</Link></li>
                <li><a href="#beta" className="hover:text-white transition-colors">Beta</a></li>
                <li><Link to="/docs" className="hover:text-white transition-colors">Documentação</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-white transition-colors">Contato</Link></li>
                <li><Link to="/docs" className="hover:text-white transition-colors">Central de Ajuda</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Termos</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2025 TamanduAI. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
