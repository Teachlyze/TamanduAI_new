import { PremiumCard } from '@/components/ui/PremiumCard'
import { PremiumButton } from '@/components/ui/PremiumButton';
import { useParams } from 'react-router-dom';
import { getActivity } from '@/services/apiSupabase';
import ActivityForm from './ActivityForm';
import Loading from '../Loading';

import { useAuth } from "@/hooks/useAuth";

export default function ActivityDetailsPage() {
  const { activityId } = useParams();
  const { user, loading: authLoading, hasRole } = useAuth();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish
    if (!user) {
      setError('Você precisa estar autenticado para ver esta atividade.');
      setLoading(false);
      return;
    }
    if (!activityId) return;
    const fetchActivity = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getActivity(activityId);
        setActivity(data);
      } catch (err) {
        setError('Erro ao carregar atividade. Tente novamente.');
        console.error('Erro ao carregar atividade:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [activityId, user, authLoading]);

  if (loading || authLoading) {
    return <Loading />;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!activity) {
    return <p className="text-center">Atividade não encontrada.</p>;
  }

  // Teachers see the form for editing
  if (hasRole('teacher')) {
    return (
      <div className="container mx-auto p-4">
      <PremiumCard variant="elevated">
        <ActivityForm activity={activity} />
      </PremiumCard>
      </div>
    );
  }

  // Students see a read-only view (you can create a StudentActivityView component)
  return (
    <div className="container mx-auto p-4">
      <PremiumCard variant="elevated">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{activity.title}</h1>
          {activity.description && (
            <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: activity.description }} />
          )}
          <div className="text-center py-8">
            <p className="text-gray-500">Visualização da atividade para alunos será implementada aqui.</p>
            <p className="text-sm text-gray-400 mt-2">Em breve você poderá responder esta atividade.</p>
          </div>
        </div>
      </div>
      </PremiumCard>
    </div>
  );
}
