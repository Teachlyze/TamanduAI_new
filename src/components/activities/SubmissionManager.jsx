import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { FiDownload, FiCheck, FiAlertTriangle, FiUser, FiClock, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { BUCKETS } from '../../services/storageService';
import { useToast } from '@/components/ui/use-toast';
  const SubmissionManager = ({ 
    activityId,
    userId,
    submissions = [],
    isTeacher = false,
    onSubmissionsChange,
    isPlagiarismCheckEnabled = false,
  }) => {
  const [error, setError] = useState(null);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [plagiarismResults, setPlagiarismResults] = useState({});
  const [answersMap, setAnswersMap] = useState({}); // submission_id -> answers[] (from submissions.data)
  const [gradingEdits, setGradingEdits] = useState({}); // submission_id -> { grade, feedback }
  const [selectedGroupId] = useState('all');
  const { toast } = useToast();

  // Carrega os resultados de plágio existentes
  useEffect(() => {
    const loadPlagiarismResults = async () => {
      if (!isTeacher || !isPlagiarismCheckEnabled) return;
      
      try {
        const results = {};
        for (const submission of submissions) {
          if (submission.plagiarism_checked) {
            const { data, error } = await supabase
              .from('plagiarism_checks')
              .select('*')
              .eq('submission_id', submission.id)
              .single();
              
            if (data && !error) {
              results[submission.id] = data;
            }
          }
        }
        setPlagiarismResults(results);
      } catch (err) {
        console.error('Erro ao carregar resultados de plágio:', err);
      }
    };
    
    loadPlagiarismResults();
  }, [submissions, isTeacher, isPlagiarismCheckEnabled]);

  // Build per-submission answers from submissions.data for display only
  useEffect(() => {
    try {
      const map = {};
      (submissions || []).forEach(s => {
        const raw = s.data;
        if (Array.isArray(raw)) {
          map[s.id] = raw.map((item, idx) => ({ id: `${s.id}-${idx}`, question_index: idx + 1, value: item?.answer_text ?? String(item ?? ''), is_correct: null, points_earned: null }));
        } else if (raw && typeof raw === 'object') {
          const entries = Object.entries(raw);
          map[s.id] = entries.map(([key, val], idx) => ({ id: `${s.id}-${key}`, question_index: idx + 1, value: val?.answer_text ?? String(val ?? ''), is_correct: null, points_earned: null }));
        } else {
          map[s.id] = [];
        }
      });
      setAnswersMap(map);
    } catch (e) {
      console.warn('Erro ao processar dados de submissão:', e);
    }
  }, [submissions]);

  // Group management features removed for now (unused UI)

  const filteredSubmissions = submissions.filter(s => selectedGroupId === 'all' ? true : s.group_id === selectedGroupId);

  const returnForRevision = async (submission) => {
    try {
      const message = prompt('Mensagem para o aluno (opcional):', 'Por favor, revise sua submissão conforme os comentários.');
      if (message === null) return;
      const { error } = await supabase
        .from('submissions')
        .update({
          status: 'returned',
          feedback: message,
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.id);
      if (error) throw error;
      if (onSubmissionsChange) {
        onSubmissionsChange(submissions.map(s => s.id === submission.id ? { ...s, status: 'returned', feedback: message } : s));
      }
      toast({ title: 'Devolvida para revisão', description: 'O aluno será notificado.' });
    } catch (e) {
      toast({ title: 'Erro ao devolver', variant: 'destructive' });
    }
  };

  const computeSubmissionScore = (submissionId) => {
    const answers = answersMap[submissionId] || [];
    const totalEarned = answers.reduce((sum, a) => sum + (a.points_earned || 0), 0);
    const totalPossible = answers.length; // rough estimate, ideally from schema
    return { totalEarned, totalPossible };
  };

  // Group member management removed (unused UI)

  const updateAnswerEdit = (submissionId, answerId, field, value) => {
    setAnswersMap(prev => {
      const list = prev[submissionId] ? [...prev[submissionId]] : [];
      const idx = list.findIndex(a => a.id === answerId);
      if (idx >= 0) list[idx] = { ...list[idx], [field]: value };
      return { ...prev, [submissionId]: list };
    });
  };

  const saveGrading = async (submission) => {
    try {
      setError(null);
      const subId = submission.id;
      const overrides = gradingEdits[subId] || {};
      // Update submission (grade/feedback)
      const update = { updated_at: new Date().toISOString() };
      if (typeof overrides.grade !== 'undefined' && overrides.grade !== null) {
        update.grade = overrides.grade;
        update.graded_at = new Date().toISOString();
        update.status = 'graded';
      }
      if (typeof overrides.feedback !== 'undefined') {
        update.feedback = overrides.feedback;
      }
      if (Object.keys(update).length > 1) {
        await supabase.from('submissions').update(update).eq('id', subId);
      }

      // Refresh UI
      if (onSubmissionsChange) {
        onSubmissionsChange(submissions.map(s => s.id === subId ? { ...s, ...update } : s));
      }
      toast({ title: 'Avaliação salva', description: 'Nota e feedback atualizados com sucesso.' });
    } catch (e) {
      console.error('Erro ao salvar avaliação:', e);
      setError('Falha ao salvar avaliação.');
      toast({ title: 'Erro ao salvar avaliação', variant: 'destructive' });
    }
  };

  // Faz o download de um arquivo de submissão
  const handleDownload = async (submission) => {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKETS.SUBMISSIONS)
        .createSignedUrl(submission.file_path, 3600); // URL válida por 1 hora
        
      if (error) throw error;
      
      // Abre o arquivo em uma nova aba
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      
    } catch (err) {
      console.error('Erro ao baixar o arquivo:', err);
      setError('Não foi possível baixar o arquivo. Tente novamente mais tarde.');
    }
  };

  // Verifica plágio para uma submissão específica
  const checkPlagiarism = useCallback(async (submission) => {
    if (!isTeacher || !isPlagiarismCheckEnabled) return;
    
    try {
      setIsCheckingPlagiarism(true);
      setError(null);
      
      // Chama a função de verificação de plágio
      const { data, error } = await supabase.functions.invoke('plagiarism-check', {
        body: JSON.stringify({
          submission_id: submission.id,
          file_path: submission.file_path,
          activity_id: activityId,
          user_id: userId
        })
      });
      
      if (error) throw error;
      
      // Atualiza os resultados de plágio
      setPlagiarismResults(prev => ({
        ...prev,
        [submission.id]: data
      }));
      
      // Atualiza a lista de submissões
      if (onSubmissionsChange) {
        const updatedSubmissions = submissions.map(s => 
          s.id === submission.id 
            ? { ...s, plagiarism_checked: true, plagiarism_score: data.similarity_score || 0 }
            : s
        );
        onSubmissionsChange(updatedSubmissions);
      }
      
      return data;
      
    } catch (err) {
      console.error('Erro ao verificar plágio:', err);
      setError('Não foi possível verificar plágio. Tente novamente mais tarde.');
      throw err;
    } finally {
      setIsCheckingPlagiarism(false);
    }
  }, [activityId, isTeacher, isPlagiarismCheckEnabled, onSubmissionsChange, submissions, userId]);

  // Verifica plágio para todas as submissões
  const checkAllForPlagiarism = async () => {
    if (!isTeacher || !isPlagiarismCheckEnabled) return;
    
    try {
      setIsCheckingPlagiarism(true);
      setError(null);
      
      const results = [];
      for (const submission of filteredSubmissions) {
        if (!submission.plagiarism_checked) {
          const result = await checkPlagiarism(submission);
          results.push(result);
        }
      }
      
      return results;
      
    } catch (err) {
      console.error('Erro ao verificar plágio em lote:', err);
      setError('Ocorreu um erro ao verificar plágio em lote.');
      throw err;
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  // Formata a data
  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString('pt-BR', options);
  };

  // Obtém a cor com base no score de plágio
  const getPlagiarismColor = (score) => {
    if (score === null || score === undefined) return 'gray';
    if (score < 20) return 'green';
    if (score < 50) return 'yellow';
    if (score < 80) return 'orange';
    return 'red';
  };

  // Obtém o texto de status de plágio
  const getPlagiarismStatus = (submission) => {
    if (!isPlagiarismCheckEnabled) return null;
    
    const result = plagiarismResults[submission.id];
    const score = submission.plagiarism_score || (result ? result.similarity_score : null);
    
    if (score === null || score === undefined) {
      return isTeacher ? (
        <button
          onClick={() => checkPlagiarism(submission)}
          className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isCheckingPlagiarism}
        >
          {isCheckingPlagiarism ? 'Verificando...' : 'Verificar plágio'}
        </button>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <FiClock className="mr-1" /> Aguardando verificação
        </span>
      );
    }
    
    const colorClass = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800'
    }[getPlagiarismColor(score)];
    
    if (loading) return <LoadingScreen />;

  return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {score.toFixed(1)}% de similaridade
        </span>
        {isTeacher && result?.report_url && (
          <a
            href={result.report_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Ver relatório
          </a>
        )}
      </div>
    );
  };

  // Verifica se há submissões pendentes de verificação de plágio
  const hasPendingPlagiarismChecks = filteredSubmissions.some(s => !s.plagiarism_checked && isPlagiarismCheckEnabled);

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Submissões dos Alunos
        </h3>
        
        {isTeacher && isPlagiarismCheckEnabled && hasPendingPlagiarismChecks && (
          <button
            type="button"
            onClick={checkAllForPlagiarism}
            disabled={isCheckingPlagiarism}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isCheckingPlagiarism ? 'Verificando...' : 'Verificar plágio em lote'}
          </button>
        )}
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                  onClick={() => setError(null)}
                >
                  <span className="sr-only">Fechar</span>
                  <FiX className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Lista de submissões */}
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
        {filteredSubmissions.length === 0 ? (
          <li className="py-4 px-4 text-center text-gray-500">
            Nenhuma submissão encontrada.
          </li>
        ) : (
          <AnimatePresence>
            {filteredSubmissions.map((submission, index) => (
              <motion.li 
                key={submission.id || `submission-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="px-4 py-4 sm:px-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FiUser className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {submission.user_name || 'Aluno'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <FiClock className="mr-1" />
                        {formatDate(submission.submitted_at || new Date().toISOString())}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Status de plágio */}
                    {getPlagiarismStatus(submission)}
                    
                    {/* Botão de download */}
                    <button
                      type="button"
                      onClick={() => handleDownload(submission)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiDownload className="-ml-0.5 mr-1.5 h-4 w-4" />
                      Baixar
                    </button>
                    
                    {/* Indicador de submissão atual do aluno (se for o aluno visualizando) */}
                    {!isTeacher && submission.user_id === userId && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Sua submissão
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Comentários/feedback e per-answer grading */}
                {submission.feedback && (
                  <div className="mt-3 pl-14">
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p className="font-medium text-gray-900">Feedback do professor:</p>
                      <p className="mt-1">{submission.feedback}</p>
                      {submission.grade !== null && submission.grade !== undefined && (
                        <p className="mt-2 font-medium">
                          Nota: <span className="text-blue-600">{submission.grade}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Editable grading for teachers */}
                {isTeacher && (
                  <div className="mt-4 pl-14 space-y-3">
                    {/* Per-answer list */}
                    {(answersMap[submission.id] || []).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Respostas por pergunta</p>
                        <div className="border rounded-md divide-y">
                          {(answersMap[submission.id] || []).map(ans => (
                            <div key={ans.id} className="p-2 grid grid-cols-1 lg:grid-cols-4 gap-2 items-center">
                              <div className="text-xs text-gray-600">Q{ans.question_index}</div>
                              <div className="text-xs break-words lg:col-span-1">{String(ans.value)}</div>
                              <label className="inline-flex items-center gap-1 text-xs">
                                <input type="checkbox" checked={!!ans.is_correct} onChange={e => updateAnswerEdit(submission.id, ans.id, 'is_correct', e.target.checked)} />
                                Correta
                              </label>
                              <div className="flex items-center gap-1">
                                <span className="text-xs">Pontos:</span>
                                <input type="number" className="w-20 border rounded px-1 py-0.5 text-xs" value={ans.points_earned ?? 0} onChange={e => updateAnswerEdit(submission.id, ans.id, 'points_earned', Number(e.target.value))} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Overall feedback/grade */}
                    <div className="space-y-2">
                      {/* Show computed score inline */}
                      {(() => {
                        const { totalEarned, totalPossible } = computeSubmissionScore(submission.id);
                        const grade = submission.grade ?? (totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : null);
                        if (loading) return <LoadingScreen />;

  return (
                          <div className="text-xs text-gray-600">
                            Pontos computados: {totalEarned} / {totalPossible || '?'}
                            {grade !== null && ` | Nota: ${grade}%`}
                          </div>
                        );
                      })()}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                        <input
                          className="border rounded px-2 py-1 text-sm"
                          placeholder="Feedback geral"
                          value={(gradingEdits[submission.id]?.feedback) || ''}
                          onChange={e => setGradingEdits(prev => ({ ...prev, [submission.id]: { ...(prev[submission.id] || {}), feedback: e.target.value } }))}
                        />
                        <input
                          type="number"
                          className="border rounded px-2 py-1 text-sm"
                          placeholder="Nota final (%)"
                          value={(gradingEdits[submission.id]?.grade) ?? ''}
                          onChange={e => setGradingEdits(prev => ({ ...prev, [submission.id]: { ...(prev[submission.id] || {}), grade: e.target.value === '' ? null : Number(e.target.value) } }))}
                        />
                        <button
                          type="button"
                          onClick={() => saveGrading(submission)}
                          className="justify-self-start inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                        >
                          Salvar avaliação
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => returnForRevision(submission)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Devolver para revisão
                      </button>
                    </div>
                  </div>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        )}
        </ul>
      </div>
    </div>
  );
};

export default SubmissionManager;
