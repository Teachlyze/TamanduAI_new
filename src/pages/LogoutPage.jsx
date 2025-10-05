import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";

const LogoutPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona imediatamente para a página inicial
    // e executa o logout em segundo plano
    navigate('/', { replace: true });
    
    // Executa o logout após o redirecionamento
    const performLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      }
    };
    
    // Executa o logout sem bloquear a navegação
    performLogout();
    
  }, [logout, navigate]);

  // Retorna null para não renderizar nada
  return null;
};

export default LogoutPage;
