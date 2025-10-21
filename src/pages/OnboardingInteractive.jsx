import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { navigateToHome } from '@/utils/roleNavigation';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageCircle,
  Award,
  Sparkles,
  X
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import confetti from 'canvas-confetti';

const onboardingSteps = [
  {
    id: 1,
    title: 'Bem-vindo ao TamanduAI! 🎉',
    description: 'A plataforma educacional completa com IA que vai revolucionar sua forma de ensinar.',
    icon: Sparkles,
    gradient: 'from-blue-500 to-purple-600',
    features: [
      'Gestão completa de turmas e alunos',
      'Atividades interativas e avaliações',
      'Relatórios e analytics em tempo real',
      'Chatbot IA para suporte 24/7'
    ]
  },
  {
    id: 2,
    title: 'Crie sua primeira turma',
    description: 'Organize seus alunos e comece a gerenciar suas aulas de forma profissional.',
    icon: Users,
    gradient: 'from-emerald-500 to-teal-600',
    action: {
      label: 'Criar Turma Agora',
      path: '/dashboard/classes'
    },
    tip: '💡 Dica: Use códigos de convite para que alunos entrem automaticamente!'
  },
  {
    id: 3,
    title: 'Publique atividades',
    description: 'Crie atividades, provas e trabalhos com nosso editor intuitivo.',
    icon: BookOpen,
    gradient: 'from-orange-500 to-red-600',
    action: {
      label: 'Criar Atividade',
      path: '/dashboard/activities/new'
    },
    tip: '⚡ Sistema anti-plágio com IA detecta automaticamente!'
  },
  {
    id: 4,
    title: 'Organize sua agenda',
    description: 'Mantenha controle de aulas, reuniões e prazos em um só lugar.',
    icon: Calendar,
    gradient: 'from-pink-500 to-rose-600',
    action: {
      label: 'Ver Agenda',
      path: '/dashboard/agenda'
    },
    tip: '📅 Receba notificações em tempo real de eventos importantes!'
  },
  {
    id: 5,
    title: 'Chatbot IA sempre disponível',
    description: 'Treine o chatbot com materiais da sua turma para ajudar alunos 24/7.',
    icon: MessageCircle,
    gradient: 'from-purple-500 to-indigo-600',
    action: {
      label: 'Configurar Chatbot',
      path: '/dashboard/chatbot'
    },
    tip: '🤖 O chatbot aprende com seus materiais e responde com base neles!'
  },
  {
    id: 6,
    title: 'Pronto para começar! 🚀',
    description: 'Você está pronto para transformar sua experiência educacional.',
    icon: Award,
    gradient: 'from-yellow-500 to-orange-600',
    action: {
      label: 'Ir para Dashboard',
      path: null // Will be determined by role
    },
    features: [
      '✅ Notificações em tempo real',
      '✅ Anti-plágio com IA',
      '✅ Exportação PDF/Excel',
      '✅ Suporte completo'
    ]
  }
];

export default function OnboardingInteractive() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      // Confetti de comemoração
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setCompleted(true);
      
      // Salvar que o usuário completou o onboarding
      localStorage.setItem('onboarding_completed', 'true');
      
      // Redirecionar após animação
      setTimeout(() => {
        const role = user?.user_metadata?.role || 'student';
        navigateToHome(navigate, role);
      }, 2000);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    const role = user?.user_metadata?.role || 'student';
    navigateToHome(navigate, role);
  };

  const handleAction = (path) => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Pular tour"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Progress bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
        <div className="flex gap-2">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1 rounded-full transition-all ${
                index <= currentStep
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <PremiumCard variant="elevated" className="overflow-hidden">
              {/* Icon header */}
              <div className={`h-48 bg-gradient-to-br ${step.gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="relative z-10"
                >
                  <Icon className="w-24 h-24 text-white" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-3xl font-bold mb-3">{step.title}</h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    {step.description}
                  </p>

                  {/* Features list */}
                  {step.features && (
                    <div className="space-y-3 mb-6">
                      {step.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-foreground">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Action button */}
                  {step.action && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mb-6"
                    >
                      <PremiumButton
                        variant="outline"
                        size="lg"
                        onClick={() => handleAction(step.action.path)}
                        className="w-full"
                      >
                        {step.action.label}
                      </PremiumButton>
                    </motion.div>
                  )}

                  {/* Tip */}
                  {step.tip && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
                    >
                      <p className="text-sm text-foreground">{step.tip}</p>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              {/* Navigation */}
              <div className="px-8 pb-8 flex items-center justify-between gap-4">
                <PremiumButton
                  variant="ghost"
                  leftIcon={ArrowLeft}
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  aria-label="Passo anterior"
                >
                  Anterior
                </PremiumButton>

                <div className="flex items-center gap-2">
                  {onboardingSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep
                          ? 'bg-primary w-8'
                          : 'bg-muted hover:bg-muted-foreground/20'
                      }`}
                      aria-label={`Ir para passo ${index + 1}`}
                    />
                  ))}
                </div>

                <PremiumButton
                  variant="gradient"
                  rightIcon={isLastStep ? Check : ArrowRight}
                  onClick={handleNext}
                  aria-label={isLastStep ? 'Finalizar' : 'Próximo passo'}
                >
                  {isLastStep ? 'Finalizar' : 'Próximo'}
                </PremiumButton>
              </div>
            </PremiumCard>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Completion animation */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
              >
                <Check className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Parabéns! 🎉</h3>
              <p className="text-muted-foreground">
                Você está pronto para usar o TamanduAI
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
