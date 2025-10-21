import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { SkeletonScreen } from '@/components/ui/LoadingScreen';
import { PremiumCard, StatsCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, TrendingUp, TrendingDown, Award, Clock, CheckCircle2, XCircle, FileText, Download } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { exportToPDF, exportToExcel } from '@/utils/exportUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function StudentHistoryPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentHistory();
  }, [studentId]);

  const loadStudentHistory = async () => {
    try {
      setLoading(true);

      // Buscar dados do aluno e histórico
      const [studentResult, submissionsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .eq('id', studentId)
          .single(),
        
        supabase
          .from('submissions')
          .select(`
            *,
            activity:activities(
              id, 
              title, 
              max_score, 
              due_date
            )
          `)
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false })
      ]);

      if (studentResult.error) throw studentResult.error;
      if (submissionsResult.error) throw submissionsResult.error;

      setStudent(studentResult.data);
      setHistory(submissionsResult.data);

      // Calcular estatísticas
      const submissions = submissionsResult.data;
      const graded = submissions.filter(s => s.grade !== null);
      const avgGrade = graded.length > 0 
        ? graded.reduce((sum, s) => sum + s.grade, 0) / graded.length 
        : 0;
      const totalPoints = graded.reduce((sum, s) => sum + (s.activity?.max_score || 10), 0);
      const earnedPoints = graded.reduce((sum, s) => sum + s.grade, 0);
      const onTime = submissions.filter(s => s.activity?.due_date && new Date(s.submitted_at) <= new Date(s.activity.due_date)).length;
      const plagiarismCases = 0; // Remover plágio por enquanto

      setStats({
        totalSubmissions: submissions.length,
        graded: graded.length,
        pending: submissions.length - graded.length,
        avgGrade: avgGrade.toFixed(1),
        percentage: totalPoints > 0 ? ((earnedPoints / totalPoints) * 100).toFixed(1) : 0,
        onTimeRate: submissions.length > 0 ? ((onTime / submissions.length) * 100).toFixed(0) : 0,
        plagiarismCases
      });

    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico do aluno');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const data = history.map(item => ({
      'Atividade': item.activity?.title || 'N/A',
      'Nota': `${item.grade || '-'}/${item.activity?.max_score || 10}`,
      'Entrega': format(new Date(item.submitted_at), 'dd/MM/yyyy', { locale: ptBR }),
      'Status': item.grade !== null ? 'Avaliado' : 'Pendente'
    }));

    exportToPDF(data, `historico-${student?.name}`, [
      { header: 'Atividade', key: 'Atividade' },
      { header: 'Nota', key: 'Nota' },
      { header: 'Entrega', key: 'Entrega' },
      { header: 'Status', key: 'Status' }
    ]);
    toast.success('PDF exportado com sucesso!');
  };

  const handleExportExcel = () => {
    const data = history.map(item => ({
      Atividade: item.activity?.title || 'N/A',
      Nota: item.grade || 0,
      Pontos: item.activity?.max_score || 10,
      Porcentagem: item.grade && item.activity?.max_score ? ((item.grade / item.activity.max_score) * 100).toFixed(1) : 0,
      Entrega: format(new Date(item.submitted_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      Prazo: item.activity?.due_date ? format(new Date(item.activity.due_date), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A',
      Status: item.grade !== null ? 'Avaliado' : 'Pendente'
    }));

    exportToExcel(data, `historico-${student?.name}`, 'Histórico');
    toast.success('Excel exportado com sucesso!');
  };

  // Dados do gráfico de evolução
  const chartData = {
    labels: history.slice(0, 10).reverse().map(h => format(new Date(h.submitted_at), 'dd/MM', { locale: ptBR })),
    datasets: [{
      label: 'Notas (%)',
      data: history.slice(0, 10).reverse().map(h => {
        if (h.grade !== null && h.activity?.max_score) {
          return (h.grade / h.activity.max_score) * 100;
        }
        return null;
      }),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonScreen type="header" />
        <SkeletonScreen type="card" count={4} />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aluno não encontrado</p>
        <PremiumButton onClick={() => navigate(-1)} className="mt-4">
          Voltar
        </PremiumButton>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PremiumButton
            variant="ghost"
            leftIcon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Voltar
          </PremiumButton>
          <div>
            <h1 className="text-3xl font-bold">Histórico do Aluno</h1>
            <p className="text-muted-foreground">{student.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <PremiumButton
            variant="outline"
            leftIcon={FileText}
            onClick={handleExportPDF}
          >
            Exportar PDF
          </PremiumButton>
          <PremiumButton
            variant="outline"
            leftIcon={Download}
            onClick={handleExportExcel}
          >
            Exportar Excel
          </PremiumButton>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Média Geral"
            value={stats.avgGrade}
            change={`${stats.percentage}% do total`}
            trend={stats.avgGrade >= 7 ? 'up' : 'down'}
            icon={Award}
          />
          <StatsCard
            title="Atividades Entregues"
            value={stats.totalSubmissions.toString()}
            change={`${stats.graded} avaliadas`}
            trend="up"
            icon={FileText}
          />
          <StatsCard
            title="Entregas no Prazo"
            value={`${stats.onTimeRate}%`}
            change={`${stats.onTimeRate >= 80 ? 'Excelente' : 'Melhorar'}`}
            trend={stats.onTimeRate >= 80 ? 'up' : 'down'}
            icon={Clock}
          />
          <StatsCard
            title="Casos de Plágio"
            value={stats.plagiarismCases.toString()}
            change={stats.plagiarismCases === 0 ? 'Nenhum caso' : 'Atenção'}
            trend={stats.plagiarismCases === 0 ? 'up' : 'down'}
            icon={stats.plagiarismCases === 0 ? CheckCircle2 : XCircle}
          />
        </div>
      )}

      {/* Gráfico de Evolução */}
      <PremiumCard variant="elevated">
        <div className="p-6">
          <h3 className="font-bold text-lg mb-4">Evolução de Desempenho</h3>
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.parsed.y?.toFixed(1)}%`
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: (value) => `${value}%`
                  }
                }
              }
            }}
          />
        </div>
      </PremiumCard>

      {/* Histórico Detalhado */}
      <div className="space-y-4">
        <h3 className="font-bold text-xl">Histórico de Submissões</h3>
        {history.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <PremiumCard variant="elevated">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{item.activity?.title || 'Atividade'}</h4>
                    <p className="text-sm text-muted-foreground">{new Date(item.submitted_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {item.grade !== null ? (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {item.grade}<span className="text-lg text-muted-foreground">/{item.activity?.max_score || 10}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.activity?.max_score ? ((item.grade / item.activity.max_score) * 100).toFixed(0) : 0}%
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
                      Pendente
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Entrega:</span>
                    <span className="font-medium">
                      {format(new Date(item.submitted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  {item.activity?.due_date && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Prazo:</span>
                      <span className={`font-medium ${
                        new Date(item.submitted_at) <= new Date(item.activity.due_date)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {format(new Date(item.activity.due_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>

                {item.feedback && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Feedback do Professor:</p>
                    <p className="text-sm">{item.feedback}</p>
                  </div>
                )}
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
