import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, FileText, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import toast from 'react-hot-toast';

const CreateActivityPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    points: 10,
    type: 'assignment'
  });

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setSaving(true);
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Atividade criada com sucesso!');
      navigate('/dashboard/activities');
    } catch (error) {
      toast.error('Erro ao criar atividade');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <PremiumButton
            variant="outline"
            size="sm"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/dashboard/activities')}
          >
            Voltar
          </PremiumButton>
          <div>
            <h1 className="text-2xl font-bold">Nova Atividade</h1>
            <p className="text-muted-foreground">Crie uma nova atividade para seus alunos</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <PremiumButton
            variant="outline"
            leftIcon={X}
            onClick={() => navigate('/dashboard/activities')}
          >
            Cancelar
          </PremiumButton>
          <PremiumButton
            leftIcon={Save}
            onClick={handleSave}
            loading={saving}
          >
            Criar Atividade
          </PremiumButton>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <PremiumCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Informações Básicas</h2>
              <p className="text-muted-foreground">Configure os detalhes principais da atividade</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Título da Atividade *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: Exercícios de Matemática - Capítulo 5"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Descrição
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva brevemente o objetivo da atividade..."
                className="w-full min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Instruções
              </label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Instruções detalhadas para os alunos..."
                className="w-full min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Data de Entrega
                </label>
                <Input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Pontuação Máxima
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.points}
                  onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 10)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Preview Card */}
        <PremiumCard className="p-6">
          <h3 className="text-lg font-bold mb-4">Preview da Atividade</h3>
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <h4 className="font-bold text-lg mb-2">
              {formData.title || 'Título da Atividade'}
            </h4>
            {formData.description && (
              <p className="text-muted-foreground mb-3">{formData.description}</p>
            )}
            {formData.instructions && (
              <div className="mb-3">
                <strong>Instruções:</strong>
                <p className="mt-1">{formData.instructions}</p>
              </div>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {formData.dueDate && (
                <span>📅 Entrega: {new Date(formData.dueDate).toLocaleString('pt-BR')}</span>
              )}
              <span>🎯 {formData.points} pontos</span>
            </div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  );
};

export default CreateActivityPage;
