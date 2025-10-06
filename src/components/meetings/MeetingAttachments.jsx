import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  File,
  FileText,
  Image,
  Download,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { AttachmentService } from '@/services/attachmentService';

const MeetingAttachments = ({ meetingId, readOnly = false, onUploadSuccess, onDeleteSuccess }) => {
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Load attachments
  const loadAttachments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await AttachmentService.getMeetingAttachments(meetingId);
      setAttachments(data || []);
    } catch (error) {
      console.error('Error loading attachments:', error);
      setError('Não foi possível carregar os anexos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [meetingId]);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setError(null);

      for (const file of files) {
        const result = await AttachmentService.uploadMeetingAttachment(meetingId, file);
        setAttachments(prev => [...prev, result]);
      }

      toast({
        title: 'Anexos adicionados',
        description: `${files.length} arquivo(s) enviado(s) com sucesso.`,
      });

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no upload',
        description: 'Não foi possível enviar os arquivos.',
      });
    } finally {
      setIsUploading(false);
      // Clear file input
      event.target.value = '';
    }
  };

  // Handle file delete
  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Tem certeza que deseja excluir este anexo?')) {
      return;
    }

    try {
      await AttachmentService.deleteMeetingAttachment(meetingId, attachmentId);
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));

      toast({
        title: 'Anexo removido',
        description: 'O arquivo foi removido com sucesso.',
      });

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao remover',
        description: 'Não foi possível remover o arquivo.',
      });
    }
  };

  // Handle file download
  const handleDownload = async (attachment) => {
    try {
      const url = await AttachmentService.getAttachmentDownloadUrl(meetingId, attachment.id);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no download',
        description: 'Não foi possível baixar o arquivo.',
      });
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }

    if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
      return <FileText className="w-4 h-4 text-red-500" />;
    }

    return <File className="w-4 h-4 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" text="Carregando anexos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          onClick={loadAttachments}
          className="mt-4"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload section */}
      {!readOnly && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="attachment-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="attachment-upload"
            className="cursor-pointer block"
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Enviando arquivos...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium mb-1">
                  Clique para adicionar anexos
                </p>
                <p className="text-xs text-muted-foreground">
                  ou arraste e solte arquivos aqui
                </p>
              </div>
            )}
          </label>
        </div>
      )}

      {/* Attachments list */}
      {attachments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <File className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">
            {readOnly
              ? 'Nenhum anexo foi adicionado a esta reunião.'
              : 'Nenhum anexo foi adicionado ainda.'}
          </p>
          {!readOnly && (
            <p className="text-xs mt-1">
              Use o botão acima para adicionar arquivos.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(attachment.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                        {attachment.uploaded_at && (
                          <span className="ml-2">
                            • {new Date(attachment.uploaded_at).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                      className="h-8 w-8 p-0"
                      title="Baixar arquivo"
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(attachment.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Remover arquivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload progress indicator */}
      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Enviando arquivos...
        </div>
      )}
    </div>
  );
};

export default MeetingAttachments;
