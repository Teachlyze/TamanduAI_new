import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  X,
  Save,
  GripVertical,
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import gradingService from '@/services/gradingService';
import toast from 'react-hot-toast';

const RubricManager = ({ activityId }) => {
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRubric, setEditingRubric] = useState(null);

  useEffect(() => {
    loadRubrics();
  }, [activityId]);

  const loadRubrics = async () => {
    try {
      setLoading(true);
      const data = await gradingService.getRubrics({ activityId });
      setRubrics(data);
    } catch (error) {
      console.error('Erro ao carregar rubricas:', error);
      toast.error('Erro ao carregar rubricas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRubric({
      title: '',
      description: '',
      criteria: [
        { name: '', description: '', weight: 25, levels: [] }
      ],
    });
    setShowModal(true);
  };

  const handleEdit = (rubric) => {
    setEditingRubric(rubric);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta rubrica?')) return;

    try {
      await gradingService.deleteRubric(id);
      toast.success('Rubrica excluída');
      loadRubrics();
    } catch (error) {
      toast.error('Erro ao excluir rubrica');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Rubricas de Avaliação</h3>
        <PremiumButton
          variant="gradient"
          leftIcon={Plus}
          onClick={handleCreate}
          className="whitespace-nowrap inline-flex items-center gap-2"
        >
          <span>Nova Rubrica</span>
        </PremiumButton>
      </div>

      {/* Rubrics List */}
      <div className="space-y-3">
        {rubrics.map((rubric) => (
          <PremiumCard key={rubric.id} variant="elevated">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-1">{rubric.title}</h4>
                  {rubric.description && (
                    <p className="text-sm text-muted-foreground mb-3">{rubric.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{rubric.criteria?.length || 0} critérios</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(rubric)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rubric.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </PremiumCard>
        ))}

        {rubrics.length === 0 && (
          <PremiumCard variant="elevated">
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma rubrica criada ainda.</p>
              <p className="text-sm">Crie uma rubrica para padronizar suas avaliações.</p>
            </div>
          </PremiumCard>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <RubricModal
          rubric={editingRubric}
          activityId={activityId}
          onClose={() => {
            setShowModal(false);
            setEditingRubric(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingRubric(null);
            loadRubrics();
          }}
        />
      )}
    </div>
  );
};

const RubricModal = ({ rubric, activityId, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    rubric || {
      title: '',
      description: '',
      criteria: [{ name: '', description: '', weight: 25, levels: [] }],
    }
  );
  const [saving, setSaving] = useState(false);

  const addCriterion = () => {
    setFormData({
      ...formData,
      criteria: [...formData.criteria, { name: '', description: '', weight: 25, levels: [] }],
    });
  };

  const removeCriterion = (index) => {
    const newCriteria = formData.criteria.filter((_, i) => i !== index);
    setFormData({ ...formData, criteria: newCriteria });
  };

  const updateCriterion = (index, field, value) => {
    const newCriteria = [...formData.criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setFormData({ ...formData, criteria: newCriteria });
  };

  const addLevel = (criterionIndex) => {
    const newCriteria = [...formData.criteria];
    newCriteria[criterionIndex].levels.push({ score: 0, description: '' });
    setFormData({ ...formData, criteria: newCriteria });
  };

  const removeLevel = (criterionIndex, levelIndex) => {
    const newCriteria = [...formData.criteria];
    newCriteria[criterionIndex].levels = newCriteria[criterionIndex].levels.filter(
      (_, i) => i !== levelIndex
    );
    setFormData({ ...formData, criteria: newCriteria });
  };

  const updateLevel = (criterionIndex, levelIndex, field, value) => {
    const newCriteria = [...formData.criteria];
    newCriteria[criterionIndex].levels[levelIndex] = {
      ...newCriteria[criterionIndex].levels[levelIndex],
      [field]: value,
    };
    setFormData({ ...formData, criteria: newCriteria });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (formData.criteria.length === 0) {
      toast.error('Adicione pelo menos um critério');
      return;
    }

    try {
      setSaving(true);
      const data = {
        ...formData,
        activity_id: activityId,
      };

      if (rubric?.id) {
        await gradingService.updateRubric(rubric.id, data);
        toast.success('Rubrica atualizada');
      } else {
        await gradingService.createRubric(data);
        toast.success('Rubrica criada');
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar rubrica:', error);
      toast.error('Erro ao salvar rubrica');
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
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">
                {rubric?.id ? 'Editar Rubrica' : 'Nova Rubrica'}
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Título da Rubrica</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground"
                  placeholder="Ex: Rubrica de Redação"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Descrição (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground resize-none"
                  placeholder="Descreva o propósito desta rubrica"
                />
              </div>
            </div>

            {/* Criteria */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Critérios de Avaliação</h4>
                <button
                  onClick={addCriterion}
                  className="whitespace-nowrap inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-primary text-slate-900 dark:text-white hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Critério</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.criteria.map((criterion, index) => (
                  <PremiumCard key={index} variant="elevated">
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 cursor-move">
                          <GripVertical className="w-5 h-5 text-muted-foreground" />
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={criterion.name}
                              onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground"
                              placeholder="Nome do critério"
                            />
                            <input
                              type="number"
                              value={criterion.weight}
                              onChange={(e) => updateCriterion(index, 'weight', parseFloat(e.target.value))}
                              className="w-24 px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground"
                              placeholder="Peso"
                              min="0"
                              max="100"
                            />
                          </div>

                          <textarea
                            value={criterion.description}
                            onChange={(e) => updateCriterion(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground resize-none text-sm"
                            placeholder="Descrição do critério"
                          />

                          {/* Levels */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Níveis de Desempenho</span>
                              <button
                                onClick={() => addLevel(index)}
                                className="text-xs text-primary hover:underline"
                              >
                                + Adicionar nível
                              </button>
                            </div>

                            {criterion.levels.map((level, levelIndex) => (
                              <div key={levelIndex} className="flex gap-2">
                                <input
                                  type="number"
                                  value={level.score}
                                  onChange={(e) =>
                                    updateLevel(index, levelIndex, 'score', parseFloat(e.target.value))
                                  }
                                  className="w-20 px-2 py-1 text-sm rounded border border-border bg-white dark:bg-slate-900 text-foreground"
                                  placeholder="Pts"
                                />
                                <input
                                  type="text"
                                  value={level.description}
                                  onChange={(e) =>
                                    updateLevel(index, levelIndex, 'description', e.target.value)
                                  }
                                  className="flex-1 px-2 py-1 text-sm rounded border border-border bg-white dark:bg-slate-900 text-foreground"
                                  placeholder="Descrição"
                                />
                                <button
                                  onClick={() => removeLevel(index, levelIndex)}
                                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => removeCriterion(index)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </PremiumCard>
                ))}
              </div>
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
              <span>{saving ? 'Salvando...' : 'Salvar Rubrica'}</span>
            </PremiumButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RubricManager;
