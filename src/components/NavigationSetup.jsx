import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

// This component sets up the navigation for the auth context
export const [loading, setLoading] = useState(true);
  const NavigationSetup = () => {
  const navigate = useNavigate();
  const { setNavigate } = useAuth();

  useEffect(() => {
    // Set the navigate function in the auth context
    if (setNavigate) {
      setNavigate(navigate);
    }
  }, [navigate, setNavigate]);

  return null; // This component doesn't render anything
};

export default NavigationSetup;
