import React, { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  X,
  FileText,
  Clock,
  User,
  Calendar,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import gradingService from '@/services/gradingService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

  const GradingInterface = ({ submission, activity, onComplete, onCancel }) => {
  const [grade, setGrade] = useState(submission?.grade || '');
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [rubricScores, setRubricScores] = useState(submission?.rubric_scores || {});
  const [latePenalty, setLatePenalty] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [rubric, setRubric] = useState(null);
  const [showRubric, setShowRubric] = useState(true);
  const [saving, setSaving] = useState(false);

  const maxScore = activity?.total_points || 100;
  const isLate = submission?.submitted_at && activity?.due_date && 
                 new Date(submission.submitted_at) > new Date(activity.due_date);

  useEffect(() => {
    loadTemplates();
    loadRubric();
    calculateLatePenalty();
  }, []);

  useEffect(() => {
    if (rubric && rubricScores) {
      calculateTotalFromRubric();
    }
  }, [rubricScores]);

  const loadTemplates = async () => {
    try {
      const data = await gradingService.getFeedbackTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const loadRubric = async () => {
    try {
      const rubrics = await gradingService.getRubrics({ activityId: activity?.id });
      if (rubrics && rubrics.length > 0) {
        setRubric(rubrics[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar rubrica:', error);
    }
  };

  const calculateLatePenalty = () => {
    if (!isLate) {
      setLatePenalty(0);
      return;
    }

    const daysLate = Math.ceil(
      (new Date(submission.submitted_at) - new Date(activity.due_date)) / (1000 * 60 * 60 * 24)
    );

    // 5% penalty per day late, max 50%
    const penalty = Math.min(daysLate * 5, 50);
    setLatePenalty(penalty);
  };

  const calculateTotalFromRubric = () => {
    if (!rubric || !rubric.criteria) return;

    let total = 0;
    rubric.criteria.forEach((criterion, index) => {
      const score = rubricScores[index] || 0;
      total += score;
    });

    setGrade(total);
  };

  const handleRubricScoreChange = (criterionIndex, score) => {
    setRubricScores({
      ...rubricScores,
      [criterionIndex]: parseFloat(score) || 0,
    });
  };

  const handleTemplateSelect = async (templateId) => {
    try {
      const template = await gradingService.useFeedbackTemplate(templateId);
      setFeedback(feedback + (feedback ? '\n\n' : '') + template.content);
      setShowTemplates(false);
      toast.success('Template aplicado');
    } catch (error) {
      toast.error('Erro ao usar template');
    }
  };

  const handleSave = async () => {
    if (!grade || grade < 0 || grade > maxScore) {
      toast.error(`Nota deve estar entre 0 e ${maxScore}`);
      return;
    }

    if (!feedback.trim()) {
      toast.error('Feedback é obrigatório');
      return;
    }

    try {
      setSaving(true);
      await gradingService.gradeSubmission(submission.id, {
        grade: parseFloat(grade),
        feedback,
        rubricScores,
        latePenalty,
      });

      toast.success('Correção salva com sucesso!');
      onComplete();
    } catch (error) {
      console.error('Erro ao salvar correção:', error);
      toast.error('Erro ao salvar correção');
    } finally {
      setSaving(false);
    }
  };

  const finalGrade = Math.max(0, parseFloat(grade || 0) - latePenalty);
  const percentage = maxScore > 0 ? ((finalGrade / maxScore) * 100).toFixed(1) : 0;
  return (
    <div className="space-y-6">
      {/* Header */}
      <PremiumCard variant="elevated">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{activity?.title}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{submission?.student?.full_name || 'Aluno'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Entregue em {format(new Date(submission?.submitted_at), 'PPp', { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>

            {isLate && (
              <div className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <div className="text-sm">
                  <div className="font-semibold">Entrega Atrasada</div>
                  <div>Penalidade: -{latePenalty}%</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PremiumCard>

      {/* Rubric Section */}
      {rubric && (
        <PremiumCard variant="elevated">
          <div className="border-b border-border">
            <button
              onClick={() => setShowRubric(!showRubric)}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Rubrica de Avaliação</h3>
              </div>
              {showRubric ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          <AnimatePresence>
            {showRubric && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {rubric.criteria.map((criterion, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{criterion.name}</h4>
                          {criterion.description && (
                            <p className="text-sm text-muted-foreground">{criterion.description}</p>
                          )}
                        </div>
                        <div className="text-sm font-medium text-primary">
                          Peso: {criterion.weight}%
                        </div>
                      </div>

                      {/* Score levels */}
                      {criterion.levels && criterion.levels.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                          {criterion.levels.map((level, levelIndex) => (
                            <button
                              key={levelIndex}
                              onClick={() => handleRubricScoreChange(index, level.score)}
                              className={`p-2 rounded-lg border-2 transition-all text-left ${
                                rubricScores[index] === level.score
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="font-semibold text-sm">{level.score} pts</div>
                              <div className="text-xs text-muted-foreground">{level.description}</div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Manual score input */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Pontos:</label>
                        <input
                          type="number"
                          min="0"
                          max={criterion.weight}
                          value={rubricScores[index] || 0}
                          onChange={(e) => handleRubricScoreChange(index, e.target.value)}
                          className="w-24 px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground"
                        />
                        <span className="text-sm text-muted-foreground">de {criterion.weight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PremiumCard>
      )}

      {/* Grade & Feedback Section */}
      <PremiumCard variant="elevated">
        <div className="p-6 space-y-6">
          {/* Grade Input */}
          <div>
            <label className="block text-sm font-semibold mb-3">Nota Final</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max={maxScore}
                  step="0.5"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 text-lg font-bold rounded-lg border-2 border-border bg-white dark:bg-slate-900 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="0"
                />
              </div>
              
              <div className="text-2xl font-bold text-muted-foreground">
                / {maxScore}
              </div>

              <div className="px-6 py-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
                <div className="text-3xl font-bold text-primary">{percentage}%</div>
                {latePenalty > 0 && (
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    -{latePenalty}% penalidade
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Templates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold">Feedback</label>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-3 py-1.5 text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Templates</span>
              </button>
            </div>

            {showTemplates && templates.length > 0 && (
              <div className="mb-3 p-3 bg-muted/30 rounded-lg space-y-2">
                {templates.slice(0, 5).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary bg-white dark:bg-slate-900 hover:bg-primary/5 transition-all"
                  >
                    <div className="font-medium text-sm">{template.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{template.content}</div>
                  </button>
                ))}
              </div>
            )}

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Escreva seu feedback detalhado aqui..."
            />
            <p className="text-xs text-muted-foreground mt-2">
              Seja específico e construtivo em seu feedback.
            </p>
          </div>
        </div>
      </PremiumCard>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <PremiumButton
          variant="outline"
          leftIcon={X}
          onClick={onCancel}
          disabled={saving}
          className="bg-white dark:bg-slate-900 text-foreground border-border whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-6 py-2.5"
        >
          <span>Cancelar</span>
        </PremiumButton>

        <PremiumButton
          variant="gradient"
          leftIcon={Save}
          onClick={handleSave}
          disabled={saving}
          className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-6 py-2.5"
        >
          <span>{saving ? 'Salvando...' : 'Salvar Correção'}</span>
        </PremiumButton>
      </div>
    </div>
  );
};

export default GradingInterface;
