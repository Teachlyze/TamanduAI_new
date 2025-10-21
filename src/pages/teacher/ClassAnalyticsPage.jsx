import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ClipboardList,
  Award,
  MessageSquare,
  Download,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart as RechartsLine,
  BarChart as RechartsBar,
  PieChart as RechartsPie,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import classAnalyticsService from '@/services/classAnalyticsService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ClassAnalyticsPage = () => {
  const { classId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [studentRanking, setStudentRanking] = useState([]);
  const [activityPerformance, setActivityPerformance] = useState([]);
  const [insights, setInsights] = useState(null);
  const [trends, setTrends] = useState(null);
  const [gradeDistribution, setGradeDistribution] = useState(null);
  const [engagement, setEngagement] = useState(null);

  useEffect(() => {
    if (classId) {
      loadAllData();
    }
  }, [classId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [
        overviewData,
        dailyData,
        rankingData,
        performanceData,
        insightsData,
        trendsData,
        distributionData,
        engagementData,
      ] = await Promise.all([
        classAnalyticsService.getClassOverview(classId),
        classAnalyticsService.getDailyActivity(classId),
        classAnalyticsService.getStudentRanking(classId, 10),
        classAnalyticsService.getActivityPerformance(classId),
        classAnalyticsService.getClassInsights(classId),
        classAnalyticsService.getPerformanceTrend(classId),
        classAnalyticsService.getGradeDistribution(classId),
        classAnalyticsService.getEngagementMetrics(classId),
      ]);

      setOverview(overviewData);
      setDailyActivity(dailyData);
      setStudentRanking(rankingData);
      setActivityPerformance(performanceData);
      setInsights(insightsData);
      setTrends(trendsData);
      setGradeDistribution(distributionData);
      setEngagement(engagementData);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await classAnalyticsService.downloadAnalyticsCSV(classId, overview.class_name);
      toast.success('Relatório exportado!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const COLORS = {
    excellent: '#10b981', // green
    good: '#3b82f6',      // blue
    average: '#f59e0b',   // amber
    below: '#ef4444',     // red
  };

  if (loading) {
    return <LoadingScreen message="Carregando analytics..." />;
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white"
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
              <h1 className="text-4xl font-bold mb-2">📊 Analytics da Turma</h1>
              <p className="text-white/90 text-lg">{overview.class_name}</p>
            </div>

            <PremiumButton
              variant="white"
              leftIcon={Download}
              onClick={handleExportCSV}
              className="whitespace-nowrap inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-white/90"
            >
              <span>Exportar Relatório</span>
            </PremiumButton>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Alunos</p>
                  <p className="text-2xl font-bold">{overview.total_students}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Atividades</p>
                  <p className="text-2xl font-bold">{overview.total_activities}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Média Geral</p>
                  <p className="text-2xl font-bold">{overview.average_grade?.toFixed(1) || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Engajamento</p>
                  <p className="text-2xl font-bold">
                    {engagement ? `${engagement.participation_rate.toFixed(0)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Insights */}
      {insights && insights.recommendations && (
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-primary" />
              Insights Automáticos
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {insights.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/30"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{rec.rec}</p>
                </div>
              ))}
            </div>
          </div>
        </PremiumCard>
      )}

      {/* Trends */}
      {trends && (
        <div className="grid md:grid-cols-3 gap-4">
          <PremiumCard variant="elevated">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Submissões</h4>
                {getTrendIcon(trends.submissions_trend)}
              </div>
              <p className="text-3xl font-bold mb-1">
                {trends.last_7_days.submissions.toFixed(1)}
              </p>
              <p className={`text-sm ${getTrendColor(trends.submissions_trend)}`}>
                {trends.submissions_trend > 0 ? '+' : ''}
                {trends.submissions_trend.toFixed(1)}% vs semana anterior
              </p>
            </div>
          </PremiumCard>

          <PremiumCard variant="elevated">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Correções</h4>
                {getTrendIcon(trends.grading_trend)}
              </div>
              <p className="text-3xl font-bold mb-1">
                {trends.last_7_days.graded.toFixed(1)}
              </p>
              <p className={`text-sm ${getTrendColor(trends.grading_trend)}`}>
                {trends.grading_trend > 0 ? '+' : ''}
                {trends.grading_trend.toFixed(1)}% vs semana anterior
              </p>
            </div>
          </PremiumCard>

          <PremiumCard variant="elevated">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Engajamento</h4>
                {getTrendIcon(trends.engagement_trend)}
              </div>
              <p className="text-3xl font-bold mb-1">
                {trends.last_7_days.engagement.toFixed(1)}
              </p>
              <p className={`text-sm ${getTrendColor(trends.engagement_trend)}`}>
                {trends.engagement_trend > 0 ? '+' : ''}
                {trends.engagement_trend.toFixed(1)}% vs semana anterior
              </p>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <LineChart className="w-6 h-6 text-primary" />
              Atividade Diária (30 dias)
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <RechartsLine data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="activity_date"
                  tickFormatter={(date) => format(new Date(date), 'dd/MM', { locale: ptBR })}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(date) => format(new Date(date), "dd 'de' MMM", { locale: ptBR })}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="submissions_count"
                  stroke="#3b82f6"
                  name="Submissões"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="graded_count"
                  stroke="#10b981"
                  name="Corrigidas"
                  strokeWidth={2}
                />
              </RechartsLine>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        {/* Grade Distribution */}
        {gradeDistribution && (
          <PremiumCard variant="elevated">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <PieChart className="w-6 h-6 text-primary" />
                Distribuição de Notas
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={[
                      { name: 'Excelente (90-100%)', value: gradeDistribution.excellent, fill: COLORS.excellent },
                      { name: 'Bom (70-89%)', value: gradeDistribution.good, fill: COLORS.good },
                      { name: 'Regular (50-69%)', value: gradeDistribution.average, fill: COLORS.average },
                      { name: 'Abaixo (< 50%)', value: gradeDistribution.below, fill: COLORS.below },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {[
                      COLORS.excellent,
                      COLORS.good,
                      COLORS.average,
                      COLORS.below,
                    ].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </PremiumCard>
        )}
      </div>

      {/* Top Students */}
      <PremiumCard variant="elevated">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Top 10 Alunos
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 border-b-2 border-primary/20">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold">#</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">Aluno</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">Média</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">Percentual</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">Entregas</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">Participação</th>
                </tr>
              </thead>
              <tbody>
                {studentRanking.map((student, idx) => (
                  <tr key={student.student_id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                        idx === 1 ? 'bg-gray-100 text-gray-800' :
                        idx === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {student.rank_position}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {student.avatar_url ? (
                          <img src={student.avatar_url} alt={student.student_name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {student.student_name[0]}
                          </div>
                        )}
                        <span className="font-medium">{student.student_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold">
                      {student.average_grade?.toFixed(1) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        student.average_percentage >= 90 ? 'bg-green-100 text-green-800' :
                        student.average_percentage >= 70 ? 'bg-blue-100 text-blue-800' :
                        student.average_percentage >= 50 ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.average_percentage?.toFixed(0) || 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{student.total_submissions || 0}</td>
                    <td className="px-4 py-3 text-center">
                      {(student.posts_created || 0) + (student.comments_made || 0)} interações
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PremiumCard>

      {/* Activity Performance */}
      {activityPerformance.length > 0 && (
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Performance por Atividade
            </h3>

            <ResponsiveContainer width="100%" height={400}>
              <RechartsBar data={activityPerformance.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="activity_title"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  className="text-xs"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average_grade" fill="#3b82f6" name="Média" />
                <Bar dataKey="submission_rate" fill="#10b981" name="Taxa de Entrega (%)" />
              </RechartsBar>
            </ResponsiveContainer>
          </div>
        </PremiumCard>
      )}
    </div>
  );
};

export default ClassAnalyticsPage;
