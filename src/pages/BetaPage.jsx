import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Users, 
  Shield,
  CheckCircle,
  Rocket,
  Mail,
  Calendar,
  ArrowLeft,
  Star,
  Clock,
  Award,
  Zap,
  Target
} from 'lucide-react';

export default function BetaPage() {
  const [betaEmail, setBetaEmail] = useState('');
  const [betaSubmitted, setBetaSubmitted] = useState(false);
  const [betaLoading, setBetaLoading] = useState(false);

  const handleBetaSubmit = async (e) => {
    e.preventDefault();
    if (!betaEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(betaEmail)) return;
    
    setBetaLoading(true);
    
    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1500));
      setBetaSubmitted(true);
      setBetaEmail('');
    } catch (error) {
      console.error('Erro ao cadastrar no beta:', error);
    } finally {
      setBetaLoading(false);
    }
  };

  const benefits = [
    {
      icon: Calendar,
      title: "3 Meses Grátis",
      description: "Acesso completo a todas as funcionalidades premium da plataforma",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Sem Compromisso",
      description: "Cancele a qualquer momento, sem taxas ou penalidades",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Suporte Exclusivo",
      description: "Atendimento prioritário e canal direto com nossa equipe",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Star,
      title: "Feedback Valorizado",
      description: "Suas sugestões ajudam a moldar o futuro da plataforma",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Zap,
      title: "Acesso Antecipado",
      description: "Seja o primeiro a testar novas funcionalidades",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Target,
      title: "Treinamento Personalizado",
      description: "Sessões exclusivas para maximizar seu uso da plataforma",
      color: "from-red-500 to-pink-500"
    }
  ];

  const features = [
    "IA Educacional Avançada",
    "Gestão Inteligente de Turmas",
    "Atividades Interativas",
    "Analytics Detalhado",
    "Biblioteca de Recursos",
    "Relatórios Automáticos"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TamanduAI Beta
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
                  Entrar
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-20">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-8">
              <Rocket className="w-5 h-5 mr-2" />
              Programa Beta Exclusivo
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Seja um dos primeiros a{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                revolucionar
              </span>{' '}
              a educação
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              Cadastre-se para o nosso programa beta e tenha acesso gratuito por 3 meses 
              a todas as funcionalidades da plataforma. Vagas limitadas para educadores visionários!
            </p>
          </motion.div>
        </section>

        {/* Registration Form */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-100 dark:border-gray-700"
          >
            {betaSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Cadastro Realizado!</h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Você receberá um e-mail com instruções para acessar o beta em breve. 
                  Fique atento à sua caixa de entrada!
                </p>
                <Link to="/">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Voltar ao Início
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Inscreva-se no Beta
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Preencha seus dados e seja notificado quando o acesso estiver disponível
                  </p>
                </div>

                <form onSubmit={handleBetaSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={betaEmail}
                        onChange={(e) => setBetaEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Enviaremos as instruções para este email.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={betaLoading || !betaEmail}
                      className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-base"
                    >
                      {betaLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processando...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5 mr-2" />
                          Garantir Meu Acesso ao Beta
                        </>
                      )}
                    </Button>
                    
                    <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      * Acesso gratuito por 3 meses • Sem compromisso • Cancele quando quiser
                    </p>
                    
                    <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      Ao se inscrever, você concorda com nossos{' '}
                      <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Termos de Uso
                      </Link>{' '}
                      e{' '}
                      <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Política de Privacidade
                      </Link>.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </section>

        {/* Benefits Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Vantagens{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                exclusivas
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Como beta tester, você terá acesso a benefícios únicos e ajudará a moldar o futuro da educação
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                  <div className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Included */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 lg:p-12 text-center text-white"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Tudo que você precisa, incluído
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Acesso completo a todas as funcionalidades premium durante o período beta
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-900 dark:bg-black text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              TamanduAI
            </span>
          </div>
          <p className="text-gray-400 max-w-md mx-auto">
            Revolucionando a educação através da inteligência artificial.
          </p>
        </div>
      </footer>
    </div>
  );
}
