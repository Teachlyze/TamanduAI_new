import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye,
  FileText,
  Award,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ActivitySubmissionsPage = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, graded, pending, late
  const [stats, setStats] = useState({
    total: 0,
    graded: 0,
    pending: 0,
    late: 0,
    avgGrade: 0
  });

  useEffect(() => {
    loadData();
  }, [activityId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Buscar atividade
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('*, classes(name)')
        .eq('id', activityId)
        .single();

      if (activityError) throw activityError;
      setActivity(activityData);

      // Buscar submissões
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles:student_id(id, full_name, avatar_url)
        `)
        .eq('activity_id', activityId)
        .order('submitted_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      setSubmissions(submissionsData || []);

      // Calcular estatísticas
      const total = submissionsData?.length || 0;
      const graded = submissionsData?.filter(s => s.status === 'graded').length || 0;
      const pending = submissionsData?.filter(s => s.status === 'pending').length || 0;
      const late = submissionsData?.filter(s => s.late_submission).length || 0;
      const avgGrade = graded > 0 
        ? submissionsData.filter(s => s.grade != null).reduce((acc, s) => acc + s.grade, 0) / graded
        : 0;

      setStats({ total, graded, pending, late, avgGrade });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar submissões');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSubmissions = () => {
    switch (filter) {
      case 'graded':
        return submissions.filter(s => s.status === 'graded');
      case 'pending':
        return submissions.filter(s => s.status === 'pending');
      case 'late':
        return submissions.filter(s => s.late_submission);
      default:
        return submissions;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      graded: { color: 'bg-green-100 text-green-700', label: 'Corrigida' },
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pendente' },
      submitted: { color: 'bg-blue-100 text-blue-700', label: 'Enviada' }
    };
    const variant = variants[status] || variants.submitted;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  if (loading) return <LoadingScreen message="Carregando submissões..." />;

  if (!activity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PremiumCard className="p-8 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Atividade não encontrada</h2>
          <PremiumButton onClick={() => navigate('/dashboard/activities')}>
            Voltar para Atividades
          </PremiumButton>
        </PremiumCard>
      </div>
    );
  }

  const filteredSubmissions = getFilteredSubmissions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8"
      >
        <div className="container mx-auto">
          <PremiumButton
            variant="outline"
            size="sm"
            leftIcon={ArrowLeft}
            onClick={() => navigate(`/dashboard/activities/${activityId}`)}
            className="mb-4 bg-white/10 border-white/20 hover:bg-white/20 text-white"
          >
            Voltar
          </PremiumButton>

          <h1 className="text-4xl font-bold mb-2">{activity.title}</h1>
          <p className="text-white/90">
            {activity.classes?.name} • {stats.total} submissão(ões)
          </p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <PremiumCard className="p-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </PremiumCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <PremiumCard className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-3xl font-bold">{stats.graded}</div>
              <div className="text-sm text-muted-foreground">Corrigidas</div>
            </PremiumCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <PremiumCard className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-3xl font-bold">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </PremiumCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <PremiumCard className="p-6 text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <div className="text-3xl font-bold">{stats.late}</div>
              <div className="text-sm text-muted-foreground">Atrasadas</div>
            </PremiumCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <PremiumCard className="p-6 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-3xl font-bold">{stats.avgGrade.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Média</div>
            </PremiumCard>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <PremiumCard className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'Todas' },
                  { key: 'pending', label: 'Pendentes' },
                  { key: 'graded', label: 'Corrigidas' },
                  { key: 'late', label: 'Atrasadas' }
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === f.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Submissions List */}
        <AnimatePresence>
          {filteredSubmissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PremiumCard className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">Nenhuma submissão encontrada</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? 'Ainda não há submissões para esta atividade'
                    : 'Tente ajustar os filtros'}
                </p>
              </PremiumCard>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PremiumCard className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={submission.profiles?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                            {submission.profiles?.full_name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <h3 className="font-bold">{submission.profiles?.full_name || 'Aluno'}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>
                              Enviado em {format(new Date(submission.submitted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                            {submission.late_submission && (
                              <Badge className="bg-red-100 text-red-700">Atrasado</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {getStatusBadge(submission.status)}
                        
                        {submission.grade != null && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">
                              {submission.grade.toFixed(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              / {activity.total_points}
                            </div>
                          </div>
                        )}

                        <PremiumButton
                          size="sm"
                          variant="outline"
                          leftIcon={Eye}
                          onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                        >
                          Ver Detalhes
                        </PremiumButton>
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActivitySubmissionsPage;
