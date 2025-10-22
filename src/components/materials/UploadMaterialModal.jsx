import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  File,
  Image,
  Video,
  FileText,
  Music,
  Archive,
  AlertCircle,
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import materialsService from '@/services/materialsService';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'apostilas', label: 'Apostilas', icon: FileText },
  { value: 'slides', label: 'Slides', icon: FileText },
  { value: 'videos', label: 'Vídeos', icon: Video },
  { value: 'exercicios', label: 'Exercícios', icon: File },
  { value: 'provas', label: 'Provas', icon: File },
  { value: 'referencias', label: 'Referências', icon: FileText },
  { value: 'outros', label: 'Outros', icon: File },
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const UploadMaterialModal = ({ classId, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'outros',
    tags: [],
    is_public: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('Arquivo muito grande! Máximo: 100MB');
      return;
    }

    setFile(selectedFile);
    
    // Auto-fill title if empty
    if (!formData.title) {
      setFormData(prev => ({
        ...prev,
        title: selectedFile.name.replace(/\.[^/.]+$/, ''), // Remove extension
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (formData.tags.includes(tagInput.trim())) {
      toast.error('Tag já adicionada');
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tagInput.trim()],
    }));
    setTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Selecione um arquivo');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      setUploading(true);
      await materialsService.uploadMaterial(classId, file, formData);
      onSuccess();
    } catch (error) {
      console.error('Erro ao enviar material:', error);
      toast.error('Erro ao enviar material');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return File;
    
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('audio/')) return Music;
    if (file.type === 'application/pdf') return FileText;
    if (file.type.includes('zip') || file.type.includes('rar')) return Archive;
    
    return File;
  };

  const FileIcon = getFileIcon();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">📤 Enviar Material</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-semibold mb-2">Arquivo</label>
              
              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">
                    Arraste e solte ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Máximo: 100MB
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="border border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {materialsService.formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground"
                placeholder="Nome do material"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground resize-none"
                placeholder="Descreva o conteúdo do material..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground"
                  placeholder="Adicionar tag..."
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-primary text-slate-900 dark:text-white rounded-lg hover:opacity-90"
                >
                  Adicionar
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Public Toggle */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="is_public" className="text-sm cursor-pointer">
                <span className="font-medium">Material público</span>
                <p className="text-xs text-muted-foreground">
                  Permitir que alunos visualizem este material
                </p>
              </label>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-1">Atenção</p>
                <p className="text-xs">
                  Certifique-se de que o material não contém informações confidenciais antes de enviar.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border flex items-center justify-end gap-3">
            <PremiumButton
              variant="outline"
              onClick={onClose}
              disabled={uploading}
              className="whitespace-nowrap inline-flex items-center gap-2"
            >
              <span>Cancelar</span>
            </PremiumButton>

            <PremiumButton
              variant="gradient"
              leftIcon={Upload}
              onClick={handleSubmit}
              disabled={!file || uploading}
              className="whitespace-nowrap inline-flex items-center gap-2"
            >
              <span>{uploading ? 'Enviando...' : 'Enviar Material'}</span>
            </PremiumButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UploadMaterialModal;
