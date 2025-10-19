import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, X, BookOpen, Target, Award } from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import questionBankService from '@/services/questionBankService';
import { toast } from 'react-hot-toast';

export default function CreateQuestionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    difficulty: 3,
    subject: '',
    topic: '',
    tags: [],
    reference: '',
    visibility: 'public',
    points: 10
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    if (!formData.question_text.trim()) {
      toast.error('Enunciado é obrigatório');
      return;
    }
    if (!formData.subject.trim()) {
      toast.error('Matéria é obrigatória');
      return;
    }
    
    if (formData.question_type === 'multiple_choice') {
      const validOptions = formData.options.filter(o => o.trim());
      if (validOptions.length < 2) {
        toast.error('Adicione pelo menos 2 alternativas');
        return;
      }
      if (!formData.correct_answer.trim()) {
        toast.error('Selecione a resposta correta');
        return;
      }
    }

    setLoading(true);
    
    try {
      const result = await questionBankService.createQuestion(formData);
      
      if (result.success) {
        toast.success('Questão enviada para aprovação!');
        navigate('/dashboard/question-bank');
      } else {
        toast.error(result.error || 'Erro ao criar questão');
      }
    } catch (error) {
      console.error('Erro ao criar questão:', error);
      toast.error('Erro ao criar questão');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const handleRemoveOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const getDifficultyLabel = (diff) => {
    const labels = {
      1: 'Muito Fácil',
      2: 'Fácil',
      3: 'Médio',
      4: 'Difícil',
      5: 'Muito Difícil'
    };
    return labels[diff] || 'Médio';
  };

  const getDifficultyColor = (diff) => {
    const colors = {
      1: 'bg-green-500',
      2: 'bg-blue-500',
      3: 'bg-yellow-500',
      4: 'bg-orange-500',
      5: 'bg-red-500'
    };
    return colors[diff] || colors[3];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 shadow-xl"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/question-bank')}
              className="text-white hover:bg-white/20 whitespace-nowrap inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">📝 Nova Questão</h1>
          <p className="text-blue-100">
            Contribua com o banco de questões e ganhe até 25% de desconto
          </p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PremiumCard variant="elevated">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Informações Básicas
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-2">Título da Questão *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Cálculo de Área do Triângulo"
                    className="bg-white dark:bg-slate-900 text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Enunciado *</label>
                  <Textarea
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    placeholder="Digite o enunciado completo da questão..."
                    rows={4}
                    className="bg-white dark:bg-slate-900 text-foreground"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Matéria *</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Ex: Matemática"
                      className="bg-white dark:bg-slate-900 text-foreground"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tópico</label>
                    <Input
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="Ex: Geometria Plana"
                      className="bg-white dark:bg-slate-900 text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Questão</label>
                  <select
                    value={formData.question_type}
                    onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-foreground border-border"
                  >
                    <option value="multiple_choice">Múltipla Escolha</option>
                    <option value="true_false">Verdadeiro/Falso</option>
                    <option value="open">Dissertativa</option>
                  </select>
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          {/* Alternativas (se múltipla escolha) */}
          {formData.question_type === 'multiple_choice' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PremiumCard variant="elevated">
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Alternativas
                  </h2>

                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={formData.correct_answer === option}
                          onChange={() => setFormData({ ...formData, correct_answer: option })}
                          className="w-4 h-4"
                        />
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                          className="flex-1 bg-white dark:bg-slate-900 text-foreground"
                        />
                        {formData.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOption(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOption}
                    className="w-full whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Alternativa</span>
                  </Button>
                </div>
              </PremiumCard>
            </motion.div>
          )}

          {/* Explicação e Metadados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PremiumCard variant="elevated">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Detalhes Adicionais
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-2">Explicação da Resposta</label>
                  <Textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="Explique por que esta é a resposta correta..."
                    rows={3}
                    className="bg-white dark:bg-slate-900 text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dificuldade: {getDifficultyLabel(formData.difficulty)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Muito Fácil</span>
                    <span>Fácil</span>
                    <span>Médio</span>
                    <span>Difícil</span>
                    <span>Muito Difícil</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Referência (opcional)</label>
                    <Input
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      placeholder="Ex: ENEM-2023, Capítulo 5"
                      className="bg-white dark:bg-slate-900 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Pontos</label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                      className="bg-white dark:bg-slate-900 text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Adicionar tag..."
                      className="flex-1 bg-white dark:bg-slate-900 text-foreground"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline" className="whitespace-nowrap inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          {/* Ações */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/question-bank')}
              className="flex-1 whitespace-nowrap inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border"
            >
              <X className="w-5 h-5" />
              <span>Cancelar</span>
            </Button>
            <PremiumButton
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white whitespace-nowrap inline-flex items-center justify-center gap-2 shadow-lg rounded-xl"
            >
              {loading ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Salvar Questão</span>
                </>
              )}
            </PremiumButton>
          </div>
        </form>
      </div>
    </div>
  );
}
