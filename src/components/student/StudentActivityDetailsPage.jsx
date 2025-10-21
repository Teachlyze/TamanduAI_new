import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useXP } from '@/contexts/XPContext';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, LoadingScreen, EmptyState, PremiumButton, toast } from '@/components/ui';
import ChatbotWidget from '@/components/ui/ChatbotWidget';
import PomodoroWidget from '@/components/ui/PomodoroWidget';
import { FileText, Upload } from 'lucide-react';

const StudentActivityDetailsPage = () => {
  const { activityId } = useParams();
  const { user } = useAuth();
  const { addXP } = useXP();
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!activityId) return;
      setLoading(true);
      setError('');
      try {
        const { data: act, error: e1 } = await supabase
          .from('activities')
          .select('*')
          .eq('id', activityId)
          .maybeSingle();
        if (e1) throw e1;
        setActivity(act);

        if (user?.id) {
          const { data: sub } = await supabase
            .from('submissions')
            .select('*')
            .eq('activity_id', activityId)
            .eq('student_id', user.id)
            .maybeSingle();
          setSubmission(sub || null);
        }
      } catch (e) {
        console.error('Erro ao carregar atividade:', e);
        setError('Não foi possível carregar a atividade.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activityId, user?.id]);

  const handleUpload = async () => {
    if (!file || !user?.id) return;
    setSubmitting(true);
    try {
      // Upload para bucket 'submissions'
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${activityId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('submissions').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(path);
      const file_url = urlData?.publicUrl || null;

      // Criar/atualizar submissão
      const payload = {
        activity_id: activityId,
        student_id: user.id,
        content: { file_url, file_name: file.name },
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let submissionData;
      if (submission?.id) {
        const { data, error } = await supabase
          .from('submissions')
          .update(payload)
          .eq('id', submission.id)
          .select()
          .maybeSingle();
        if (error) throw error;
        submissionData = data;
        setSubmission(data);
      } else {
        const { data, error } = await supabase
          .from('submissions')
          .insert(payload)
          .select()
          .maybeSingle();
        if (error) throw error;
        submissionData = data;
        setSubmission(data);
        
        // Adicionar XP apenas na primeira submissão (não em resubmissões)
        await addXP(
          20, 
          'Atividade submetida', 
          { 
            activity_id: activityId,
            submission_id: submissionData.id,
            activity_title: activity.title
          }
        );
      }
      toast.success?.('Atividade enviada com sucesso!');
    } catch (e) {
      console.error('Erro ao enviar atividade:', e);
      toast.error?.('Erro ao enviar atividade');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen message="Carregando atividade..." />;
  if (!activity) return <EmptyState title="Atividade não encontrada" description="Verifique o link e tente novamente." icon={FileText} />;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-2xl text-white">
        <h1 className="text-2xl font-bold">{activity.title}</h1>
        {activity.due_date && (
          <p className="text-white/90">Entrega até {new Date(activity.due_date).toLocaleString('pt-BR')}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          <PremiumCard variant="elevated">
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold mb-1">Descrição</h2>
                <p className="text-muted-foreground">{activity.description || 'Sem descrição'}</p>
              </div>

              <div>
                <h2 className="text-lg font-bold mb-2">Enviar minha resposta</h2>
                <div className="flex items-center gap-3">
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <PremiumButton onClick={handleUpload} disabled={!file || submitting} leftIcon={Upload}>
                    {submitting ? 'Enviando...' : 'Enviar'}
                  </PremiumButton>
                </div>
                {submission && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    Último envio: {new Date(submission.submitted_at || submission.updated_at).toLocaleString('pt-BR')} {submission.content?.file_name ? `- ${submission.content.file_name}` : ''}
                  </div>
                )}
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Sidebar with Pomodoro */}
        <div className="space-y-6">
          <PomodoroWidget variant="full" />
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget context={{ activityId, classId: activity?.class_id }} />
    </div>
  );
};

export default StudentActivityDetailsPage;
