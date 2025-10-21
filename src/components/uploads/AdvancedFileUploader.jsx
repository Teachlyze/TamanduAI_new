import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

/**
 * Advanced file uploader with drag-and-drop and progress tracking
 */
export const AdvancedFileUploader = ({
  onUpload,
  accept = '*/*',
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB
  className = '',
  ...props
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  }, []);

  const handleFiles = useCallback(async (files) => {
    const validFiles = files.filter(file => file.size <= maxSize);

    if (validFiles.length !== files.length) {
      alert(`Alguns arquivos foram ignorados por excederem o tamanho máximo de ${maxSize / 1024 / 1024}MB`);
    }

    setUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];

        if (onUpload) {
          await onUpload(file);
        }

        setProgress(((i + 1) / validFiles.length) * 100);
        setUploadedFiles(prev => [...prev, file]);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [maxSize, onUpload]);

  return (
    <Card className={`advanced-file-uploader ${className}`} {...props}>
      <CardHeader>
        <CardTitle>Upload de Arquivos</CardTitle>
      </CardHeader>

      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="text-4xl">📁</div>
            <div>
              <p className="text-lg font-medium">Arraste arquivos aqui</p>
              <p className="text-muted-foreground">ou clique para selecionar</p>
            </div>

            <input
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />

            <Button asChild>
              <label htmlFor="file-input" className="cursor-pointer">
                Selecionar Arquivos
              </label>
            </Button>
          </div>
        </div>

        {/* Progress */}
        {uploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fazendo upload...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Uploaded files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Arquivos Enviados</h4>
            <div className="space-y-1">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm truncate">{file.name}</span>
                  <Badge variant="outline">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedFileUploader;
