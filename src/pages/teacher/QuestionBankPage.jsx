import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Plus, Search, Filter, TrendingUp, Award,
  Eye, ThumbsUp, CheckCircle, XCircle, Clock, Star,
  BarChart3, Users, Target, Zap, FileText, Tag
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import questionBankService from '@/services/questionBankService';
import { useAuth } from '@/hooks/useAuth';

export default function QuestionBankPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    subject: '',
    difficulty: null,
    questionType: '',
    status: 'approved',
    search: ''
  });
  const [view, setView] = useState('browse'); // 'browse', 'create', 'myQuestions'

  useEffect(() => {
    loadQuestions();
    if (user) loadAuthorStats();
  }, [filters.subject, filters.difficulty, filters.questionType, filters.status]);

  const loadQuestions = async () => {
    setLoading(true);
    const result = await questionBankService.searchQuestions(filters);
    if (result.success) {
      setQuestions(result.data);
    }
    setLoading(false);
  };

  const loadAuthorStats = async () => {
    const result = await questionBankService.getAuthorStats(user.id);
    setStats(result);
  };

  const getDifficultyColor = (diff) => {
    const colors = {
      1: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      2: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      4: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      5: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return colors[diff] || colors[3];
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

  const getTypeLabel = (type) => {
    const labels = {
      'multiple_choice': 'Múltipla Escolha',
      'true_false': 'Verdadeiro/Falso',
      'open': 'Dissertativa'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 shadow-xl"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">🏦 Banco de Questões</h1>
              <p className="text-blue-100">
                Milhares de questões curadas | Contribua e ganhe desconto
              </p>
            </div>
            <PremiumButton
              onClick={() => navigate('/dashboard/question-bank/create')}
              className="bg-white text-purple-600 hover:bg-blue-50 whitespace-nowrap inline-flex items-center gap-2 shadow-lg font-semibold border-2 border-white/20 rounded-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Questão</span>
            </PremiumButton>
          </div>

          {/* Stats do Autor */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm text-blue-100">Total</span>
                </div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm text-blue-100">Aprovadas</span>
                </div>
                <div className="text-2xl font-bold text-green-300">{stats.approved}</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm text-blue-100">Pendentes</span>
                </div>
                <div className="text-2xl font-bold text-yellow-300">{stats.pending}</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm text-blue-100">Usos</span>
                </div>
                <div className="text-2xl font-bold">{stats.totalUses}</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5" />
                  <span className="text-sm text-white">Desconto</span>
                </div>
                <div className="text-2xl font-bold">{stats.discountEarned}%</div>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PremiumCard variant="elevated" className="mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Busca */}
                <div className="md:col-span-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar questões..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Matéria */}
                <select
                  value={filters.subject}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800"
                >
                  <option value="">Todas Matérias</option>
                  <option value="matematica">Matemática</option>
                  <option value="portugues">Português</option>
                  <option value="fisica">Física</option>
                  <option value="quimica">Química</option>
                  <option value="biologia">Biologia</option>
                  <option value="historia">História</option>
                  <option value="geografia">Geografia</option>
                  <option value="ingles">Inglês</option>
                </select>

                {/* Dificuldade */}
                <select
                  value={filters.difficulty || ''}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value ? parseInt(e.target.value) : null })}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800"
                >
                  <option value="">Todas Dificuldades</option>
                  <option value="1">Muito Fácil</option>
                  <option value="2">Fácil</option>
                  <option value="3">Médio</option>
                  <option value="4">Difícil</option>
                  <option value="5">Muito Difícil</option>
                </select>

                {/* Tipo */}
                <select
                  value={filters.questionType}
                  onChange={(e) => setFilters({ ...filters, questionType: e.target.value })}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800"
                >
                  <option value="">Todos Tipos</option>
                  <option value="multiple_choice">Múltipla Escolha</option>
                  <option value="true_false">Verdadeiro/Falso</option>
                  <option value="open">Dissertativa</option>
                </select>

                {/* Status */}
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800"
                >
                  <option value="">Todos Status</option>
                  <option value="approved">Aprovadas</option>
                  <option value="pending">Pendentes</option>
                  <option value="rejected">Rejeitadas</option>
                </select>
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Lista de Questões */}
        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Zap className="w-12 h-12 text-purple-600" />
            </motion.div>
            <p className="mt-4 text-gray-600">Carregando questões...</p>
          </div>
        ) : questions.length === 0 ? (
          <PremiumCard variant="elevated">
            <div className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nenhuma questão encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ajuste os filtros ou seja o primeiro a contribuir!
              </p>
              <PremiumButton onClick={() => navigate('/dashboard/question-bank/create')} className="whitespace-nowrap inline-flex items-center gap-2 rounded-xl">
                <Plus className="w-5 h-5" />
                <span>Criar Primeira Questão</span>
              </PremiumButton>
            </div>
          </PremiumCard>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PremiumCard variant="elevated" className="hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              <Target className="w-3 h-3 mr-1" />
                              {getDifficultyLabel(question.difficulty)}
                            </Badge>
                            <Badge variant="outline">
                              {getTypeLabel(question.question_type)}
                            </Badge>
                            {question.status === 'approved' && (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aprovada
                              </Badge>
                            )}
                            {question.status === 'pending' && (
                              <Badge className="bg-yellow-100 text-yellow-700">
                                <Clock className="w-3 h-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {question.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                            {question.question_text}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Eye className="w-4 h-4" />
                            {question.uses_count || 0}
                          </div>
                          {question.correct_rate && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <TrendingUp className="w-4 h-4" />
                              {question.correct_rate}%
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {question.subject && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {question.subject}
                            </div>
                          )}
                          {question.reference && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              {question.reference}
                            </div>
                          )}
                          {question.profiles && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {question.profiles.name}
                            </div>
                          )}
                        </div>
                        <PremiumButton
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/dashboard/question-bank/${question.id}`)}
                          className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
                        >
                          Ver Detalhes
                        </PremiumButton>
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
