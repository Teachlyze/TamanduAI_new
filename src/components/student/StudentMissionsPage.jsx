import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, LoadingScreen, EmptyState, PremiumButton, toast } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Target, Award, Calendar, TrendingUp, CheckCircle2, Clock, Flame, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentMissionsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState([]);
  const [studentMissions, setStudentMissions] = useState([]);

  useEffect(() => {
    loadMissions();
  }, [user?.id]);

  const loadMissions = async () => {
    try {
      // Buscar progresso do aluno
      const { data: progressData, error: progressError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;
      setStudentMissions(progressData || []);

      // Buscar missões ativas das turmas do aluno
      const { data: classes } = await supabase.from('class_members').select('class_id').eq('user_id', user.id).eq('role', 'student');

      if (classes && classes.length > 0) {
        const classIds = classes.map((c) => c.class_id);
        const { data: missionsData } = await supabase
          .from('missions')
          .select('*, classes(name, subject)')
          .in('class_id', classIds)
          .eq('is_active', true);

        setMissions(missionsData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar as missões.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (missionId) => {
    return studentMissions.find((sm) => sm.mission_id === missionId);
  };

  const stats = {
    total: studentMissions.length,
    completed: studentMissions.filter((sm) => sm.status === 'completed').length,
    inProgress: studentMissions.filter((sm) => sm.status === 'in_progress').length,
    totalXp: studentMissions.filter((sm) => sm.status === 'completed').reduce((sum, sm) => sum + (sm.missions?.xp_reward || 0), 0),
  };

  if (loading) return <LoadingScreen message="Carregando missões..." />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Target className="w-8 h-8" />
              Missões
            </h1>
            <p className="text-white/90 mt-1">Complete desafios e ganhe XP para subir de nível!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center px-6 py-3 bg-white/20 rounded-xl backdrop-blur">
              <div className="text-3xl font-bold">{stats.completed}</div>
              <div className="text-sm text-white/80">Concluídas</div>
            </div>
            <div className="text-center px-6 py-3 bg-white/20 rounded-xl backdrop-blur">
              <div className="text-3xl font-bold flex items-center gap-1">
                <Award className="w-6 h-6 text-yellow-300" />
                {stats.totalXp}
              </div>
              <div className="text-sm text-white/80">XP Ganho</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <PremiumCard variant="elevated">
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Missões Ativas</div>
                  <div className="text-2xl font-bold">{stats.inProgress}</div>
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <PremiumCard variant="elevated">
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
                  <div className="text-2xl font-bold">{stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : 0}%</div>
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <PremiumCard variant="elevated">
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Rank</div>
                  <div className="text-2xl font-bold">
                    {stats.completed >= 10 ? 'Mestre' : stats.completed >= 5 ? 'Avançado' : stats.completed >= 1 ? 'Iniciante' : 'Novato'}
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* Missions List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Missões Disponíveis
        </h2>

        {missions.length === 0 ? (
          <EmptyState icon={Target} title="Nenhuma missão disponível" description="Aguarde seu professor criar desafios para você!" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {missions.map((mission, index) => {
              const progress = getProgress(mission.id);
              const isCompleted = progress?.status === 'completed';
              const isInProgress = progress?.status === 'in_progress';

              return (
                <motion.div key={mission.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <PremiumCard variant="elevated" className={`overflow-hidden ${isCompleted ? 'border-2 border-green-500' : ''}`}>
                    <div className={`p-6 ${isCompleted ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10' : isInProgress ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10' : ''}`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold">{mission.title}</h3>
                            {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                          </div>
                          {mission.description && <p className="text-sm text-muted-foreground">{mission.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-lg">
                          <Award className="w-5 h-5 text-yellow-600" />
                          <span className="font-bold text-yellow-600">{mission.xp_reward} XP</span>
                        </div>
                      </div>

                      {/* Objective */}
                      {mission.objective && (
                        <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg mb-4">
                          <div className="text-sm font-medium flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Objetivo:
                          </div>
                          <div className="text-sm mt-1">{mission.objective}</div>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {mission.classes?.name}
                        </span>
                        {mission.end_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(mission.end_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>

                      {/* Progress */}
                      {progress && (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-semibold">{progress.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all" style={{ width: `${progress.progress}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="mt-4">
                        {isCompleted ? (
                          <Badge className="bg-green-500/20 text-green-700 w-full justify-center py-2">✅ Concluída</Badge>
                        ) : isInProgress ? (
                          <Badge className="bg-orange-500/20 text-orange-700 w-full justify-center py-2">🔥 Em Andamento</Badge>
                        ) : (
                          <Badge variant="secondary" className="w-full justify-center py-2">
                            <Clock className="w-4 h-4 mr-2" />
                            Pendente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Motivational Card */}
      {stats.completed > 0 && (
        <PremiumCard variant="elevated">
          <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-xl font-bold mb-2">Parabéns! 🎉</h3>
            <p className="text-muted-foreground">
              Você já completou <strong className="text-green-600">{stats.completed}</strong> {stats.completed === 1 ? 'missão' : 'missões'} e ganhou{' '}
              <strong className="text-yellow-600">{stats.totalXp} XP</strong>! Continue assim para subir de nível!
            </p>
          </div>
        </PremiumCard>
      )}
    </div>
  );
};

export default StudentMissionsPage;
