import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import ActivityBuilder from '../components/ActivityBuilder';
import ActivityView from '../components/activities/ActivityView';
import { useActivityDetails } from '../hooks/useRedisCache';
import { FiArrowLeft } from 'react-icons/fi';

const ActivityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determina o modo com base no caminho da URL
  const getModeFromPath = () => {
    const path = location.pathname;
    if (path.includes('/editar/')) return 'edit';
    if (path.includes('/criar')) return 'create';
    return 'view'; // padrão para visualização
  };

  const [mode, setMode] = useState(getModeFromPath());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Use Redis cache for activity details
  const { data: activityData, loading: activityLoading, error: activityError, invalidateCache } = useActivityDetails(id);

  // Carrega os dados da atividade quando estiver no modo de visualização ou edição
  useEffect(() => {
    const loadActivity = async () => {
      if (mode === 'create') {
        setIsLoading(false); // Set loading to false immediately in create mode
        return;
      }

      if (!id) return;

      try {
        setIsLoading(activityLoading);
        setError(activityError);

        if (activityData) {
          // Transform cache data to component format
          setActivity(activityData);
        } else if (!activityLoading) {
          // Fallback to direct database query if no cache
          const { data, error: fetchError } = await supabase
            .from('activities')
            .select(`
              *,
              class:classes (id, name, description)
            `)
            .eq('id', id)
            .single();

          if (fetchError) throw fetchError;

          setActivity(data);
        }
      } catch (err) {
        console.error('Error loading activity:', err);
        setError('Não foi possível carregar a atividade. Por favor, tente novamente.');
      }
    };

    loadActivity();
  }, [id, mode, activityData, activityLoading, activityError]);
  
  // Verifica a autenticação do usuário e carrega o perfil
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        
        const isAuth = !!session;
        console.log('Is authenticated:', isAuth);
        setIsAuthenticated(isAuth);
        
        if (!isAuth) {
          console.log('Not authenticated, redirecting to login...');
          navigate('/login');
          return;
        }
        
        // Carrega os dados do usuário
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          throw userError;
        }
        
        setUser(authUser);
        
        // Verifica se o usuário é professor
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_teacher')
          .eq('id', authUser.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }
        
        const isTeacher = profile?.is_teacher || false;
        
        // Se estiver no modo de edição, verifica se é o dono da atividade
        if (mode === 'edit' && activity) {
          if (activity.created_by !== authUser?.id && !isTeacher) {
            console.log('User is not the owner, redirecting to view mode...');
            navigate(`/dashboard/activities/${id}`, { replace: true });
            setMode('view');
          }
        }
        
        console.log('Authentication check passed, setting loading to false');
        setIsLoading(false);
        
      } catch (error) {
        console.error('Error in auth check:', error);
        setError('Ocorreu um erro ao verificar a autenticação.');
        setIsLoading(false);
      }
    };

    if (activity || mode === 'create') {
      checkAuth();
    }
  }, [navigate, id, mode, activity]);

  // Handle successful activity creation
  const handleActivityCreated = async (activityId) => {
    // Invalida o cache para garantir que os dados mais recentes sejam buscados
    if (invalidateCache) {
      await invalidateCache(activityId);
    }
    
    // Redireciona para a visualização da atividade
    navigate(`/dashboard/activities/${activityId}`, { replace: true });
    
    // Atualiza o modo para visualização
    setMode('view');
    
    // Força o recarregamento da atividade
    if (activityId) {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();
        
      if (!error) {
        setActivity(data);
      }
    }
  };

  // Exibe um indicador de carregamento enquanto verifica a autenticação ou carrega os dados
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redireciona para o login se não estiver autenticado
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p>Redirecionando para a página de login...</p>
        </div>
      </div>
    );
  }
  
  // Exibe mensagem de erro se ocorrer algum problema
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verifica se o usuário atual é um professor
  const isTeacher = user?.user_metadata?.is_teacher || false;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiArrowLeft className="h-5 w-5" />
                <span className="sr-only">Voltar</span>
              </button>
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">
                  {mode === 'create' 
                    ? 'Criar Atividade' 
                    : mode === 'edit' 
                      ? 'Editar Atividade' 
                      : activity?.title || 'Visualizar Atividade'}
                </h1>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-gray-100"
              >
                Dashboard
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/login');
                }}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-gray-100"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {mode === 'create' ? (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Criar Nova Atividade</h2>
                <p className="mt-1 text-sm text-gray-500">Preencha os detalhes abaixo para criar uma nova atividade.</p>
              </div>
              <ActivityBuilder 
                onActivityCreated={handleActivityCreated} 
                userId={user?.id}
              />
            </div>
          ) : mode === 'edit' && activity ? (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Editar Atividade</h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setMode('view')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      form="activity-form"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ActivityBuilder 
                  activityId={id} 
                  initialData={activity}
                  onActivityCreated={handleActivityCreated}
                  userId={user?.id}
                />
              </div>
            </div>
          ) : activity ? (
            <ActivityView 
              activityId={id}
              isTeacher={isTeacher}
              userId={user?.id}
            />
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Atividade não encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">A atividade que você está tentando acessar não existe ou foi removida.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Voltar para o Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActivityPage;
