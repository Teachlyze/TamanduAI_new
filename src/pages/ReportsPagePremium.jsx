import { motion } from 'framer-motion';
import {
  PremiumCard,
  StatsCard,
  PremiumButton,
  LoadingScreen,
  ProgressBar
} from '@/components/ui';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Award,
  Download,
  Calendar,
  Filter,
  FileText,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  PieChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ReportsPagePremium() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [reportData, setReportData] = useState(null);

  // Mock data
  const mockReportData = {
    overview: {
      totalStudents: 142,
      activeClasses: 5,
      completedActivities: 87,
      avgGrade: 8.3,
      studentGrowth: 12,
      activityGrowth: 8,
      gradeGrowth: 0.5,
      attendanceRate: 92
    },
    classPerformance: [
      { name: 'Matemática 9A', students: 32, avgGrade: 8.5, completion: 94, attendance: 95 },
      { name: 'Física 2B', students: 28, avgGrade: 7.8, completion: 89, attendance: 88 },
      { name: 'Química 3C', students: 30, avgGrade: 8.2, completion: 92, attendance: 93 },
      { name: 'Biologia 1A', students: 35, avgGrade: 9.0, completion: 97, attendance: 96 },
      { name: 'História 2A', students: 17, avgGrade: 7.5, completion: 85, attendance: 90 }
    ],
    activityTypes: [
      { type: 'Tarefas', count: 45, completion: 92 },
      { type: 'Provas', count: 20, completion: 95 },
      { type: 'Projetos', count: 15, completion: 88 },
      { type: 'Quiz', count: 7, completion: 98 }
    ],
    topStudents: [
      { name: 'Beatriz Costa', grade: 9.2, activities: 30, attendance: 98 },
      { name: 'Ana Silva', grade: 8.5, activities: 24, attendance: 95 },
      { name: 'Carlos Santos', grade: 7.8, activities: 20, attendance: 88 }
    ],
    needsAttention: [
      { name: 'Daniel Oliveira', grade: 6.5, activities: 15, attendance: 75, issue: 'Baixa frequência' },
      { name: 'João Silva', grade: 6.8, activities: 18, attendance: 80, issue: 'Notas abaixo da média' }
    ],
    performanceOverTime: [
      { month: 'Jan', avgGrade: 7.8, submissions: 45, attendance: 88 },
      { month: 'Fev', avgGrade: 8.0, submissions: 52, attendance: 90 },
      { month: 'Mar', avgGrade: 8.2, submissions: 48, attendance: 92 },
      { month: 'Abr', avgGrade: 8.3, submissions: 55, attendance: 91 },
      { month: 'Mai', avgGrade: 8.1, submissions: 50, attendance: 93 },
      { month: 'Jun', avgGrade: 8.4, submissions: 58, attendance: 94 }
    ],
    gradeDistribution: [
      { range: '9.0-10.0', count: 25, percentage: 18 },
      { range: '8.0-8.9', count: 45, percentage: 32 },
      { range: '7.0-7.9', count: 38, percentage: 27 },
      { range: '6.0-6.9', count: 22, percentage: 15 },
      { range: '0.0-5.9', count: 12, percentage: 8 }
    ]
  };

  useEffect(() => {
    loadReports();
  }, [timeRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setReportData(mockReportData);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportData) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    try {
      toast.loading('Gerando PDF...', { id: 'pdf' });
      
      const doc = new jsPDF();
      const { overview, classPerformance } = reportData;
      
      // Header
      doc.setFontSize(20);
      doc.text('Relatório de Desempenho', 14, 20);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
      
      // Overview Stats
      doc.setFontSize(14);
      doc.text('Visão Geral', 14, 40);
      doc.autoTable({
        startY: 45,
        head: [['Métrica', 'Valor']],
        body: [
          ['Total de Alunos', overview.totalStudents.toString()],
          ['Turmas Ativas', overview.activeClasses.toString()],
          ['Atividades Concluídas', overview.completedActivities.toString()],
          ['Nota Média Geral', overview.avgGrade.toFixed(1)],
          ['Taxa de Frequência', `${overview.attendanceRate}%`]
        ]
      });
      
      // Class Performance
      doc.text('Desempenho por Turma', 14, doc.lastAutoTable.finalY + 15);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Turma', 'Alunos', 'Média', 'Conclusão', 'Frequência']],
        body: classPerformance.map(cls => [
          cls.name,
          cls.students.toString(),
          cls.avgGrade.toFixed(1),
          `${cls.completion}%`,
          `${cls.attendance}%`
        ])
      });
      
      // Save
      doc.save(`relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.dismiss('pdf');
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.dismiss('pdf');
      toast.error('Erro ao gerar PDF: ' + error.message);
    }
  };

  const handleExportExcel = async () => {
    if (!reportData) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    try {
      toast.loading('Gerando Excel...', { id: 'excel' });
      
      // Criar workbook
      const wb = XLSX.utils.book_new();
      const { overview, classPerformance, activityTypes, topStudents } = reportData;
      
      // Sheet 1: Visão Geral
      const overviewData = [
        ['Métrica', 'Valor'],
        ['Total de Alunos', overview.totalStudents],
        ['Turmas Ativas', overview.activeClasses],
        ['Atividades Concluídas', overview.completedActivities],
        ['Nota Média Geral', overview.avgGrade.toFixed(1)],
        ['Taxa de Frequência', `${overview.attendanceRate}%`]
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Visão Geral');
      
      // Sheet 2: Desempenho por Turma
      const classData = [
        ['Turma', 'Alunos', 'Média', 'Conclusão (%)', 'Frequência (%)'],
        ...classPerformance.map(cls => [
          cls.name,
          cls.students,
          cls.avgGrade.toFixed(1),
          cls.completion,
          cls.attendance
        ])
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(classData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Turmas');
      
      // Sheet 3: Atividades por Tipo
      const activityData = [
        ['Tipo', 'Quantidade', 'Taxa de Conclusão (%)'],
        ...activityTypes.map(act => [
          act.type,
          act.count,
          act.completion
        ])
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(activityData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Atividades');
      
      // Sheet 4: Top Alunos
      const topStudentsData = [
        ['Posição', 'Nome', 'Média', 'Atividades', 'Frequência (%)'],
        ...topStudents.map((student, idx) => [
          idx + 1,
          student.name,
          student.grade.toFixed(1),
          student.activities,
          student.attendance
        ])
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(topStudentsData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Melhores Alunos');
      
      // Save
      XLSX.writeFile(wb, `relatorio-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.dismiss('excel');
      toast.success('Excel gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      toast.dismiss('excel');
      toast.error('Erro ao gerar Excel');
    }
  };

  if (loading) {
    return <LoadingScreen message="Gerando relatórios..." />;
  }

  const { overview, classPerformance, activityTypes, topStudents, needsAttention, performanceOverTime, gradeDistribution } = reportData;

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Relatórios
              </h1>
              <p className="text-white/90">Análise detalhada do desempenho</p>
            </div>
            <div className="flex gap-2">
              <PremiumButton
                variant="outline"
                size="sm"
                leftIcon={Download}
                onClick={handleExportPDF}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                PDF
              </PremiumButton>
              <PremiumButton
                variant="outline"
                size="sm"
                leftIcon={Download}
                onClick={handleExportExcel}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Excel
              </PremiumButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stagger-children grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Alunos"
          value={overview.totalStudents.toString()}
          change={`+${overview.studentGrowth}%`}
          trend="up"
          icon={Users}
        />
        <StatsCard
          title="Turmas Ativas"
          value={overview.activeClasses.toString()}
          icon={BookOpen}
        />
        <StatsCard
          title="Atividades Concluídas"
          value={overview.completedActivities.toString()}
          change={`+${overview.activityGrowth}%`}
          trend="up"
          icon={FileText}
        />
        <StatsCard
          title="Nota Média Geral"
          value={overview.avgGrade.toFixed(1)}
          change={`+${overview.gradeGrowth}`}
          trend="up"
          icon={Award}
        />
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm font-medium">Período:</span>
        <div className="flex gap-2">
          {[
            { label: 'Semana', value: 'week' },
            { label: 'Mês', value: 'month' },
            { label: 'Ano', value: 'year' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PremiumCard variant="elevated" className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Evolução do Desempenho
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="avgGrade" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Nota Média"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Frequência (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Grade Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PremiumCard variant="elevated" className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Distribuição de Notas
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, percentage }) => `${range}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* Activity Types Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PremiumCard variant="elevated" className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Atividades por Tipo
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Quantidade" />
                <Bar dataKey="completion" fill="#10b981" name="Taxa de Conclusão (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Performance */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Desempenho por Turma
            </h3>
            <div className="space-y-4">
              {classPerformance.map((cls, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-sm text-muted-foreground">{cls.students} alunos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{cls.avgGrade.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">nota média</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Conclusão</span>
                        <span>{cls.completion}%</span>
                      </div>
                      <ProgressBar value={cls.completion} variant="success" size="sm" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Frequência</span>
                        <span>{cls.attendance}%</span>
                      </div>
                      <ProgressBar value={cls.attendance} variant="primary" size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PremiumCard>

        {/* Activity Types */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Atividades por Tipo
            </h3>
            <div className="space-y-4">
              {activityTypes.map((activity, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{activity.type}</span>
                    <span className="text-sm text-muted-foreground">{activity.count} atividades</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Taxa de conclusão</span>
                      <span>{activity.completion}%</span>
                    </div>
                    <ProgressBar value={activity.completion} variant="success" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PremiumCard>

        {/* Top Students */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Melhores Alunos
            </h3>
            <div className="space-y-3">
              {topStudents.map((student, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>Nota: {student.grade.toFixed(1)}</span>
                      <span>•</span>
                      <span>{student.activities} atividades</span>
                      <span>•</span>
                      <span>{student.attendance}% frequência</span>
                    </div>
                  </div>
                  {index === 0 && <TrendingUp className="w-5 h-5 text-success" />}
                </div>
              ))}
            </div>
          </div>
        </PremiumCard>

        {/* Needs Attention */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              Necessita Atenção
            </h3>
            <div className="space-y-3">
              {needsAttention.map((student, index) => (
                <div key={index} className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{student.name}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                      {student.issue}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Nota: {student.grade.toFixed(1)}</span>
                    <span>•</span>
                    <span>{student.activities} atividades</span>
                    <span>•</span>
                    <span>{student.attendance}% frequência</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Overall Stats */}
      <PremiumCard variant="elevated">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">Estatísticas Gerais</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Taxa de Frequência</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{overview.attendanceRate}%</span>
                <span className="text-sm text-success flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +3%
                </span>
              </div>
              <ProgressBar value={overview.attendanceRate} variant="success" className="mt-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Taxa de Aprovação</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">95%</span>
                <span className="text-sm text-success flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +2%
                </span>
              </div>
              <ProgressBar value={95} variant="primary" className="mt-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Engajamento</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">88%</span>
                <span className="text-sm text-warning flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  -1%
                </span>
              </div>
              <ProgressBar value={88} variant="warning" className="mt-2" />
            </div>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}
