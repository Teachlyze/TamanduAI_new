import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Users,
  BookOpen,
  MessageSquare,
  Settings,
  Rocket,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumInput } from '@/components/ui/PremiumInput';
import toast from 'react-hot-toast';

const OnboardingWizard = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    role: '',
    institution: '',
    subjects: [],
    preferences: {
      notifications: true,
      emailDigest: true,
      darkMode: false
    }
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao TamanduAI! 🎉',
      description: 'Vamos configurar sua conta em poucos passos',
      icon: Sparkles
    },
    {
      id: 'role',
      title: 'Qual é seu papel?',
      description: 'Isso nos ajuda a personalizar sua experiência',
      icon: Users
    },
    {
      id: 'subjects',
      title: 'Quais disciplinas você leciona?',
      description: 'Selecione todas que se aplicam',
      icon: BookOpen
    },
    {
      id: 'preferences',
      title: 'Configurações Iniciais',
      description: 'Personalize suas preferências',
      icon: Settings
    },
    {
      id: 'complete',
      title: 'Tudo Pronto! 🚀',
      description: 'Sua conta está configurada',
      icon: Rocket
    }
  ];

  const roles = [
    { value: 'teacher', label: 'Professor(a)', description: 'Crio e gerencio conteúdo educacional' },
    { value: 'coordinator', label: 'Coordenador(a)', description: 'Supervisiono turmas e professores' },
    { value: 'admin', label: 'Administrador(a)', description: 'Gerencio a instituição' }
  ];

  const availableSubjects = [
    'Matemática', 'Português', 'Física', 'Química', 'Biologia',
    'História', 'Geografia', 'Inglês', 'Educação Física', 'Arte',
    'Filosofia', 'Sociologia', 'Redação', 'Programação', 'Outros'
  ];

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      await completeOnboarding();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const completeOnboarding = async () => {
    try {
      // Salvar preferências do usuário
      const { error } = await supabase
        .from('profiles')
        .update({
          role: formData.role,
          institution: formData.institution,
          subjects: formData.subjects,
          preferences: formData.preferences,
          onboarding_completed: true
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Configuração concluída!');
      onComplete?.();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao concluir configuração');
    }
  };

  const toggleSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">{step.title}</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Estamos animados em tê-lo conosco! Vamos personalizar sua experiência para que você aproveite ao máximo nossa plataforma.
            </p>
          </motion.div>
        );

      case 'role':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 max-w-2xl mx-auto">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setFormData({ ...formData, role: role.value })}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    formData.role === role.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.role === role.value ? 'border-primary bg-primary' : 'border-border'
                    }`}>
                      {formData.role === role.value && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{role.label}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 'subjects':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
            <div className="max-w-3xl mx-auto">
              <PremiumInput
                placeholder="Nome da instituição (opcional)"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="mb-6"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSubjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                      formData.subjects.includes(subject)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'preferences':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações Push</p>
                    <p className="text-sm text-muted-foreground">Receba alertas em tempo real</p>
                  </div>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, notifications: !formData.preferences.notifications }
                    })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      formData.preferences.notifications ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      formData.preferences.notifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Resumo Diário por Email</p>
                    <p className="text-sm text-muted-foreground">Receba um resumo das atividades do dia</p>
                  </div>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, emailDigest: !formData.preferences.emailDigest }
                    })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      formData.preferences.emailDigest ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      formData.preferences.emailDigest ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">{step.title}</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
              Sua conta está configurada e pronta para usar. Explore todas as funcionalidades e transforme sua forma de ensinar!
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <span>Turmas Ilimitadas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                </div>
                <span>Chatbot IA</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-green-600" />
                </div>
                <span>Analytics Avançado</span>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'role':
        return formData.role !== '';
      case 'subjects':
        return formData.subjects.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="h-2 bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <PremiumButton
                variant="outline"
                onClick={handleBack}
                leftIcon={ArrowLeft}
              >
                Voltar
              </PremiumButton>
            )}
            
            <PremiumButton
              variant="gradient"
              onClick={handleNext}
              rightIcon={currentStep === steps.length - 1 ? Check : ArrowRight}
              disabled={!canProceed()}
            >
              {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
            </PremiumButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingWizard;
