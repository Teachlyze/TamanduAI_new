import { PremiumCard } from '@/components/ui/PremiumCard'
import { PremiumButton } from '@/components/ui/PremiumButton';
import { useParams } from 'react-router-dom';
import { getClassActivities } from '@/services/apiSupabase';
import Loading from '../Loading';

const ActivitiesList = () => {
  const { classId } = useParams();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getClassActivities(classId);
        setActivities(data);
      } catch (err) {
        setError('Erro ao carregar atividades. Tente novamente.');
        console.error('Erro ao carregar atividades:', err);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchActivities();
    }
  }, [classId]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <PremiumCard variant="elevated">
      <h1 className="text-3xl font-bold mb-4">Atividades da Turma</h1>
      
      {activities.length === 0 ? (
        <p className="text-gray-500 text-center">Nenhuma atividade disponível.</p>
      ) : (
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">{activity.title}</h2>
              <p className="text-gray-600 mb-4">{activity.description || 'Sem descrição'}</p>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Criado em: {new Date(activity.created_at).toLocaleDateString()}
                </p>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  onClick={() => {
                    // Aqui você pode adicionar a navegação para o ActivityForm
                    // com os dados da atividade selecionada
                  }}
                >
                  Ver atividade
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </PremiumCard>
    </div>
  );
};

export default ActivitiesList;
