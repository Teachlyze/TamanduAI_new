import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  BookOpen,
  Award,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { PremiumCard, StatsCard } from '@/components/ui/PremiumCard';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import PerformanceComparison from '@/pages/PerformanceComparison';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const AnalyticsDashboard = ({ professorId }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, all
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [professorId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const dateFilter = getDateFilter(timeRange);

      // Primeiro buscar classes do professor
      const { data: teacherClasses, error: classError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('created_by', professorId);

      if (classError) throw classError;

      const classIds = teacherClasses?.map(c => c.id) || [];

      // Salvar classes para seleção
      setClasses(teacherClasses || []);

      const [
        classesResult,
        activitiesResult,
        submissionsResult,
        studentsResult,
        plagiarismResult
      ] = await Promise.all([
        // Classes completas
        supabase
          .from('classes')
          .select('*')
          .eq('created_by', professorId),
        
        // Atividades
        supabase
          .from('activities')
          .select('*')
          .eq('created_by', professorId)
          .gte('created_at', dateFilter),
        
        // Submissões (buscar todas, filtrar depois)
        supabase
          .from('submissions')
          .select('*')
          .gte('submitted_at', dateFilter)
          .order('submitted_at', { ascending: false }),
        
        // Alunos únicos via class_members
        classIds.length > 0 ? supabase
          .from('class_members')
          .select('user_id')
          .in('class_id', classIds)
          .eq('role', 'student') : { data: [], error: null },
        
        // Plágio (buscar todos, filtrar depois)
        supabase
          .from('plagiarism_checks')
          .select('*')
          .gte('checked_at', dateFilter)
      ]);

      if (classesResult.error) throw classesResult.error;
      if (activitiesResult.error) throw activitiesResult.error;
      if (submissionsResult.error) throw submissionsResult.error;
      if (studentsResult.error) throw studentsResult.error;
      // plagiarismResult pode falhar se tabela não existir

      // Processar dados
      const classes = classesResult.data || [];
      const activities = activitiesResult.data || [];
      
      // Filtrar submissões que pertencem às atividades do professor
      const activityIds = activities.map(a => a.id);
      const submissions = submissionsResult.data?.filter(s => 
        activityIds.includes(s.activity_id)
      ) || [];
      
      const uniqueStudents = new Set(studentsResult.data?.map(s => s.user_id) || []);
      
      // Filtrar plagiarism checks que pertencem às submissões relevantes
      const submissionIds = submissions.map(s => s.id);
      const plagiarismChecks = plagiarismResult.data?.filter(p => 
        submissionIds.includes(p.submission_id)
      ) || [];

      // Calcular métricas
      const totalStudents = uniqueStudents.size;
      const totalActivities = activities.length;
      const totalSubmissions = submissions.length;
      const avgSubmissionsPerActivity = totalActivities > 0 
        ? (totalSubmissions / totalActivities).toFixed(1) 
        : 0;

      // Média de notas
      const gradedSubmissions = submissions.filter(s => s.grade !== null);
      const avgGrade = gradedSubmissions.length > 0
        ? (gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length).toFixed(1)
        : 0;

      // Taxa de entrega
      const submissionRate = totalActivities > 0 && totalStudents > 0
        ? ((totalSubmissions / (totalActivities * totalStudents)) * 100).toFixed(1)
        : 0;

      // Plágio
      const avgPlagiarism = plagiarismChecks.length > 0
        ? (plagiarismChecks.reduce((sum, p) => sum + p.plagiarism_percentage, 0) / plagiarismChecks.length).toFixed(1)
        : 0;
      const highPlagiarismCount = plagiarismChecks.filter(p => p.plagiarism_percentage >= 50).length;

      // Dados dos gráficos
      const performanceData = generatePerformanceData(submissions);
      const activityData = generateActivityData(activities);
      const plagiarismData = generatePlagiarismData(plagiarismChecks);
      const classDistribution = generateClassDistribution(classes);

      setAnalytics({
        summary: {
          totalClasses: classes.length,
          totalStudents,
          totalActivities,
          totalSubmissions,
          avgSubmissionsPerActivity,
          avgGrade,
          submissionRate,
          avgPlagiarism,
          highPlagiarismCount
        },
        charts: {
          performance: performanceData,
          activity: activityData,
          plagiarism: plagiarismData,
          classDistribution
        }
      });

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const getDateFilter = (range) => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case '30d':
        return new Date(now.setDate(now.getDate() - 30)).toISOString();
      case '90d':
        return new Date(now.setDate(now.getDate() - 90)).toISOString();
      default:
        return new Date('2000-01-01').toISOString();
    }
  };

  if (loading || !analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Time range selector & Comparison Toggle */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          <select
            value={selectedClass || ''}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 rounded-lg border-2 border-border bg-background text-foreground font-medium hover:border-primary transition-colors"
          >
            <option value="">Todas as turmas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border-2 ${
              showComparison
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:border-primary'
            }`}
          >
            {showComparison ? 'Ocultar' : 'Comparar'} Desempenho
          </button>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {range === 'all' ? 'Tudo' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Alunos"
          value={analytics.summary.totalStudents.toString()}
          change={`${analytics.summary.totalClasses} turmas`}
          trend="up"
          icon={Users}
        />
        <StatsCard
          title="Atividades Criadas"
          value={analytics.summary.totalActivities.toString()}
          change={`${analytics.summary.avgSubmissionsPerActivity} entregas/atividade`}
          trend="up"
          icon={BookOpen}
        />
        <StatsCard
          title="Média Geral"
          value={analytics.summary.avgGrade}
          change={`${analytics.summary.submissionRate}% taxa de entrega`}
          trend={analytics.summary.avgGrade >= 7 ? 'up' : 'down'}
          icon={Award}
        />
        <StatsCard
          title="Plágio Médio"
          value={`${analytics.summary.avgPlagiarism}%`}
          change={`${analytics.summary.highPlagiarismCount} casos graves`}
          trend={analytics.summary.avgPlagiarism < 30 ? 'up' : 'down'}
          icon={Target}
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance over time */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Evolução de Performance
            </h3>
            <Line
              data={analytics.charts.performance}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    mode: 'index',
                    intersect: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </div>
        </PremiumCard>

        {/* Activity types */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Atividades por Tipo
            </h3>
            <Bar
              data={analytics.charts.activity}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                  }
                }
              }}
            />
          </div>
        </PremiumCard>

        {/* Plagiarism distribution */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Distribuição de Plágio
            </h3>
            <Doughnut
              data={analytics.charts.plagiarism}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }}
            />
          </div>
        </PremiumCard>

        {/* Class distribution */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Distribuição por Turma
            </h3>
            <Bar
              data={analytics.charts.classDistribution}
              options={{
                indexAxis: 'y',
                responsive: true,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                  }
                }
              }}
            />
          </div>
        </PremiumCard>
      </div>

      {/* Performance Comparison Section */}
      {showComparison && selectedClass && (
        <div className="mt-6">
          <PerformanceComparison classId={selectedClass} />
        </div>
      )}
    </motion.div>
  );
};

// Helper functions para gerar dados dos gráficos
function generatePerformanceData(submissions) {
  // Agrupar por data
  const grouped = submissions.reduce((acc, sub) => {
    if (sub.grade === null) return acc;
    
    const date = new Date(sub.submitted_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(sub.grade);
    return acc;
  }, {});

  const labels = Object.keys(grouped).slice(-10); // Últimos 10 dias
  const data = labels.map(date => {
    const grades = grouped[date];
    return grades.reduce((sum, g) => sum + g, 0) / grades.length;
  });

  return {
    labels,
    datasets: [{
      label: 'Média de Notas',
      data,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };
}

function generateActivityData(activities) {
  const types = activities.reduce((acc, act) => {
    const type = act.type || 'Outros';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return {
    labels: Object.keys(types),
    datasets: [{
      data: Object.values(types),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)'
      ]
    }]
  };
}

function generatePlagiarismData(checks) {
  const ranges = {
    '0-20%': 0,
    '21-40%': 0,
    '41-60%': 0,
    '61-80%': 0,
    '81-100%': 0
  };

  checks.forEach(check => {
    const p = check.plagiarism_percentage;
    if (p <= 20) ranges['0-20%']++;
    else if (p <= 40) ranges['21-40%']++;
    else if (p <= 60) ranges['41-60%']++;
    else if (p <= 80) ranges['61-80%']++;
    else ranges['81-100%']++;
  });

  return {
    labels: Object.keys(ranges),
    datasets: [{
      data: Object.values(ranges),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(220, 38, 38, 0.8)'
      ]
    }]
  };
}

function generateClassDistribution(classes) {
  const labels = classes.map(c => c.name).slice(0, 5); // Top 5
  const data = classes.map(c => c.class_members?.[0]?.count || 0).slice(0, 5);

  return {
    labels,
    datasets: [{
      label: 'Alunos',
      data,
      backgroundColor: 'rgba(59, 130, 246, 0.8)'
    }]
  };
}

export default AnalyticsDashboard;
