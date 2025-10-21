import React from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Trash2,
  Eye,
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

const MaterialTable = ({ materials, onDelete, onDownload }) => {
  const getFileIcon = (fileType) => {
    const iconClass = "w-5 h-5";
    
    if (fileType?.startsWith('image/')) return <Image className={iconClass} />;
    if (fileType?.startsWith('video/')) return <Video className={iconClass} />;
    if (fileType?.startsWith('audio/')) return <Music className={iconClass} />;
    if (fileType === 'application/pdf') return <FileText className={iconClass} />;
    if (fileType?.includes('zip') || fileType?.includes('rar')) {
      return <Archive className={iconClass} />;
    }
    
    return <File className={iconClass} />;
  };

  return (
    <PremiumCard variant="elevated">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-800 border-b-2 border-primary/20">
            <tr>
              <th className="px-4 py-4 text-left font-bold text-sm">Arquivo</th>
              <th className="px-4 py-4 text-left font-bold text-sm">Categoria</th>
              <th className="px-4 py-4 text-left font-bold text-sm">Tamanho</th>
              <th className="px-4 py-4 text-left font-bold text-sm">Enviado por</th>
              <th className="px-4 py-4 text-left font-bold text-sm">Data</th>
              <th className="px-4 py-4 text-center font-bold text-sm">Ações</th>
            </tr>
          </thead>

          <tbody>
            {materials.map((material, index) => (
              <motion.tr
                key={material.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-border hover:bg-muted/30 transition-colors"
              >
                {/* File */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getFileIcon(material.file_type)}
                    </div>
                    <div>
                      <p className="font-medium">{material.title}</p>
                      {material.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                          {material.description}
                        </p>
                      )}
                      {/* Tags */}
                      {material.tags && material.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {material.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                          {material.tags.length > 2 && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              +{material.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  {material.category && (
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      {material.category}
                    </span>
                  )}
                </td>

                {/* Size */}
                <td className="px-4 py-3 text-sm">
                  {materialsService.formatFileSize(material.file_size)}
                </td>

                {/* Uploader */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {material.uploader?.avatar_url ? (
                      <img
                        src={material.uploader.avatar_url}
                        alt={material.uploader.full_name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {material.uploader?.full_name?.[0] || '?'}
                      </div>
                    )}
                    <span className="text-sm">{material.uploader?.full_name || 'Desconhecido'}</span>
                  </div>
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {format(new Date(material.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => window.open(material.file_url, '_blank')}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDownload(material)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Baixar"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(material.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="text-sm text-muted-foreground">
          Total de {materials.length} material(is)
        </div>
      </div>
    </PremiumCard>
  );
};

export default MaterialTable;
