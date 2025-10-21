import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, LoadingScreen, EmptyState, PremiumButton, toast } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Target, Award, Users, TrendingUp, CheckCircle2, Clock, XCircle, ArrowLeft, Search, Download, Edit } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';

const MissionDetailPage = () => {
  const { missionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState(null);
  const [studentMissions, setStudentMissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [missionId, user?.id]);

  const loadData = async () => {
    try {
      // Buscar missão
      const { data: missionData, error: missionError } = await supabase
        .from('missions')
        .select('*, classes(name, subject)')
        .eq('id', missionId)
        .eq('created_by', user.id)
        .single();

      if (missionError) throw missionError;
      setMission(missionData);

      // Buscar progresso dos alunos
      const { data: progressData, error: progressError} = await supabase
        .from('user_missions')
        .select('*, profiles(full_name, email)')
        .eq('mission_id', missionId);

      if (progressError) throw progressError;
      setStudentMissions(progressData || []);
    } catch (error) {
      console.error('Erro ao carregar missão:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar a missão.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async (studentMissionId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    const progress = newStatus === 'completed' ? 100 : 50;

    try {
      const { error } = await supabase
        .from('user_missions')
        .update({
          status: newStatus,
          progress: progress,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', studentMissionId);

      if (error) throw error;

      toast({ title: 'Sucesso', description: `Status atualizado para ${newStatus === 'completed' ? 'concluída' : 'em andamento'}!` });
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({ title: 'Erro', description: 'Não foi possível atualizar o status.', variant: 'destructive' });
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return studentMissions;
    const term = searchTerm.toLowerCase();
    return studentMissions.filter(
      (sm) => sm.profiles?.full_name?.toLowerCase().includes(term) || sm.profiles?.email?.toLowerCase().includes(term)
    );
  }, [studentMissions, searchTerm]);

  const stats = useMemo(() => {
    const total = studentMissions.length;
    const completed = studentMissions.filter((sm) => sm.status === 'completed').length;
    const inProgress = studentMissions.filter((sm) => sm.status === 'in_progress').length;
    const pending = studentMissions.filter((sm) => sm.status === 'pending').length;
    const avgProgress = total > 0 ? studentMissions.reduce((sum, sm) => sum + (sm.progress || 0), 0) / total : 0;

    return { total, completed, inProgress, pending, avgProgress: avgProgress.toFixed(1) };
  }, [studentMissions]);

  const chartData = useMemo(() => {
    return [
      { name: 'Concluídas', value: stats.completed, color: '#10b981' },
      { name: 'Em Andamento', value: stats.inProgress, color: '#f59e0b' },
      { name: 'Pendentes', value: stats.pending, color: '#6b7280' },
    ];
  }, [stats]);

  const progressDistribution = useMemo(() => {
    const ranges = [
      { name: '0-25%', count: 0 },
      { name: '26-50%', count: 0 },
      { name: '51-75%', count: 0 },
      { name: '76-100%', count: 0 },
    ];

    studentMissions.forEach((sm) => {
      const progress = sm.progress || 0;
      if (progress <= 25) ranges[0].count++;
      else if (progress <= 50) ranges[1].count++;
      else if (progress <= 75) ranges[2].count++;
      else ranges[3].count++;
    });

    return ranges;
  }, [studentMissions]);

  const exportToExcel = () => {
    const data = studentMissions.map((sm) => ({
      Nome: sm.profiles?.full_name || 'N/A',
      Email: sm.profiles?.email || 'N/A',
      Status: sm.status === 'completed' ? 'Concluída' : sm.status === 'in_progress' ? 'Em Andamento' : 'Pendente',
      Progresso: `${sm.progress || 0}%`,
      'Data Conclusão': sm.completed_at ? new Date(sm.completed_at).toLocaleDateString('pt-BR') : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Progresso Missão');
    XLSX.writeFile(wb, `missao_${mission?.title?.replace(/\s/g, '_')}_progresso.xlsx`);
    toast({ title: 'Sucesso', description: 'Relatório exportado em Excel!' });
  };

  if (loading) return <LoadingScreen message="Carregando missão..." />;
  if (!mission) return <EmptyState icon={Target} title="Missão não encontrada" />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PremiumButton variant="outline" size="sm" onClick={() => navigate('/dashboard/missions')} className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </PremiumButton>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {mission.title}
            </h1>
            <p className="text-muted-foreground">{mission.classes?.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <PremiumButton onClick={exportToExcel} variant="outline" className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg">
            <Download className="w-4 h-4" />
            <span>Exportar Excel</span>
          </PremiumButton>
          <PremiumButton onClick={() => navigate(`/dashboard/missions/edit/${missionId}`)} variant="outline" className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg">
            <Edit className="w-4 h-4" />
            <span>Editar Missão</span>
          </PremiumButton>
        </div>
      </div>

      {/* Mission Info Card */}
      <PremiumCard variant="elevated">
        <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {mission.description && <p className="text-muted-foreground mb-4">{mission.description}</p>}
              {mission.objective && (
                <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg mb-4">
                  <div className="text-sm font-medium">🎯 Objetivo:</div>
                  <div className="text-sm mt-1">{mission.objective}</div>
                </div>
              )}
              <div className="flex items-center gap-6 text-sm">
                {mission.start_date && (
                  <span>
                    <strong>Início:</strong> {new Date(mission.start_date).toLocaleDateString('pt-BR')}
                  </span>
                )}
                {mission.end_date && (
                  <span>
                    <strong>Fim:</strong> {new Date(mission.end_date).toLocaleDateString('pt-BR')}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <strong>{mission.xp_reward} XP</strong>
                </div>
                <Badge variant={mission.is_active ? 'default' : 'secondary'}>
                  {mission.is_active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Alunos</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Concluídas</div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Em Andamento</div>
                <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-500 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
                <div className="text-2xl font-bold">{stats.pending}</div>
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
                <div className="text-sm text-muted-foreground">Progresso Médio</div>
                <div className="text-2xl font-bold">{stats.avgProgress}%</div>
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
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated">
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4">Distribuição de Progresso</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progressDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#f59e0b" name="Alunos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>
      </div>

      {/* Search */}
      <PremiumCard variant="elevated">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aluno por nome ou email..."
              className="pl-10"
            />
          </div>
        </div>
      </PremiumCard>

      {/* Students List */}
      <PremiumCard variant="elevated">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Progresso Individual ({filteredStudents.length} alunos)</h2>
          {filteredStudents.length === 0 ? (
            <EmptyState icon={Users} title="Nenhum aluno encontrado" />
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((sm) => (
                <div key={sm.id} className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{sm.profiles?.full_name || 'Nome não disponível'}</h3>
                        <Badge
                          variant={sm.status === 'completed' ? 'default' : sm.status === 'in_progress' ? 'secondary' : 'outline'}
                          className={
                            sm.status === 'completed'
                              ? 'bg-green-500/20 text-green-700'
                              : sm.status === 'in_progress'
                              ? 'bg-orange-500/20 text-orange-700'
                              : ''
                          }
                        >
                          {sm.status === 'completed' ? '✅ Concluída' : sm.status === 'in_progress' ? '🔥 Em Andamento' : '⏳ Pendente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{sm.profiles?.email}</p>
                      {sm.completed_at && (
                        <p className="text-xs text-green-600 mt-1">
                          Concluída em {new Date(sm.completed_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <PremiumButton
                      size="sm"
                      onClick={() => handleMarkAsCompleted(sm.id, sm.status)}
                      variant={sm.status === 'completed' ? 'outline' : 'default'}
                      className={`whitespace-nowrap inline-flex items-center gap-2 rounded-lg ${sm.status === 'completed' ? 'bg-white dark:bg-slate-900 text-foreground border-border' : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'}`}
                    >
                      {sm.status === 'completed' ? 'Desmarcar' : 'Marcar como Concluída'}
                    </PremiumButton>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-semibold">{sm.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                        style={{ width: `${sm.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PremiumCard>
    </div>
  );
};

export default MissionDetailPage;
