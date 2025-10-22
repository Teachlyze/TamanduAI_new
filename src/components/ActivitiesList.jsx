import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClassActivities } from '@/services/apiSupabase';

  const ActivitiesList = ({ classId }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        let data = [];
        if (typeof classId === 'undefined') {
          setActivities([]);
          setError('Nenhuma turma selecionada (classId indefinido).');
          console.warn('[ActivitiesList] fetchActivities called with undefined classId');
          setIsLoading(false);
          return;
        }
        if (classId) {
          data = await getClassActivities(classId);
        } else {
          // Se não houver classId, busca todas as atividades (fallback)
          data = await getClassActivities();
        }
        // Filtro de busca local (por título)
        const filtered = searchTerm
          ? data.filter(a => a.title && a.title.toLowerCase().includes(searchTerm.toLowerCase()))
          : data;
        setActivities(filtered || []);
      } catch (err) {
        console.error('Error fetching activities:', err, JSON.stringify(err));
        setError(err?.message || 'Erro ao carregar atividades. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [searchTerm, classId]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('activities')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Remove the deleted activity from the state
        setActivities(activities.filter(activity => activity.id !== id));
      } catch (err) {
        console.error('Error deleting activity:', err, JSON.stringify(err));
        alert(err?.message || 'Erro ao excluir a atividade. Tente novamente.');
      }
    }
  };

  if (isLoading) {
    /* if (loading) return <LoadingScreen />; */

  return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></PremiumCard>
    </div>
      </div>
    );
  }

  // Error handling for denied access (RLS)
  if (error && (typeof error === 'string' ? error.toLowerCase().includes('permission') || error.toLowerCase().includes('recursion') : false)) {
    /* if (loading) return <LoadingScreen />; */

  return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md w-full text-center" role="alert">
          <strong className="font-bold">Acesso negado:</strong>
          <span className="block sm:inline ml-2">Você não tem permissão para acessar as atividades neste momento.<br/>Se você acredita que isso é um erro, entre em contato com o suporte ou seu professor.</span>
        </div>
      </div>
    );
  }

  if (error) {
    /* if (loading) return <LoadingScreen />; */

  return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Erro</p>
        <p>{error}</p>
      </div>
    );
  }

  /* if (loading) return <LoadingScreen />; */

  return (
    <div className="container mx-auto p-4">
      <PremiumCard variant="elevated">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Atividades</h1>
        <Link
          to="/atividade/criar"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Criar Nova Atividade
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar atividades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">Nenhuma atividade encontrada.</p>
          <Link
            to="/atividade/criar"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Criar sua primeira atividade
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/atividade/${activity.id}`}
                      className="text-lg font-medium text-blue-600 hover:text-blue-500 truncate"
                    >
                      {activity.title || 'Atividade sem título'}
                    </Link>
                    <div className="ml-2 flex-shrink-0 flex">
                      <Link
                        to={`/atividade/editar/${activity.id}`}
                        className="mr-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Criada em {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {activity.created_by || 'Autor desconhecido'}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActivitiesList;
