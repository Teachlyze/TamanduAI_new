import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Video, 
  Download, 
  Play, 
  Clock, 
  Calendar,
  HardDrive,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ClassRecordings = ({ classId }) => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classId) {
      loadRecordings();
    }
  }, [classId]);

  const loadRecordings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('class_recordings')
        .select('*')
        .eq('class_id', classId)
        .eq('status', 'ready')
        .order('recorded_date', { ascending: false });

      if (error) throw error;

      setRecordings(data || []);
    } catch (error) {
      console.error('Error loading recordings:', error);
      toast.error('Erro ao carregar gravações');
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = (recording) => {
    if (recording.recording_url) {
      window.open(recording.recording_url, '_blank');
    } else {
      toast.error('URL da gravação não disponível');
    }
  };

  const handleDownload = (recording) => {
    if (recording.recording_url) {
      window.open(recording.recording_url, '_blank');
      toast.success('Download iniciado');
    } else {
      toast.error('Download não disponível');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatFileSize = (sizeMb) => {
    if (!sizeMb) return 'N/A';
    if (sizeMb >= 1024) {
      return `${(sizeMb / 1024).toFixed(2)} GB`;
    }
    return `${sizeMb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-muted-foreground">Carregando gravações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recordings || recordings.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-600" />
            Gravações das Aulas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Video className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma gravação disponível</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              As gravações das aulas aparecerão aqui após serem processadas e publicadas.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-emerald-600" />
          Gravações das Aulas
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {recordings.length} {recordings.length === 1 ? 'gravação' : 'gravações'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recordings.map((recording, index) => (
          <motion.div
            key={recording.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden border-2 border-border rounded-xl p-4 hover:border-emerald-500 hover:shadow-lg transition-all duration-300"
          >
            {/* Decorative gradient bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">
                      Aula do dia {formatDate(recording.recorded_date)}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {recording.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{recording.duration_minutes} min</span>
                        </div>
                      )}
                      {recording.file_size_mb && (
                        <div className="flex items-center gap-1">
                          <HardDrive className="w-4 h-4" />
                          <span>{formatFileSize(recording.file_size_mb)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Publicado {formatDate(recording.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                      Disponível
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleWatch(recording)}
                    className="whitespace-nowrap inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Play className="w-4 h-4" />
                    <span>Assistir</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleDownload(recording)}
                    variant="outline"
                    className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Google Drive Badge (if available) */}
            {recording.google_drive_id && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">
                    G
                  </div>
                  <span>Armazenado no Google Drive</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* Info Alert */}
        <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">Sobre as gravações</p>
              <p className="text-blue-700 dark:text-blue-300">
                As gravações ficam disponíveis para todos os alunos da turma. 
                Elas são processadas automaticamente após cada aula online.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassRecordings;
