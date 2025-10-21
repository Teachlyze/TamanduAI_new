import { AttachmentService } from '@/services/attachmentService';
import { ShieldAlert, CheckCircle2, UploadCloud } from 'lucide-react';

const allowed = ['.pdf', '.docx', '.odt', '.txt'];

export default function EventAttachmentUploader({ eventId, userId, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [last, setLast] = useState(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const att = await AttachmentService.uploadEventFile(file, { eventId, uploaderId: userId });
      setLast(att);
      onUploaded?.(att);
    } catch (err) {
      setError(err?.message || 'Falha no upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-muted">
        <UploadCloud className="w-4 h-4" />
        <span>{uploading ? 'Enviando...' : 'Enviar arquivo'}</span>
        <input type="file" className="hidden" accept={allowed.join(',')} onChange={onFile} disabled={uploading} />
      </label>
      <div className="text-xs text-muted-foreground">Formatos permitidos: PDF, DOCX, ODT, TXT</div>
      {error && (
        <div className="text-sm text-red-600 flex items-center gap-1">
          <ShieldAlert className="w-4 h-4" /> {error}
        </div>
      )}
      {last && (
        <div className="text-sm flex items-center gap-2">
          {last.status === 'approved' ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-yellow-600" />
          )}
          <span>
            {last.original_name} • {last.status === 'approved' ? 'Aprovado' : 'Quarentena'}
          </span>
          {last.reason && <span className="text-xs text-muted-foreground">({last.reason})</span>}
        </div>
      )}
    </div>
  );
}
