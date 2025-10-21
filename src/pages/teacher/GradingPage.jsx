import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import GradingInterface from '@/components/teacher/GradingInterface';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * GradingPage - Wrapper que carrega submission e activity para o GradingInterface
 * Rota: /dashboard/grading/:submissionId
 */
const GradingPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [activity, setActivity] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (submissionId) {
      loadSubmissionData();
    }
  }, [submissionId]);

  const loadSubmissionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar submission com dados do aluno
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .select(`
          *,
          student:student_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('id', submissionId)
        .single();

      if (submissionError) throw submissionError;
      if (!submissionData) throw new Error('Submissão não encontrada');

      setSubmission(submissionData);
      setStudent(submissionData.student);

      // Carregar atividade
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', submissionData.activity_id)
        .single();

      if (activityError) throw activityError;
      if (!activityData) throw new Error('Atividade não encontrada');

      setActivity(activityData);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados da submissão');
      toast.error('Erro ao carregar submissão');
    } finally {
      setLoading(false);
    }
  };

  const handleGradingComplete = () => {
    toast.success('Correção salva com sucesso!');
    navigate('/dashboard/grading');
  };

  const handleBack = () => {
    navigate('/dashboard/grading');
  };

  if (loading) {
    return <LoadingScreen message="Carregando submissão..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <PremiumCard variant="elevated" className="max-w-lg w-full">
          <div className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2">Erro ao Carregar</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="whitespace-nowrap inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Fila</span>
            </button>
          </div>
        </PremiumCard>
      </div>
    );
  }

  if (!submission || !activity || !student) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <PremiumCard variant="elevated" className="max-w-lg w-full">
          <div className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-2">Dados Incompletos</h2>
            <p className="text-muted-foreground mb-6">
              Não foi possível carregar todos os dados necessários
            </p>
            <button
              onClick={handleBack}
              className="whitespace-nowrap inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Fila</span>
            </button>
          </div>
        </PremiumCard>
      </div>
    );
  }

  return (
    <div className="p-6">
      <GradingInterface
        submission={submission}
        activity={activity}
        student={student}
        onComplete={handleGradingComplete}
        onCancel={handleBack}
      />
    </div>
  );
};

export default GradingPage;
