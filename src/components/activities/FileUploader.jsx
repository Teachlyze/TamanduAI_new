import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiCheck, FiAlertCircle, FiFile } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const FileUploader = ({
  onUpload,
  onRemove,
  files = [],
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/plain': ['.txt'],
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar'],
  },
  disabled = false,
  label = 'Arraste e solte arquivos aqui, ou clique para selecionar',
  subLabel = `Máx. ${maxFiles} arquivos • ${maxSize / (1024 * 1024)}MB por arquivo`,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setDragActive(false);
      
      // Verifica se o número máximo de arquivos foi excedido
      if (files.length + acceptedFiles.length > maxFiles) {
        setErrors(prev => [
          ...prev,
          `Você só pode fazer upload de no máximo ${maxFiles} arquivos.`
        ]);
        return;
      }

      // Processa arquivos rejeitados (tamanho, tipo, etc.)
      if (rejectedFiles && rejectedFiles.length > 0) {
        const newErrors = rejectedFiles.map(({ file, errors }) => {
          if (errors.some(e => e.code === 'file-too-large')) {
            return `O arquivo ${file.name} é muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`;
          }
          if (errors.some(e => e.code === 'file-invalid-type')) {
            return `Tipo de arquivo não suportado: ${file.name}`;
          }
          return `Erro ao processar o arquivo ${file.name}`;
        });
        
        setErrors(prev => [...prev, ...newErrors]);
      }

      // Processa arquivos aceitos
      if (acceptedFiles.length > 0 && onUpload) {
        onUpload(acceptedFiles);
      }
    },
    [files.length, maxFiles, maxSize, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: maxFiles - files.length,
    disabled: disabled || files.length >= maxFiles,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    noClick: false,
    noKeyboard: true,
  });

  const handleRemove = (file, index) => {
    if (onRemove) {
      onRemove(file, index);
    }
  };

  const handleClick = (e) => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // Limpa os erros após 5 segundos
  React.useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  const getFileIcon = (fileType) => {
    if (!fileType) return <FiFile className="w-5 h-5" />;
    
    if (fileType.startsWith('image/')) {
      return <FiFile className="w-5 h-5 text-blue-500" />;
    }
    
    if (fileType === 'application/pdf') {
      return <FiFile className="w-5 h-5 text-red-500" />;
    }
    
    if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return <FiFile className="w-5 h-5 text-blue-600" />;
    }
    
    if (
      fileType === 'application/vnd.ms-excel' ||
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return <FiFile className="w-5 h-5 text-green-600" />;
    }
    
    if (fileType === 'text/plain') {
      return <FiFile className="w-5 h-5 text-gray-500" />;
    }
    
    if (fileType === 'application/zip' || fileType === 'application/x-rar-compressed') {
      return <FiFile className="w-5 h-5 text-yellow-500" />;
    }
    
    return <FiFile className="w-5 h-5 text-gray-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={handleClick}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 rounded-full bg-blue-100 text-blue-500">
            <FiUpload className="w-6 h-6" />
          </div>
          <div className="text-sm font-medium text-gray-700">
            {label}
          </div>
          <p className="text-xs text-gray-500">
            {subLabel}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Formatos suportados: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP, RAR
          </p>
        </div>
      </div>

      {/* Lista de arquivos */}
      <div className="space-y-2">
        {files.map((file, index) => (
          <motion.div
            key={file.id || file.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
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
                      <span className="ml-1">{file.progress}%</span>
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
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(file, index);
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                disabled={file.isUploading}
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        ))}
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
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader;
