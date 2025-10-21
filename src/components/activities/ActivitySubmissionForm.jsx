import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useForm } from 'react-hook-form';
import { FiUpload, FiCheck, FiAlertCircle, FiFileText, FiX } from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';
import useActivityFiles from '../../hooks/useActivityFiles';
import FileUploader from './FileUploader';
import { BUCKETS } from '../../services/storageService';

  const ActivitySubmissionForm = ({
  activityId,
  userId,
  onSubmit,
  onAutosave,
  schema = null,
  isSubmitting = false,
  initialData = null,
  isPlagiarismCheckEnabled = false,
  maxFiles = 5,
  maxSize = 20 * 1024 * 1024, // 20MB
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: initialData || {
      answer: '',
      files: [],
      agreeTerms: false,
    },
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [formError, setFormError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  
  const { uploadSubmission } = useActivityFiles(activityId, userId);
  const [answersByIndex, setAnswersByIndex] = useState({});
  
  // Observa mudanças no campo de arquivos do formulário (memoized to calm lint)
  const watchedFiles = watch('files');
  const files = useMemo(() => watchedFiles || [], [watchedFiles]);
  const answer = watch('answer') || '';
  
  // Atualiza o formulário quando initialData mudar
  useEffect(() => {
    if (initialData) {
      reset({
        answer: initialData.answer || '',
        files: initialData.files || [],
        agreeTerms: initialData.agreeTerms || false,
      }, []); // TODO: Add dependencies
    }
  }, [initialData, reset]);

  // Autosave draft (debounced)
  useEffect(() => {
    if (!onAutosave) return;
    const t = setTimeout(() => {
      try {
        onAutosave({ answer, files, answersByIndex }, []); // TODO: Add dependencies
      } catch (e) {
        // silent
      }
    }, 1000);
    if (loading) return <LoadingScreen />;

  return () => clearTimeout(t);
  }, [answer, files, answersByIndex, onAutosave]);
  
  // Manipula o upload de arquivos
  const handleFileUpload = async (newFiles) => {
    if (!newFiles || newFiles.length === 0) return;
    
    const uploadedFiles = [];
    const uploadErrors = [];
    
    try {
      setIsUploading(true);
      
      for (const file of newFiles) {
        try {
          // Verifica se o arquivo já foi adicionado
          if (files.some(f => f.name === file.name)) {
            uploadErrors.push(`O arquivo "${file.name}" já foi adicionado.`);
            continue;
          }
          
          // Cria um ID temporário para o arquivo
          const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Atualiza o progresso
          setUploadProgress(prev => ({
            ...prev,
            [tempId]: 0
          }));
          
          // Faz o upload do arquivo
          const { data: uploadedFile, error } = await uploadSubmission(file, tempId);
          
          if (error) {
            throw new Error(`Falha ao fazer upload de ${file.name}: ${error.message}`);
          }
          
          uploadedFiles.push({
            ...uploadedFile,
            tempId,
            isNew: true
          });
          
        } catch (error) {
          console.error('Erro ao fazer upload do arquivo:', error);
          uploadErrors.push(error.message || `Erro ao fazer upload de ${file.name}`);
        }
      }
      
      // Atualiza a lista de arquivos no formulário
      if (uploadedFiles.length > 0) {
        setValue('files', [...files, ...uploadedFiles]);
      }
      
      // Exibe erros, se houver
      if (uploadErrors.length > 0) {
        setFormError(uploadErrors.join('\n'));
      }
      
      return uploadedFiles;
      
    } catch (error) {
      console.error('Erro no processo de upload:', error);
      setFormError('Ocorreu um erro ao processar os arquivos. Tente novamente.');
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };
  
  // Remove um arquivo da lista
  const handleRemoveFile = (fileToRemove, index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setValue('files', newFiles);
    
    // TODO: Remover o arquivo do storage se for um upload novo
    // if (fileToRemove.isNew && fileToRemove.path) {
    //   removeFile(fileToRemove.path);
    // }
  };
  
  // Submete o formulário
  const handleFormSubmit = async (data) => {
    e.preventDefault();

    if (isSubmitting || isUploading) return;
    
    try {
      setFormError(null);
      
      // Validação adicional
      if (!data.answer && (!data.files || data.files.length === 0)) {
        throw new Error('Por favor, insira uma resposta ou anexe pelo menos um arquivo.');
      }
      
      if (isPlagiarismCheckEnabled && !data.agreeTerms) {
        throw new Error('Você deve concordar com os termos de verificação de plágio.');
      }
      
      // Prepara os dados para envio
      const submissionData = {
        ...data,
        activityId,
        userId,
        submittedAt: new Date().toISOString(),
        answersByIndex,
      };
      
      // Chama a função de submissão fornecida
      if (onSubmit) {
        await onSubmit(submissionData);
        setSubmissionSuccess(true);
      }
      
    } catch (error) {
      console.error('Erro ao enviar a submissão:', error);
      setFormError(error.message || 'Ocorreu um erro ao enviar sua submissão. Tente novamente.');
    }
  };
  
  // Se a submissão foi bem-sucedida, exibe mensagem de sucesso
  if (submissionSuccess) {
    if (loading) return <LoadingScreen />;

  return (
      <div className="rounded-md bg-green-50 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiCheck className="h-5 w-5 text-green-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Submissão enviada com sucesso!
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Sua resposta foi registrada e está disponível para o professor.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) return <LoadingScreen />;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Dynamic schema-driven questions (optional) */}
      {schema?.properties && (
        <div className="space-y-4">
          {Object.entries(schema.properties).map(([key, prop], idx) => {
            const qIndex = idx + 1;
            const qType = prop.format === 'date' ? 'date'
              : prop.type === 'number' ? 'number'
              : Array.isArray(prop.enum) ? 'select'
              : (prop.type === 'array' && prop.items?.enum) ? 'checkboxes'
              : (prop.format === 'textarea' ? 'textarea' : 'string');

            const value = answersByIndex[qIndex];
            const setValueFor = (v) => setAnswersByIndex(prev => ({ ...prev, [qIndex]: v }));

            if (loading) return <LoadingScreen />;

  return (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{prop.title || `Pergunta ${qIndex}`}</label>
                {qType === 'textarea' && (
                  <textarea className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    rows={4} value={value || ''} onChange={(e) => setValueFor(e.target.value)} disabled={isSubmitting} />
                )}
                {qType === 'string' && (
                  <input className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    value={value || ''} onChange={(e) => setValueFor(e.target.value)} disabled={isSubmitting} />
                )}
                {qType === 'number' && (
                  <input type="number" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    value={value ?? ''} onChange={(e) => setValueFor(e.target.value === '' ? null : Number(e.target.value))} disabled={isSubmitting} />
                )}
                {qType === 'date' && (
                  <input type="date" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    value={value || ''} onChange={(e) => setValueFor(e.target.value)} disabled={isSubmitting} />
                )}
                {qType === 'select' && (
                  <select className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    value={value || ''} onChange={(e) => setValueFor(e.target.value)} disabled={isSubmitting}>
                    <option value="">Selecione...</option>
                    {prop.enum.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {qType === 'checkboxes' && (
                  <div className="flex flex-wrap gap-2">
                    {prop.items.enum.map((opt) => {
                      const arr = Array.isArray(value) ? value : [];
                      const checked = arr.includes(opt);
                      if (loading) return <LoadingScreen />;

  return (
                        <label key={opt} className="inline-flex items-center gap-1 text-sm">
                          <input type="checkbox" checked={checked} disabled={isSubmitting}
                            onChange={(e) => {
                              const next = new Set(arr);
                              if (e.target.checked) next.add(opt); else next.delete(opt);
                              setValueFor(Array.from(next));
                            }} />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Campo de resposta em texto */}
      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
          Sua resposta {!isPlagiarismCheckEnabled ? '' : '(opcional)'}
        </label>
        <div className="mt-1">
          <textarea
            id="answer"
            name="answer"
            rows={6}
            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md ${
              errors.answer ? 'border-red-300' : ''
            }`}
            placeholder="Digite sua resposta aqui..."
            {...register('answer')}
            disabled={isSubmitting}
          />
        </div>
        {errors.answer && (
          <p className="mt-1 text-sm text-red-600">{errors.answer.message}</p>
        )}
      </div>
      
      {/* Upload de arquivos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Anexos {!isPlagiarismCheckEnabled ? '' : '(opcional)'}
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Você pode anexar até {maxFiles} arquivos (máx. {maxSize / (1024 * 1024)}MB por arquivo)
        </p>
        
        <FileUploader
          onUpload={handleFileUpload}
          files={files.map(file => ({
            ...file,
            progress: uploadProgress[file.tempId] || 0,
            isUploading: !!file.tempId && uploadProgress[file.tempId] < 100,
            isUploaded: !file.tempId || uploadProgress[file.tempId] === 100
          }))}
          onRemove={handleRemoveFile}
          maxFiles={maxFiles}
          maxSize={maxSize}
          disabled={isSubmitting || isUploading || files.length >= maxFiles}
          accept={{
            'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
          }}
        />
        
        {errors.files && (
          <p className="mt-1 text-sm text-red-600">{errors.files.message}</p>
        )}
      </div>
      
      {/* Termos de verificação de plágio */}
      {isPlagiarismCheckEnabled && (
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="agreeTerms"
              name="agreeTerms"
              type="checkbox"
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              disabled={isSubmitting}
              {...register('agreeTerms', {
                required: 'Você deve concordar com os termos de verificação de plágio.',
              })}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeTerms" className="font-medium text-gray-700">
              Declaro que esta é uma resposta original de minha autoria
            </label>
            <p className="text-gray-500">
              Concordo que minha submissão será verificada quanto a plágio. Qualquer violação dos termos acadêmicos pode resultar em penalidades.
            </p>
            {errors.agreeTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeTerms.message}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Mensagem de erro do formulário */}
      {formError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {formError.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </h3>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                  onClick={() => setFormError(null)}
                >
                  <span className="sr-only">Fechar</span>
                  <FiX className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Botão de envio */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting || isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </>
          ) : (
            <>
              <FiUpload className="-ml-1 mr-2 h-4 w-4" />
              Enviar resposta
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ActivitySubmissionForm;
