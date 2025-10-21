import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, LoadingScreen, EmptyState, PremiumButton, toast } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Award, Users, Calendar, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MissionsListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState([]);
  const [studentMissions, setStudentMissions] = useState([]);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      // Buscar missões criadas pelo professor
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (missionsError) throw missionsError;
      setMissions(missionsData || []);

      if (missionsData && missionsData.length > 0) {
        const missionIds = missionsData.map((m) => m.id);

        // Buscar progresso dos alunos
        const { data: progressData } = await supabase
          .from('user_missions')
          .select('*, profiles(full_name, email)')
          .in('mission_id', missionIds);

        setStudentMissions(progressData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar as missões.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getMissionStats = (missionId) => {
    const progress = studentMissions.filter((sm) => sm.mission_id === missionId);
    const total = progress.length;
    const completed = progress.filter((sm) => sm.status === 'completed').length;
    const inProgress = progress.filter((sm) => sm.status === 'in_progress').length;
    const pending = progress.filter((sm) => sm.status === 'pending').length;

    return { total, completed, inProgress, pending, completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0 };
  };

  const overallStats = useMemo(() => {
    const total = missions.length;
    const active = missions.filter((m) => m.is_active).length;
    const totalStudents = studentMissions.length;
    const completedMissions = studentMissions.filter((sm) => sm.status === 'completed').length;
    const totalXpAwarded = missions.reduce((sum, m) => {
      const completed = studentMissions.filter((sm) => sm.mission_id === m.id && sm.status === 'completed').length;
      return sum + completed * m.xp_reward;
    }, 0);

    return { total, active, totalStudents, completedMissions, totalXpAwarded };
  }, [missions, studentMissions]);

  const statusDistribution = useMemo(() => {
    const completed = studentMissions.filter((sm) => sm.status === 'completed').length;
    const inProgress = studentMissions.filter((sm) => sm.status === 'in_progress').length;
    const pending = studentMissions.filter((sm) => sm.status === 'pending').length;

    return [
      { name: 'Concluídas', value: completed, color: '#10b981' },
      { name: 'Em Andamento', value: inProgress, color: '#f59e0b' },
      { name: 'Pendentes', value: pending, color: '#6b7280' },
    ];
  }, [studentMissions]);

  if (loading) return <LoadingScreen message="Carregando missões..." />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Missões
          </h1>
          <p className="text-muted-foreground">Crie e acompanhe desafios para seus alunos</p>
        </div>
        <PremiumButton onClick={() => navigate('/dashboard/missions/create')} className="bg-gradient-to-r from-orange-600 to-red-600 text-white whitespace-nowrap inline-flex items-center gap-2 shadow-lg font-semibold rounded-xl">
          <Plus className="w-4 h-4" />
          <span>Nova Missão</span>
        </PremiumButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Missões</div>
                <div className="text-2xl font-bold">{overallStats.total}</div>
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Ativas</div>
                <div className="text-2xl font-bold text-green-600">{overallStats.active}</div>
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Participantes</div>
                <div className="text-2xl font-bold">{overallStats.totalStudents}</div>
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Concluídas</div>
                <div className="text-2xl font-bold">{overallStats.completedMissions}</div>
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">XP Distribuído</div>
                <div className="text-2xl font-bold text-yellow-600">{overallStats.totalXpAwarded}</div>
              </div>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4">Distribuição de Status</h2>
            {statusDistribution.every((s) => s.value === 0) ? (
              <EmptyState icon={Target} title="Sem dados" description="Crie missões para ver estatísticas." />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated">
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4">Taxa de Conclusão por Missão</h2>
            {missions.length === 0 ? (
              <EmptyState icon={Target} title="Sem missões" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={missions.slice(0, 5).map((m) => ({ name: m.title.substring(0, 20), rate: parseFloat(getMissionStats(m.id).completionRate) }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rate" fill="#f59e0b" name="Taxa de Conclusão (%)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </PremiumCard>
      </div>

      {/* Missions List */}
      <PremiumCard variant="elevated">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Missões Criadas</h2>
          {missions.length === 0 ? (
            <EmptyState icon={Target} title="Nenhuma missão criada" description="Crie sua primeira missão para engajar os alunos!" action={<PremiumButton onClick={() => navigate('/dashboard/missions/create')} className="whitespace-nowrap inline-flex items-center gap-2 rounded-lg">Criar Missão</PremiumButton>} />
          ) : (
            <div className="space-y-4">
              {missions.map((mission) => {
                const stats = getMissionStats(mission.id);
                return (
                  <div key={mission.id} className="p-4 border border-border rounded-xl hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/dashboard/missions/${mission.id}`)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{mission.title}</h3>
                          {mission.is_active ? (
                            <Badge className="bg-green-500/20 text-green-700">Ativa</Badge>
                          ) : (
                            <Badge variant="secondary">Inativa</Badge>
                          )}
                        </div>
                        {mission.description && <p className="text-sm text-muted-foreground line-clamp-2">{mission.description}</p>}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {mission.classes?.name}
                          </span>
                          {mission.end_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(mission.end_date).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            {mission.xp_reward} XP
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-semibold">{stats.completionRate}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all" style={{ width: `${stats.completionRate}%` }} />
                      </div>
                      <div className="flex items-center gap-6 mt-3 text-xs">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          {stats.completed} Concluídas
                        </span>
                        <span className="flex items-center gap-1 text-orange-600">
                          <Clock className="w-3 h-3" />
                          {stats.inProgress} Em Andamento
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <XCircle className="w-3 h-3" />
                          {stats.pending} Pendentes
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PremiumCard>
    </div>
  );
};

export default MissionsListPage;
