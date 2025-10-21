import { motion } from 'framer-motion';
import {
  Download,
  Trash2,
  Edit2,
  Eye,
  MoreVertical,
  File,
  Image,
  Video,
  FileText,
  Music,
  Archive,
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import materialsService from '@/services/materialsService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MaterialCard = ({ material, index, onDelete, onDownload, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getFileIcon = () => {
    const iconClass = "w-8 h-8";
    
    if (material.file_type?.startsWith('image/')) return <Image className={iconClass} />;
    if (material.file_type?.startsWith('video/')) return <Video className={iconClass} />;
    if (material.file_type?.startsWith('audio/')) return <Music className={iconClass} />;
    if (material.file_type === 'application/pdf') return <FileText className={iconClass} />;
    if (material.file_type?.includes('zip') || material.file_type?.includes('rar')) {
      return <Archive className={iconClass} />;
    }
    
    return <File className={iconClass} />;
  };

  const getFileColor = () => {
    if (material.file_type?.startsWith('image/')) return 'from-blue-500 to-cyan-500';
    if (material.file_type?.startsWith('video/')) return 'from-purple-500 to-pink-500';
    if (material.file_type?.startsWith('audio/')) return 'from-green-500 to-emerald-500';
    if (material.file_type === 'application/pdf') return 'from-red-500 to-orange-500';
    if (material.file_type?.includes('zip') || material.file_type?.includes('rar')) {
      return 'from-yellow-500 to-amber-500';
    }
    
    return 'from-gray-500 to-slate-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <PremiumCard variant="elevated" className="h-full hover:shadow-xl transition-all group">
        <div className="p-6 flex flex-col h-full">
          {/* Icon & Menu */}
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${getFileColor()} text-white`}>
              {getFileIcon()}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-border z-20">
                    <button
                      onClick={() => {
                        onDownload(material);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 rounded-t-lg"
                    >
                      <Download className="w-4 h-4" />
                      Baixar
                    </button>
                    <button
                      onClick={() => {
                        window.open(material.file_url, '_blank');
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Visualizar
                    </button>
                    <button
                      onClick={() => {
                        onDelete(material.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2 rounded-b-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="flex-1">
            <h4 className="font-bold mb-2 line-clamp-2">{material.title}</h4>
            {material.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {material.description}
              </p>
            )}

            {/* Category Badge */}
            {material.category && (
              <span className="inline-block text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium mb-3">
                {material.category}
              </span>
            )}

            {/* Tags */}
            {material.tags && material.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {material.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {material.tags.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    +{material.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-border mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                {material.uploader?.avatar_url ? (
                  <img
                    src={material.uploader.avatar_url}
                    alt={material.uploader.full_name}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {material.uploader?.full_name?.[0] || '?'}
                  </div>
                )}
                <span>{material.uploader?.full_name || 'Desconhecido'}</span>
              </div>

              <span>{materialsService.formatFileSize(material.file_size)}</span>
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              {format(new Date(material.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
            </div>
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );
};

export default MaterialCard;
