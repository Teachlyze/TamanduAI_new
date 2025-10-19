import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  TrendingUp
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

const TeacherActivitiesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, published, draft

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  useEffect(() => {
    let filtered = activities;

    // Filtrar por busca
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.classes?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(activity => activity.status === filterStatus);
    }

    setFilteredActivities(filtered);
  }, [searchQuery, filterStatus, activities]);

  const loadActivities = async () => {
    try {
      setLoading(true);

      // Buscar atividades do professor
      const { data: activitiesData, error } = await supabase
        .from('activities')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Para cada atividade, buscar contagem de submissões
      const activitiesWithCounts = await Promise.all(
        (activitiesData || []).map(async (activity) => {
          const [totalSubmissions, gradedSubmissions] = await Promise.all([
            supabase
              .from('submissions')
              .select('id', { count: 'exact', head: true })
              .eq('activity_id', activity.id),
            supabase
              .from('submissions')
              .select('id', { count: 'exact', head: true })
              .eq('activity_id', activity.id)
              .not('grade', 'is', null)
          ]);

          return {
            ...activity,
            totalSubmissions: totalSubmissions.count || 0,
            gradedSubmissions: gradedSubmissions.count || 0,
            pendingCorrections: (totalSubmissions.count || 0) - (gradedSubmissions.count || 0)
          };
        })
      );

      setActivities(activitiesWithCounts);
      setFilteredActivities(activitiesWithCounts);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      toast.error('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'archived':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'published':
        return 'Publicada';
      case 'draft':
        return 'Rascunho';
      case 'archived':
        return 'Arquivada';
      default:
        return status;
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando suas atividades..." />;
  }

  const stats = {
    total: activities.length,
    published: activities.filter(a => a.status === 'published').length,
    draft: activities.filter(a => a.status === 'draft').length,
    pendingCorrections: activities.reduce((sum, a) => sum + (a.pendingCorrections || 0), 0)
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-8 text-white"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Gestão de Atividades</span>
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Minhas Atividades 📝</h1>
            <p className="text-white/90 text-lg">Crie, gerencie e acompanhe as atividades das suas turmas</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            <PremiumButton
              leftIcon={Plus}
              onClick={() => navigate('/dashboard/activities/new')}
              className="bg-white text-purple-600 hover:bg-white/90 shadow-lg whitespace-nowrap inline-flex items-center gap-2 font-semibold border-2 border-white/20"
            >
              Nova Atividade
            </PremiumButton>
          </motion.div>
        </div>

        {/* Floating Icon */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-10 right-20 text-6xl opacity-20"
        >
          📝
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: "Total",
            value: stats.total,
            icon: FileText,
            gradient: "from-purple-500 to-pink-500"
          },
          {
            title: "Publicadas",
            value: stats.published,
            icon: CheckCircle,
            gradient: "from-green-500 to-emerald-500"
          },
          {
            title: "Rascunhos",
            value: stats.draft,
            icon: Edit,
            gradient: "from-yellow-500 to-orange-500"
          },
          {
            title: "Para Corrigir",
            value: stats.pendingCorrections,
            icon: Clock,
            gradient: "from-red-500 to-orange-500",
            urgent: stats.pendingCorrections > 0
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremiumCard 
              variant="elevated" 
              className={`relative overflow-hidden group hover:scale-105 transition-transform ${
                stat.urgent ? 'border-2 border-orange-300 dark:border-orange-700' : ''
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  {stat.urgent && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </motion.div>
                  )}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PremiumCard variant="elevated" className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar atividades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'published', 'draft'].map((status) => (
                <PremiumButton
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  leftIcon={Filter}
                  className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border"
                >
                  {status === 'all' ? 'Todas' : status === 'published' ? 'Publicadas' : 'Rascunhos'}
                </PremiumButton>
              ))}
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        activities.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhuma atividade criada"
            description="Crie sua primeira atividade para começar a avaliar seus alunos"
            action={{
              label: "Criar Primeira Atividade",
              onClick: () => navigate('/dashboard/activities/new')
            }}
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Nenhuma atividade encontrada"
            description="Tente ajustar sua busca ou filtros"
          />
        )
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredActivities.map((activity, index) => {
              const daysUntilDue = activity.due_date 
                ? Math.ceil((new Date(activity.due_date) - new Date()) / (1000 * 60 * 60 * 24))
                : null;
              const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
              const isUrgent = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <PremiumCard
                    variant="elevated"
                    className={`group relative overflow-hidden hover:scale-105 transition-all cursor-pointer ${
                      isUrgent ? 'border-2 border-orange-300 dark:border-orange-700' : ''
                    }`}
                    onClick={() => navigate(`/dashboard/activities/${activity.id}`)}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                              {activity.title}
                            </h3>
                            <Badge className={getStatusColor(activity.status)}>
                              {getStatusLabel(activity.status)}
                            </Badge>
                          </div>
                          {activity.classes && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${activity.classes.color || 'from-blue-500 to-cyan-500'}`} />
                              <span>{activity.classes.name}</span>
                              <span>•</span>
                              <span>{activity.classes.subject}</span>
                            </div>
                          )}
                        </div>
                        {(isUrgent || isOverdue) && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <AlertCircle className={`w-6 h-6 ${isOverdue ? 'text-red-600' : 'text-orange-600'}`} />
                          </motion.div>
                        )}
                      </div>

                      {/* Description */}
                      {activity.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {activity.description}
                        </p>
                      )}

                      {/* Stats and Info */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-6 text-sm">
                          {activity.due_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                                {new Date(activity.due_date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{activity.totalSubmissions}</span>
                            <span className="text-muted-foreground">submissões</span>
                          </div>
                          {activity.pendingCorrections > 0 && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-orange-600" />
                              <span className="font-medium text-orange-600">{activity.pendingCorrections}</span>
                              <span className="text-muted-foreground">para corrigir</span>
                            </div>
                          )}
                          {activity.max_score && (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-purple-600" />
                              <span className="font-medium">{activity.max_score}</span>
                              <span className="text-muted-foreground">pontos</span>
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                          <PremiumButton
                            size="sm"
                            variant="outline"
                            leftIcon={Eye}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/activities/${activity.id}`);
                            }}
                          >
                            Ver
                          </PremiumButton>
                          <PremiumButton
                            size="sm"
                            variant="outline"
                            leftIcon={Edit}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/activities/edit/${activity.id}`);
                            }}
                          >
                            Editar
                          </PremiumButton>
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TeacherActivitiesPage;
