import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { submitActivity } from '@/services/apiSupabase';
import { useToast } from '@/components/ui/use-toast';

  const ActivityForm = ({ activityId }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [error, setError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const { toast } = useToast();

  // Load activity schema
  useEffect(() => {
    const loadActivity = async () => {
      if (!activityId) return;
      
      try {
        // Fetch your activity schema from your data source
        const { data, error } = await supabase
          .from('activities')
          .select('title, schema, ui_schema')
          .eq('id', activityId)
          .single();

        if (error) throw error;
        
        setActivityTitle(data.title);
        const parsedSchema = typeof data.schema === 'string' 
          ? JSON.parse(data.schema) 
          : data.schema;
        const parsedUiSchema = typeof data.ui_schema === 'string'
          ? JSON.parse(data.ui_schema)
          : (data.ui_schema || {});
        
        const fields = parsedSchema.properties ? Object.keys(parsedSchema.properties) : [];
        setFormFields(fields.map((field) => ({
          name: field,
          label: parsedUiSchema[field] ? parsedUiSchema[field].title : field,
          type: parsedSchema.properties[field].type,
          required: parsedSchema.required && parsedSchema.required.includes(field),
        })));
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading activity:', error);
        setError('Failed to load activity');
        setIsLoading(false);
      }
    };

    loadActivity();
  }, [activityId]);

  const onSubmit = async (formData) => {
    e.preventDefault();

    setIsSubmitting(true);
    
    try {
      await submitActivity({
        activity_id: activityId,
        answers: formData
      });
      toast({ title: 'Success!', description: 'Your responses have been submitted.' });
      setSubmissionSuccess(true);
    } catch (error) {
      console.error('Submission error:', error);
      toast({ 
        title: 'Submission failed', 
        description: error.message || 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading form...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (submissionSuccess) {
    /* if (loading) return <LoadingScreen />; */

  return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md" role="alert">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Atividade Enviada!</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Sua atividade foi enviada com sucesso. Você pode fechar esta página ou aguardar o redirecionamento.</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="bg-green-50 text-green-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => window.location.reload()}
              >
                Enviar outra resposta
              </button>
            </PremiumCard>
    </div>
          </div>
        </div>
      </div>
    );
  }

  /* if (loading) return <LoadingScreen />; */

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <PremiumCard variant="elevated">
      <h1 className="text-2xl font-bold mb-4">{activityTitle}</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formFields.map((field) => (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'array' ? (
              <textarea
                {...register(field.name, { required: field.required })}
                className="w-full p-2 border rounded"
                rows={4}
              />
            ) : (
              <input
                type={field.type || 'text'}
                {...register(field.name, { required: field.required })}
                className="w-full p-2 border rounded"
              />
            )}
            
            {errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">This field is required</p>
            )}
          </div>
        ))}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default ActivityForm;
