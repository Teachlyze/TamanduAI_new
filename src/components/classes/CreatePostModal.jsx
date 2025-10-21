import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Megaphone,
  FileText,
  BookOpen,
  Link as LinkIcon,
  HelpCircle,
  Paperclip,
  Calendar,
  Send,
  Image as ImageIcon,
  Film,
} from 'lucide-react';
import { PremiumButton } from '@/components/ui/PremiumButton';
import toast from 'react-hot-toast';

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'announcement',
    title: '',
    content: '',
    attachments: [],
    isPinned: false,
    commentsEnabled: true,
    scheduledFor: null,
  });

  const [attachmentInput, setAttachmentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postTypes = [
    { value: 'announcement', label: 'Anúncio', icon: Megaphone, color: 'text-red-500' },
    { value: 'activity', label: 'Atividade', icon: FileText, color: 'text-blue-500' },
    { value: 'material', label: 'Material', icon: BookOpen, color: 'text-green-500' },
    { value: 'link', label: 'Link', icon: LinkIcon, color: 'text-purple-500' },
    { value: 'question', label: 'Pergunta', icon: HelpCircle, color: 'text-orange-500' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast.error('O conteúdo não pode estar vazio');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        type: 'announcement',
        title: '',
        content: '',
        attachments: [],
        isPinned: false,
        commentsEnabled: true,
        scheduledFor: null,
      });
    } catch (error) {
      console.error('Erro ao criar post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAttachment = () => {
    if (!attachmentInput.trim()) return;

    const newAttachment = {
      id: Date.now(),
      type: 'link',
      url: attachmentInput,
      name: attachmentInput,
    };

    setFormData({
      ...formData,
      attachments: [...formData.attachments, newAttachment],
    });
    setAttachmentInput('');
  };

  const handleRemoveAttachment = (id) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter(a => a.id !== id),
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl font-bold">Nova Postagem</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-140px)]">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tipo de Post */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Tipo de Postagem
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {postTypes.map((type) => {
                    const Icon = type.icon;
                    const isActive = formData.type === type.value;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`whitespace-nowrap inline-flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          isActive
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : type.color}`} />
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Título (opcional) */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Título <span className="text-muted-foreground">(opcional)</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Digite um título para destacar..."
                  className="w-full px-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Conteúdo */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2">
                  Conteúdo *
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="O que você quer compartilhar com seus alunos?"
                  rows={6}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Anexos */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Anexos
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={attachmentInput}
                    onChange={(e) => setAttachmentInput(e.target.value)}
                    placeholder="Cole um link (URL)..."
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate">{attachment.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Opções */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <label htmlFor="pinned" className="text-sm font-medium">
                    📌 Fixar no topo
                  </label>
                  <input
                    id="pinned"
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="comments" className="text-sm font-medium">
                    💬 Permitir comentários
                  </label>
                  <input
                    id="comments"
                    type="checkbox"
                    checked={formData.commentsEnabled}
                    onChange={(e) => setFormData({ ...formData, commentsEnabled: e.target.checked })}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="schedule" className="text-sm font-medium">
                    ⏰ Agendar publicação
                  </label>
                  <input
                    id="schedule"
                    type="datetime-local"
                    value={formData.scheduledFor || ''}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value || null })}
                    className="px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
              <button
                type="button"
                onClick={onClose}
                className="whitespace-nowrap inline-flex items-center gap-2 px-6 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground hover:bg-muted transition-colors"
              >
                <span>Cancelar</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="whitespace-nowrap inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Publicando...' : 'Publicar'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreatePostModal;
