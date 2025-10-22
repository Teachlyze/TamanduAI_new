import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Calendar,
  Users,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import gradingService from '@/services/gradingService';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const GradingQueuePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    soon: 0,
    normal: 0,
  });
  const [filters, setFilters] = useState({
    priority: 'all',
    classId: null,
  });

  useEffect(() => {
    if (user) {
      loadQueue();
    }
  }, [user, filters]);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await gradingService.getGradingQueue(user.id, filters);
      
      setQueue(data);
      
      // Calculate stats
      const urgent = data.filter(item => item.priority === 'urgent').length;
      const soon = data.filter(item => item.priority === 'soon').length;
      const normal = data.filter(item => item.priority === 'normal').length;
      
      setStats({
        total: data.length,
        urgent,
        soon,
        normal,
      });
    } catch (error) {
      console.error('Erro ao carregar fila:', error);
      toast.error('Erro ao carregar fila de correções');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: {
        label: 'Urgente',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
        icon: AlertCircle,
      },
      soon: {
        label: 'Em breve',
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        icon: Clock,
      },
      normal: {
        label: 'Normal',
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20',
        icon: CheckCircle,
      },
    };
    return configs[priority] || configs.normal;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const handleGradeSubmission = (submissionId, activityId) => {
    navigate(`/dashboard/activities/${activityId}/submissions/${submissionId}/grade`);
  };

  if (loading) {
    return <LoadingScreen message="Carregando fila de correções..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">✏️ Painel de Correções</h1>
              <p className="text-white/90 text-lg">
                Gerencie todas as suas correções pendentes
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Urgentes</p>
                  <p className="text-2xl font-bold">{stats.urgent}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/30 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Em Breve</p>
                  <p className="text-2xl font-bold">{stats.soon}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/30 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Normal</p>
                  <p className="text-2xl font-bold">{stats.normal}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <PremiumCard variant="elevated">
        <div className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Filtrar por:</span>
            
            {['all', 'urgent', 'soon', 'normal'].map((priority) => {
              const isActive = filters.priority === priority;
              const label = priority === 'all' ? 'Todos' : 
                           priority === 'urgent' ? 'Urgentes' :
                           priority === 'soon' ? 'Em Breve' : 'Normal';
              
              return (
                <button
                  key={priority}
                  onClick={() => setFilters({ ...filters, priority })}
                  className={`whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white dark:bg-slate-900 text-foreground border border-border hover:bg-muted'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                  {priority !== 'all' && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-white/20">
                      {stats[priority]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </PremiumCard>

      {/* Queue List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {queue.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <EmptyState
                icon={ClipboardCheck}
                title="Nenhuma correção pendente"
                description={
                  filters.priority === 'all'
                    ? 'Parabéns! Você está em dia com as correções.'
                    : 'Não há correções com esta prioridade.'
                }
              />
            </motion.div>
          ) : (
            queue.map((item, index) => {
              const priorityConfig = getPriorityConfig(item.priority);
              const PriorityIcon = priorityConfig.icon;

              return (
                <motion.div
                  key={item.submission_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PremiumCard variant="elevated" className="hover:shadow-xl transition-all">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left Side - Info */}
                        <div className="flex-1">
                          {/* Priority Badge */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`whitespace-nowrap inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${priorityConfig.bg} ${priorityConfig.color}`}>
                              <PriorityIcon className="w-4 h-4" />
                              <span>{priorityConfig.label}</span>
                            </div>
                            
                            {item.is_late && (
                              <div className="whitespace-nowrap inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>Entrega Atrasada</span>
                              </div>
                            )}
                          </div>

                          {/* Activity Title */}
                          <h3 className="text-xl font-bold mb-2">{item.activity_title}</h3>

                          {/* Student Info */}
                          <div className="flex items-center gap-2 text-muted-foreground mb-3">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{item.student_name}</span>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Entregue {formatDate(item.submitted_at)}</span>
                            </div>
                            
                            {item.due_date && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>Prazo: {new Date(item.due_date).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}

                            {item.total_points && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span>{item.total_points} pontos</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Side - Action */}
                        <div className="flex flex-col items-end gap-2">
                          <PremiumButton
                            variant="gradient"
                            leftIcon={ClipboardCheck}
                            onClick={() => handleGradeSubmission(item.submission_id, item.activity_id)}
                            className="whitespace-nowrap inline-flex items-center gap-2"
                          >
                            <span>Corrigir Agora</span>
                            <ChevronRight className="w-4 h-4" />
                          </PremiumButton>
                          
                          <button
                            onClick={() => navigate(`/dashboard/activities/${item.activity_id}`)}
                            className="text-sm text-primary hover:underline"
                          >
                            Ver atividade completa
                          </button>
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GradingQueuePage;
