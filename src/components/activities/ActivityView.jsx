import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { supabase } from '@/lib/supabaseClient';
import { BUCKETS } from '../../services/storageService';
import ActivityAttachments from './ActivityAttachments';
import ActivitySubmissionForm from './ActivitySubmissionForm';
import SubmissionManager from './SubmissionManager';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { FiFileText, FiUpload, FiDownload, FiUsers, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { autoGradeSubmission } from '@/services/gradingService';
import { useGamification } from '@/hooks/useGamification';

  const ActivityView = ({ activityId, isTeacher = false, userId }) => {
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const { trackSubmission } = useGamification();
  
  // Carrega os dados da atividade
  useEffect(() => {
    const loadActivity = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Carrega os dados da atividade
        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .select('*')
          .eq('id', activityId)
          .single();
          
        if (activityError) throw activityError;
        
        setActivity(activityData);

        // Load assignment summary
        const { data: assigns } = await supabase
          .from('activity_class_assignments')
          .select('class_id, classes ( id, name, color )')
          .eq('activity_id', activityId);
        setAssignedClasses((assigns || []).map(a => ({ id: a.classes?.id || a.class_id, name: a.classes?.name || 'Turma', color: a.classes?.color })));
        
        // Se for professor, carrega as submissões dos alunos
        if (isTeacher) {
          await loadSubmissions(activityId);
        }
        
      } catch (err) {
        console.error('Erro ao carregar atividade:', err);
        setError('Não foi possível carregar a atividade. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (activityId) {
      loadActivity();
    }
  }, [activityId, isTeacher]);
  
  // Carrega as submissões dos alunos
  const loadSubmissions = async (activityId) => {
    try {
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          *,
          user:profiles (id, full_name, avatar_url)
        `)
        .eq('activity_id', activityId)
        .order('submitted_at', { ascending: false });
        
      if (submissionsError) throw submissionsError;
      
      // Formata os dados das submissões
      const formattedSubmissions = submissionsData.map(sub => ({
        ...sub,
        user_name: sub.user?.full_name || 'Aluno',
        user_avatar: sub.user?.avatar_url
      }));
      
      setSubmissions(formattedSubmissions);
      
    } catch (err) {
      console.error('Erro ao carregar submissões:', err);
      setError('Não foi possível carregar as submissões. Tente novamente mais tarde.');
    }
  };
  
  // Autosave draft upsert
  const handleAutosaveDraft = async ({ answer, files }) => {
    try {
      if (!userId || !activityId) return;
      const { data: existing, error: checkErr } = await supabase
        .from('submissions')
        .select('id')
        .eq('activity_id', activityId)
        .eq('user_id', userId)
        .maybeSingle();
      if (checkErr) throw checkErr;
      if (existing?.id) {
        await supabase
          .from('submissions')
          .update({ data: answer ?? null, attachments: files ?? [], status: 'draft', updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('submissions')
          .insert([{ activity_id: activityId, user_id: userId, data: answer ?? null, attachments: files ?? [], status: 'draft', created_at: new Date().toISOString() }]);
      }
    } catch (e) {
      // silent autosave
    }
  };

  // Manipula o envio de uma nova submissão
  const handleSubmitActivity = async (submissionData) => {
    try {
      setError(null);
      
      // Verifica se já existe uma submissão do usuário para esta atividade
      const { data: existingSubmission, error: checkError } = await supabase
        .from('submissions')
        .select('id')
        .eq('activity_id', activityId)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      let submissionId = existingSubmission?.id;
      
      // Build submission payload using new schema
      const payload = {
        data: submissionData?.answersByIndex ? submissionData.answersByIndex : (submissionData?.answer ?? null),
        attachments: submissionData?.files ?? [],
        submitted_at: new Date().toISOString(),
        status: 'submitted',
        plagiarism_checked: false,
        plagiarism_score: null
      };

      // Se já existe uma submissão, atualiza; caso contrário, cria uma nova
      if (submissionId) {
        const { error: updateError } = await supabase
          .from('submissions')
          .update(payload)
          .eq('id', submissionId);
          
        if (updateError) throw updateError;
      } else {
        const { data: newSubmission, error: insertError } = await supabase
          .from('submissions')
          .insert([
            {
              activity_id: activityId,
              user_id: userId,
              ...payload
            }
          ])
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        submissionId = newSubmission.id;
      }
      
      // Se a verificação de plágio estiver ativada, inicia o processo
      if (activity?.settings?.plagiarism_check_enabled) {
        // Aqui você pode adicionar a lógica para chamar a função de verificação de plágio
        // Por exemplo, usando uma função do Supabase Edge Function
        try {
          const { error: checkError } = await supabase.functions.invoke('plagiarism-check', {
            body: JSON.stringify({
              submission_id: submissionId,
              activity_id: activityId,
              user_id: userId
            })
          });
          
          if (checkError) throw checkError;
          
        } catch (plagiarismError) {
          console.error('Erro ao verificar plágio:', plagiarismError);
          // Não interrompe o fluxo principal em caso de erro na verificação de plágio
        }
      }
      
      // No per-answer table persists; data stored in submissions.data

      // Auto-grade (best-effort)
      try {
        await autoGradeSubmission(submissionId);
      } catch (gradeErr) {
        // Non-blocking; may require manual grading
      }

      // Gamificação: adicionar XP e atualizar missões (somente para alunos)
      if (!isTeacher && userId) {
        try {
          await trackSubmission({
            activityId,
            dueDate: activity?.due_date,
            submittedAt: payload.submitted_at,
            grade: null, // Nota será adicionada depois quando professor corrigir
          });
        } catch (gamErr) {
          console.error('Erro ao registrar gamificação:', gamErr);
          // Não bloqueia a submissão
        }
      }

      // Recarrega as submissões se for professor
      if (isTeacher) {
        await loadSubmissions(activityId);
      }
      
      return true;
      
    } catch (err) {
      console.error('Erro ao enviar submissão:', err);
      setError(err.message || 'Ocorreu um erro ao enviar sua resposta. Tente novamente.');
      throw err;
    }
  };
  
  // Verifica se o usuário já enviou uma resposta
  const userSubmission = submissions.find(sub => sub.user_id === userId);
  
  if (isLoading) {
    if (loading) return <LoadingScreen />;

  return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    if (loading) return <LoadingScreen />;

  return (
      <div className="rounded-md bg-red-50 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }
  
  if (!activity) {
    if (loading) return <LoadingScreen />;

  return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Atividade não encontrada</h3>
        <p className="mt-1 text-sm text-gray-500">A atividade que você está tentando acessar não existe ou foi removida.</p>
      </div>
    );
  }
  
  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-8">
      {/* Cabeçalho da atividade */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{activity.title || 'Sem título'}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {activity.description || 'Nenhuma descrição fornecida.'}
              </p>
              {assignedClasses.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {assignedClasses.map(c => (
                    <span key={c.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#f3f4f6' }}>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: c.color || '#9ca3af' }} />
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {activity.due_date && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Data de entrega:</span>{' '}
                  {new Date(activity.due_date).toLocaleDateString('pt-BR')}
                </div>
              )}
              {activity.total_points !== null && activity.total_points !== undefined && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {activity.total_points} pontos
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Conteúdo da atividade */}
        <div className="px-6 py-5">
          <div className="prose max-w-none">
            {activity.content ? (
              <div dangerouslySetInnerHTML={{ __html: activity.content }} />
            ) : (
              <p className="text-gray-500 italic">Nenhum conteúdo disponível.</p>
            )}
          </div>
          
          {/* Anexos da atividade */}
          {activity.attachments && activity.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Materiais de Apoio</h3>
              <ActivityAttachments
                activityId={activityId}
                userId={userId}
                initialAttachments={activity.attachments}
                isEditing={false}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Abas de navegação */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
          <TabList className="flex border-b border-gray-200">
            {!isTeacher && (
              <Tab className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none border-b-2 border-transparent ui-selected:border-blue-500 ui-selected:text-blue-600">
                <div className="flex items-center">
                  <FiFileText className="mr-2" />
                  {userSubmission ? 'Minha Resposta' : 'Enviar Resposta'}
                </div>
              </Tab>
            )}
            {isTeacher && (
              <Tab className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none border-b-2 border-transparent ui-selected:border-blue-500 ui-selected:text-blue-600">
                <div className="flex items-center">
                  <FiUsers className="mr-2" />
                  Submissões ({submissions.length})
                </div>
              </Tab>
            )}
          </TabList>
          
          {/* Aba de envio de resposta (alunos) */}
          {!isTeacher && (
            <TabPanel>
              <div className="p-6">
                {userSubmission ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FiCheck className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            Você já enviou sua resposta em {new Date(userSubmission.submitted_at).toLocaleString('pt-BR')}.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Sua Resposta</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Enviada em {new Date(userSubmission.submitted_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        {userSubmission.data && typeof userSubmission.data === 'string' ? (
                          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: userSubmission.data }} />
                        ) : userSubmission.data && Array.isArray(userSubmission.data) ? (
                          <ul className="list-disc pl-6">
                            {userSubmission.data.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700 break-words">{String(item?.answer_text ?? item)}</li>
                            ))}
                          </ul>
                        ) : userSubmission.data && typeof userSubmission.data === 'object' ? (
                          <ul className="list-disc pl-6">
                            {Object.entries(userSubmission.data).map(([k, v]) => (
                              <li key={k} className="text-sm text-gray-700 break-words">
                                <span className="font-medium mr-1">{k}:</span> {String(v?.answer_text ?? v)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">Nenhuma resposta em texto fornecida.</p>
                        )}

                        {userSubmission.attachments && userSubmission.attachments.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Arquivos anexados:</h4>
                            <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                              {userSubmission.attachments.map((file, index) => (
                                <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                  <div className="w-0 flex-1 flex items-center">
                                    <FiFileText className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                    <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                                  </div>
                                  <div className="ml-4 flex-shrink-0">
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                      Baixar
                                    </a>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setTabIndex(0)}
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Editar Resposta
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ActivitySubmissionForm
                    activityId={activityId}
                    userId={userId}
                    onSubmit={handleSubmitActivity}
                    onAutosave={handleAutosaveDraft}
                    schema={activity.schema}
                    isSubmitting={false}
                    isPlagiarismCheckEnabled={activity.settings?.plagiarism_check_enabled || false}
                  />
                )}
              </div>
            </TabPanel>
          )}
          
          {/* Aba de submissões (professor) */}
          {isTeacher && (
            <TabPanel>
              <div className="p-6">
                <SubmissionManager
                  activityId={activityId}
                  userId={userId}
                  submissions={submissions}
                  isTeacher={isTeacher}
                  isPlagiarismCheckEnabled={activity.settings?.plagiarism_check_enabled || false}
                  onSubmissionsChange={setSubmissions}
                />
              </div>
            </TabPanel>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ActivityView;
