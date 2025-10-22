import React, { useCallback, useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { FiPaperclip, FiDownload, FiTrash2, FiEye, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import FileUploader from './FileUploader';
import useActivityFiles from '../../hooks/useActivityFiles';
import { BUCKETS } from '../../services/storageService';

  const ActivityAttachments = ({
  activityId,
  userId,
  initialAttachments = [],
  onAttachmentsChange,
  isSubmitting = false,
  isDraft = false,
  isTeacher = false,
  isEditing = true,
  maxFiles = 10,
  maxSize = 20 * 1024 * 1024, // 20MB
}) => {
  const [attachments, setAttachments] = useState(initialAttachments || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  
  const { uploadActivityFile, removeActivityFile } = useActivityFiles(activityId, userId, isDraft);

  // Atualiza os anexos quando initialAttachments mudar
  useEffect(() => {
    if (initialAttachments && initialAttachments.length > 0) {
      setAttachments(initialAttachments);
    }
  }, [initialAttachments]);

  // Notifica o componente pai sobre mudanças nos anexos
  useEffect(() => {
    if (onAttachmentsChange) {
      onAttachmentsChange(attachments);
    }
  }, [attachments, onAttachmentsChange]);

  // Manipula o upload de novos arquivos
  const handleUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    
    const newAttachments = [];
    const newErrors = [];
    
    try {
      setIsUploading(true);
      
      for (const file of files) {
        try {
          // Verifica se o arquivo já foi adicionado
          if (attachments.some(a => a.name === file.name)) {
            newErrors.push(`O arquivo "${file.name}" já foi adicionado.`);
            continue;
          }
          
          // Cria um objeto de anexo temporário
          const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const tempAttachment = {
            id: tempId,
            name: file.name,
            size: file.size,
            type: file.type,
            isUploading: true,
            progress: 0,
            isNew: true
          };
          
          // Adiciona o anexo temporário à lista
          setAttachments(prev => [...prev, tempAttachment]);
          
          // Atualiza o progresso
          const onProgress = (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [tempId]: progress
            }));
            
            setAttachments(prev => 
              prev.map(a => 
                a.id === tempId 
                  ? { ...a, progress }
                  : a
              )
            );
          };
          
          // Faz o upload do arquivo
          const { data: uploadedFile, error } = await uploadActivityFile(file);
          
          if (error) {
            throw new Error(`Falha ao fazer upload de ${file.name}: ${error.message}`);
          }
          
          // Atualiza o anexo com os dados do upload
          setAttachments(prev => 
            prev.map(a => 
              a.id === tempId 
                ? { 
                    ...a, 
                    ...uploadedFile, 
                    isUploading: false, 
                    isUploaded: true,
                    progress: 100 
                  } 
                : a
            )
          );
          
          newAttachments.push({
            ...uploadedFile,
            isNew: true
          });
          
        } catch (error) {
          console.error('Erro ao fazer upload do arquivo:', error);
          
          // Atualiza o anexo com o erro
          setAttachments(prev => 
            prev.map(a => 
              a.name === file.name 
                ? { 
                    ...a, 
                    isUploading: false, 
                    error: error.message || 'Erro ao fazer upload',
                    hasError: true 
                  } 
                : a
            )
          );
          
          newErrors.push(error.message || `Erro ao fazer upload de ${file.name}`);
        }
      }
      
      if (newErrors.length > 0) {
        setErrors(prev => [...prev, ...newErrors]);
      }
      
      return newAttachments;
      
    } catch (error) {
      console.error('Erro no processo de upload:', error);
      setErrors(prev => [...prev, error.message || 'Erro ao processar os arquivos']);
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  }, [attachments, uploadActivityFile]);

  // Remove um anexo
  const handleRemove = useCallback(async (file, index) => {
    if (!file || isSubmitting) return;
    
    try {
      // Se o arquivo já foi enviado, remove do storage
      if (file.path && !file.isNew) {
        await removeActivityFile(file.path);
      }
      
      // Remove da lista de anexos
      setAttachments(prev => prev.filter((_, i) => i !== index));
      
    } catch (error) {
      console.error('Erro ao remover anexo:', error);
      setErrors(prev => [...prev, `Erro ao remover ${file.name}: ${error.message}`]);
    }
  }, [isSubmitting, removeActivityFile]);

  // Abre o arquivo em uma nova aba
  const handlePreview = (file) => {
    if (!file.url) return;
    window.open(file.url, '_blank', 'noopener,noreferrer');
  };

  // Formata o tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Obtém o ícone do tipo de arquivo
  const getFileIcon = (fileType) => {
    if (!fileType) return <FiPaperclip className="w-4 h-4" />;
    
    if (fileType.startsWith('image/')) {
      return <FiPaperclip className="w-4 h-4 text-blue-500" />;
    }
    
    if (fileType === 'application/pdf') {
      return <FiPaperclip className="w-4 h-4 text-red-500" />;
    }
    
    if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return <FiPaperclip className="w-4 h-4 text-blue-600" />;
    }
    
    if (
      fileType === 'application/vnd.ms-excel' ||
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return <FiPaperclip className="w-4 h-4 text-green-600" />;
    }
    
    return <FiPaperclip className="w-4 h-4 text-gray-500" />;
  };

  // Limpa as mensagens de erro após 5 segundos
  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([]);
      }, 5000);
  return () => clearTimeout(timer);
    }
  }, [errors]);
  return (
    <div className="space-y-4">
      {/* Título da seção */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <FiPaperclip className="mr-2" />
          Anexos ({attachments.length}/{maxFiles})
        </h3>
        {attachments.length > 0 && (
          <span className="text-xs text-gray-500">
            {attachments.filter(a => !a.isUploading).length} arquivo(s) carregado(s)
          </span>
        )}
      </div>
      
      {/* Área de upload (apenas para edição) */}
      {isEditing && attachments.length < maxFiles && (
        <FileUploader
          onUpload={handleUpload}
          files={attachments}
          maxFiles={maxFiles}
          maxSize={maxSize}
          disabled={isSubmitting || isUploading}
          label="Arraste e solte arquivos aqui ou clique para selecionar"
          subLabel={`Máx. ${maxFiles} arquivos • ${maxSize / (1024 * 1024)}MB por arquivo`}
        />
      )}
      
      {/* Lista de anexos */}
      <div className="space-y-2">
        <AnimatePresence>
          {attachments.map((file, index) => (
            <motion.div
              key={file.id || `file-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                file.hasError 
                  ? 'bg-red-50 border-red-200' 
                  : file.isUploading 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    {file.isUploading && (
                      <span className="inline-flex items-center">
                        <span className="animate-pulse">Enviando...</span>
                        <span className="ml-1">{file.progress || 0}%</span>
                      </span>
                    )}
                    {file.isUploaded && (
                      <span className="inline-flex items-center text-green-600">
                        <FiCheck className="w-3 h-3 mr-1" />
                        Enviado
                      </span>
                    )}
                    {file.error && (
                      <span className="text-red-500 text-xs">
                        {file.error}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!file.isUploading && !file.hasError && (
                  <button
                    type="button"
                    onClick={() => handlePreview(file)}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Visualizar"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                )}
                
                {!file.isUploading && file.url && (
                  <a
                    href={file.url}
                    download={file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                    title="Baixar"
                  >
                    <FiDownload className="w-4 h-4" />
                  </a>
                )}
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemove(file, index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    disabled={isSubmitting || file.isUploading}
                    title="Remover"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Mensagens de erro */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-2"
          >
            {errors.map((error, index) => (
              <div
                key={index}
                className="flex items-start p-3 text-sm text-red-700 bg-red-50 rounded-lg"
              >
                <FiAlertCircle className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-red-500" />
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setErrors(prev => prev.filter((_, i) => i !== index))}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityAttachments;
