import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { AlertCircle } from 'lucide-react';

/**
 * Componente para proteger rotas baseado no role do usuário
 * @param {React.ReactNode} children - Componente a ser renderizado se autorizado
 * @param {string[]} allowedRoles - Array de roles permitidos (ex: ['teacher'], ['student'], ['teacher', 'student'])
 */
const RoleProtectedRoute = ({ children, allowedRoles = ['teacher', 'student'] }) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para obter rota home do usuário baseado no role
  const getHomeRoute = (role) => {
    switch (role) {
      case 'student':
        return '/students';
      case 'teacher':
        return '/dashboard';
      case 'school':
        return '/school';
      default:
        return '/';
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Primeiro tentar pegar do user_metadata (mais rápido)
        if (user.user_metadata?.role) {
          console.log('[RoleProtected] Role do metadata:', user.user_metadata.role);
          setUserRole(user.user_metadata.role);
          setLoading(false);
          return;
        }

        // Fallback: buscar da tabela profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, school_id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('[RoleProtected] Erro ao buscar role:', profileError);
          // CRÍTICO: Não definir role em caso de erro - deixar null para negar acesso
          setUserRole(null);
          setError('Não foi possível verificar suas permissões');
        } else if (!profile) {
          console.error('[RoleProtected] Profile não encontrado para user:', user.id);
          setUserRole(null);
          setError('Perfil de usuário não encontrado');
        } else {
          let role = profile.role;
          // Heurística: se usuário possui school_id e está acessando /school, tratar como 'school'
          if (!role && profile?.school_id && location?.pathname?.startsWith('/school')) {
            role = 'school';
          }
          if (!role) {
            console.error('[RoleProtected] Role vazio/null no profile');
            setUserRole(null);
            setError('Role de usuário não definido');
          } else {
            setUserRole(role);
            console.log('[RoleProtected] Role da tabela:', role);
          }
        }
      } catch (err) {
        console.error('[RoleProtected] Erro inesperado:', err);
        setError(err.message);
        setUserRole('student'); // Default seguro
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id, user?.user_metadata?.role, location?.pathname]);

  // Aguardar autenticação
  if (authLoading || loading) {
    return <LoadingScreen message="Verificando permissões..." />;
  }

  // Se não está autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se erro crítico, mostrar mensagem
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-bold text-red-900 dark:text-red-100">Erro de Permissão</h2>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">
            Não foi possível verificar suas permissões. Por favor, tente novamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  // SEGURANÇA: Se userRole for null/undefined, NEGAR acesso
  if (!userRole) {
    console.error('[RoleProtected] ACESSO NEGADO - Role não encontrado ou inválido');
    return <Navigate to="/" replace />;
  }

  // Verificar se o role do usuário está na lista de permitidos
  const isAuthorized = allowedRoles.includes(userRole);

  console.log(`[RoleProtected] Verificando acesso - Role: ${userRole}, Permitidos: [${allowedRoles.join(', ')}], Autorizado: ${isAuthorized}`);

  // Se não autorizado, redirecionar para página de acesso negado
  if (!isAuthorized) {
    console.warn(`[RoleProtected] ACESSO NEGADO - Role: ${userRole}, Permitidos: ${allowedRoles.join(', ')}`);
    // Redirecionar para a home do usuário ao invés de página de erro
    const homeRoute = getHomeRoute(userRole);
    return <Navigate to={homeRoute} replace />;
  }

  // Autorizado, renderizar o componente
  return <>{children}</>;
};

export default RoleProtectedRoute;
