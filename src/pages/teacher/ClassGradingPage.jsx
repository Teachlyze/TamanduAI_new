import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  ChevronDown
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

const ClassGradingPage = ({ classId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, graded
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    if (classId && user) {
      loadData();
    }
  }, [classId, user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Buscar todas as atividades da turma
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('id, title, description, created_at, type')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      setActivities(activitiesData || []);

      // Se houver atividades, selecionar a primeira por padrão
      if (activitiesData && activitiesData.length > 0) {
        setSelectedActivityId(activitiesData[0].id);
        await loadSubmissions(activitiesData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (activityId) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          id,
          user_id,
          activity_id,
          content,
          grade,
          feedback,
          created_at,
          graded_at,
          user:profiles(id, user_metadata)
        `)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);

      // Inicializar grades
      const gradesMap = {};
      (data || []).forEach(sub => {
        gradesMap[sub.id] = sub.grade || '';
      });
      setGrades(gradesMap);
    } catch (error) {
      console.error('Erro ao carregar submissões:', error);
      toast.error('Erro ao carregar submissões');
    }
  };

  const handleActivityChange = (activityId) => {
    setSelectedActivityId(activityId);
    loadSubmissions(activityId);
    setSearchQuery('');
    setFilterStatus('all');
  };

  const handleGradeSave = async (submissionId, grade) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          grade: parseFloat(grade) || null,
          graded_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('Nota salva com sucesso');
      setGrades(prev => ({ ...prev, [submissionId]: grade }));
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      toast.error('Erro ao salvar nota');
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.user?.user_metadata?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !sub.grade) ||
      (filterStatus === 'graded' && sub.grade);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: submissions.length,
    graded: submissions.filter(s => s.grade).length,
    pending: submissions.filter(s => !s.grade).length
  };

  if (loading) {
    return <LoadingScreen message="Carregando correções..." />;
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhuma atividade criada"
        description="Crie atividades para começar a receber submissões"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total de Submissões', value: stats.total, icon: FileText, color: 'from-blue-500 to-cyan-500' },
          { label: 'Corrigidas', value: stats.graded, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
          { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'from-orange-500 to-red-500' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <PremiumCard variant="elevated" className="p-6">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-3`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </PremiumCard>
            </motion.div>
          );
        })}
      </div>

      {/* Seletor de Atividade */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PremiumCard variant="elevated" className="p-4">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-muted-foreground">Filtrar por Atividade</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {activities.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => handleActivityChange(activity.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedActivityId === activity.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-border hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold text-sm truncate">{activity.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Filtros e Busca */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <PremiumCard variant="elevated" className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do aluno..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'graded'].map((status) => (
                <PremiumButton
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="whitespace-nowrap inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 text-foreground border-border"
                >
                  {status === 'all' && 'Todas'}
                  {status === 'pending' && 'Pendentes'}
                  {status === 'graded' && 'Corrigidas'}
                </PremiumButton>
              ))}
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Lista de Submissões */}
      {filteredSubmissions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma submissão encontrada"
          description={searchQuery ? 'Tente ajustar sua busca' : 'Nenhuma submissão para esta atividade'}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredSubmissions.map((submission, idx) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
              >
                <PremiumCard
                  variant="elevated"
                  className="p-4 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setExpandedSubmission(expandedSubmission === submission.id ? null : submission.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {submission.user?.user_metadata?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{submission.user?.user_metadata?.name || 'Aluno'}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(submission.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {submission.grade ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {submission.grade}
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground transition-transform ${
                          expandedSubmission === submission.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Conteúdo Expandido */}
                  <AnimatePresence>
                    {expandedSubmission === submission.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-border space-y-4"
                      >
                        {/* Conteúdo da Submissão */}
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground">Conteúdo</label>
                          <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                            {submission.content || 'Sem conteúdo'}
                          </div>
                        </div>

                        {/* Nota */}
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground">Nota (0-10)</label>
                          <div className="mt-2 flex gap-2">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.5"
                              value={grades[submission.id] || ''}
                              onChange={(e) => setGrades(prev => ({ ...prev, [submission.id]: e.target.value }))}
                              className="flex-1 px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground"
                              placeholder="Digite a nota"
                            />
                            <PremiumButton
                              size="sm"
                              onClick={() => handleGradeSave(submission.id, grades[submission.id])}
                              className="whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-slate-900 dark:text-white hover:bg-green-700"
                            >
                              Salvar
                            </PremiumButton>
                          </div>
                        </div>

                        {/* Feedback */}
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground">Feedback</label>
                          <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                            {submission.feedback || 'Sem feedback'}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </PremiumCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ClassGradingPage;
