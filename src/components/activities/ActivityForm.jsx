import { PremiumCard } from '@/components/ui/PremiumCard'
import { PremiumButton } from '@/components/ui/PremiumButton';
import { useParams } from 'react-router-dom';
import { submitActivity } from '@/services/apiSupabase';
import { useAuth } from "@/hooks/useAuth";
import Loading from '../Loading';
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function ActivityForm({ activity }) {
  // Use environment variable for hCaptcha site key
  const hcaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
  const [captchaToken, setCaptchaToken] = useState('');
  const captchaRef = useRef(null);
  // These variables are intentionally unused for now but may be needed later
  const { classId: _classId } = useParams();
  const { user: _user } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  useEffect(() => {
    // Inicializa o formData com base no schema da atividade
    if (activity && activity.schema.properties) {
      const initialData = {};
      Object.keys(activity.schema.properties).forEach(key => {
        initialData[key] = '';
      });
      setFormData(initialData);
    }
  }, [activity]);

  // Debug: log captcha token changes
  useEffect(() => {
    if (captchaToken) {
      console.log('[ActivityForm] hCaptcha token set:', captchaToken);
    }
  }, [captchaToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCaptchaError('');

    if (!captchaToken) {
      setCaptchaError('Por favor, resolva o captcha para enviar.');
      return;
    }

    setLoading(true);
    try {
      await submitActivity({
        activity_id: activity.id,
        answers: formData,
        hcaptchaToken: captchaToken
      });
      alert('Atividade enviada com sucesso!');
      setCaptchaToken('');
      if (captchaRef.current) captchaRef.current.resetCaptcha();
    } catch (err) {
      setError('Erro ao enviar a atividade. Tente novamente.');
      console.error('Erro ao enviar atividade:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!activity) {
    return <p className="text-center">Atividade não encontrada.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <PremiumCard variant="elevated">
      <h1 className="text-3xl font-bold mb-4">{activity.title}</h1>
      <p className="text-gray-600 mb-6">{activity.description || 'Sem descrição'}</p>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        {Object.entries(activity.schema.properties).map(([key, question]) => (
          <div key={key} className="mb-6">
            <label className="block text-lg font-medium mb-2">
              {question.title}
            </label>
            {question.description && (
              <p className="text-gray-600 mb-3">{question.description}</p>
            )}
            
            {question.type === 'string' ? (
              <input
                type="text"
                name={key}
                value={formData[key] || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite sua resposta"
                required={activity.schema.required?.includes(key)}
              />
            ) : question.type === 'paragraph' ? (
              <textarea
                name={key}
                value={formData[key] || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-32"
                placeholder="Digite sua resposta"
                required={activity.schema.required?.includes(key)}
              />
            ) : question.type === 'radio' ? (
              <div className="space-y-2">
                {question.enumNames?.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={key}
                      value={option}
                      checked={formData[key] === option}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                      required={activity.schema.required?.includes(key)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : question.type === 'checkboxes' ? (
              <div className="space-y-2">
                {question.enumNames?.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name={key}
                      value={option}
                      checked={formData[key]?.includes(option)}
                      onChange={(e) => {
                        const currentValue = formData[key] || [];
                        setFormData(prev => ({
                          ...prev,
                          [key]: e.target.checked 
                            ? [...currentValue, option] 
                            : currentValue.filter(v => v !== option)
                        }));
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        <div className="mb-4 flex justify-center">
          <HCaptcha
            sitekey={hcaptchaSiteKey}
            onVerify={token => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken('')}
            ref={captchaRef}
          />
        </div>
        {captchaError && (
          <p className="text-red-500 text-center mb-2">{captchaError}</p>
        )}
        <button
          type="submit"
          disabled={loading || !captchaToken}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Enviar Atividade'}
        </button>
      </form>
      </PremiumCard>
    </div>
  );
}
