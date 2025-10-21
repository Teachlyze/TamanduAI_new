import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  X,
  Save,
  Search,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import gradingService from '@/services/gradingService';
import toast from 'react-hot-toast';

const FeedbackTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await gradingService.getFeedbackTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate({
      title: '',
      content: '',
      category: 'general',
      tags: [],
    });
    setShowModal(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      await gradingService.deleteFeedbackTemplate(id);
      toast.success('Template excluído');
      loadTemplates();
    } catch (error) {
      toast.error('Erro ao excluir template');
    }
  };

  const getCategoryConfig = (category) => {
    const configs = {
      positive: { label: 'Positivo', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
      improvement: { label: 'Melhorias', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
      general: { label: 'Geral', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    };
    return configs[category] || configs.general;
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Templates de Feedback</h3>
          <p className="text-sm text-muted-foreground">Crie respostas rápidas para acelerar correções</p>
        </div>
        <PremiumButton
          variant="gradient"
          leftIcon={Plus}
          onClick={handleCreate}
          className="whitespace-nowrap inline-flex items-center gap-2"
        >
          <span>Novo Template</span>
        </PremiumButton>
      </div>

      {/* Filters */}
      <PremiumCard variant="elevated">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar templates..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {['all', 'positive', 'improvement', 'general'].map((cat) => {
                const isActive = filterCategory === cat;
                const label = cat === 'all' ? 'Todos' : getCategoryConfig(cat).label;
                
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-white dark:bg-slate-900 text-foreground border border-border hover:bg-muted'
                    }`}
                  >
                    <span className="font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template) => {
            const categoryConfig = getCategoryConfig(template.category);

            return (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <PremiumCard variant="elevated" className="h-full hover:shadow-xl transition-all">
                  <div className="p-4 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${categoryConfig.color}`}>
                            {categoryConfig.label}
                          </span>
                          {template.usage_count > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <TrendingUp className="w-3 h-3" />
                              <span>{template.usage_count}x usado</span>
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold">{template.title}</h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(template)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-muted-foreground mb-3 flex-1 line-clamp-3">
                      {template.content}
                    </p>

                    {/* Tags */}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-3 h-3 text-muted-foreground" />
                        {template.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </PremiumCard>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredTemplates.length === 0 && (
          <div className="col-span-2">
            <PremiumCard variant="elevated">
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum template encontrado.</p>
                <p className="text-sm">
                  {searchQuery || filterCategory !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Crie seu primeiro template para economizar tempo nas correções.'}
                </p>
              </div>
            </PremiumCard>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <TemplateModal
          template={editingTemplate}
          onClose={() => {
            setShowModal(false);
            setEditingTemplate(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingTemplate(null);
            loadTemplates();
          }}
        />
      )}
    </div>
  );
};

const TemplateModal = ({ template, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    template || {
      title: '',
      content: '',
      category: 'general',
      tags: [],
    }
  );
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (formData.tags.includes(tagInput.trim())) return;

    setFormData({
      ...formData,
      tags: [...formData.tags, tagInput.trim()],
    });
    setTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Conteúdo é obrigatório');
      return;
    }

    try {
      setSaving(true);

      if (template?.id) {
        await gradingService.updateRubric(template.id, formData);
        toast.success('Template atualizado');
      } else {
        await gradingService.createFeedbackTemplate(formData);
        toast.success('Template criado');
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast.error('Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

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
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full"
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">
                {template?.id ? 'Editar Template' : 'Novo Template'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground"
                placeholder="Ex: Excelente argumentação"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground"
              >
                <option value="positive">Positivo</option>
                <option value="improvement">Melhorias</option>
                <option value="general">Geral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Conteúdo</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground resize-none"
                placeholder="Escreva o feedback que será usado como template..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Dica: Use variáveis como [NOME] para personalizar
              </p>
            </div>

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
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
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
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border flex items-center justify-end gap-3">
            <PremiumButton
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="whitespace-nowrap inline-flex items-center gap-2"
            >
              <span>Cancelar</span>
            </PremiumButton>

            <PremiumButton
              variant="gradient"
              leftIcon={Save}
              onClick={handleSave}
              disabled={saving}
              className="whitespace-nowrap inline-flex items-center gap-2"
            >
              <span>{saving ? 'Salvando...' : 'Salvar Template'}</span>
            </PremiumButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FeedbackTemplateManager;
