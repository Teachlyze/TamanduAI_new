import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Target,
  Calendar,
  BookOpen,
  Star,
  LineChart,
  PieChart,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard, StatsCard } from '@/components/ui/PremiumCard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

const StudentPerformancePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGrades: 0,
    averageGrade: 0,
    bestGrade: 0,
    worstGrade: 0,
    improvementRate: 0
  });
  const [gradesBySubject, setGradesBySubject] = useState([]);
  const [gradeHistory, setGradeHistory] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);

  useEffect(() => {
    if (user) {
      loadPerformanceData();
    }
  }, [user]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);

      // Buscar todas as submissões com notas
      const { data: submissions, error } = await supabase
        .from('submissions')
        .select(`
          *,
          activities(
            id,
            title,
            max_score,
            activity_class_assignments(
              class_id,
              classes(name, subject)
            )
          )
        `)
        .eq('student_id', user.id)
        .not('grade', 'is', null)
        .order('graded_at', { ascending: true });

      if (error) throw error;

      if (submissions && submissions.length > 0) {
        // Calcular estatísticas
        const grades = submissions.map(s => s.grade);
        const avgGrade = grades.reduce((sum, g) => sum + g, 0) / grades.length;
        const bestGrade = Math.max(...grades);
        const worstGrade = Math.min(...grades);

        // Calcular taxa de melhoria (comparar primeira metade vs segunda metade)
        const mid = Math.floor(grades.length / 2);
        const firstHalf = grades.slice(0, mid);
        const secondHalf = grades.slice(mid);
        const avgFirstHalf = firstHalf.reduce((sum, g) => sum + g, 0) / firstHalf.length;
        const avgSecondHalf = secondHalf.reduce((sum, g) => sum + g, 0) / secondHalf.length;
        const improvementRate = ((avgSecondHalf - avgFirstHalf) / avgFirstHalf) * 100;

        setStats({
          totalGrades: submissions.length,
          averageGrade: avgGrade,
          bestGrade,
          worstGrade,
          improvementRate: isNaN(improvementRate) ? 0 : improvementRate
        });

        // Agrupar por disciplina
        const bySubject = {};
        submissions.forEach(sub => {
          const subject = sub.activity?.class?.subject || 'Outros';
          if (!bySubject[subject]) {
            bySubject[subject] = { grades: [], subject };
          }
          bySubject[subject].grades.push(sub.grade);
        });

        const subjectStats = Object.values(bySubject).map(s => ({
          subject: s.subject,
          average: s.grades.reduce((sum, g) => sum + g, 0) / s.grades.length,
          count: s.grades.length,
          best: Math.max(...s.grades),
          worst: Math.min(...s.grades)
        })).sort((a, b) => b.average - a.average);

        setGradesBySubject(subjectStats);
        setGradeHistory(submissions.slice(-10));
        setRecentSubmissions(submissions.slice(-5).reverse());
      }

    } catch (error) {
      console.error('Erro ao carregar desempenho:', error);
      toast.error('Erro ao carregar seus dados');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 9) return 'from-green-500 to-emerald-500';
    if (grade >= 7) return 'from-blue-500 to-cyan-500';
    if (grade >= 5) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getGradeTextColor = (grade) => {
    if (grade >= 7) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (grade >= 5) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  if (loading) {
    return <LoadingScreen message="Analisando seu desempenho..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Analytics de Performance</span>
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">Meu Desempenho 📊</h1>
          <p className="text-white/90 text-lg">Acompanhe sua evolução e identifique oportunidades</p>
        </div>

        {/* Floating Charts */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-20 right-32 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl"
        >
          📈
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Média Geral",
            value: stats.averageGrade.toFixed(1),
            icon: Award,
            gradient: stats.averageGrade >= 7 ? 'from-green-500 to-emerald-500' : 'from-yellow-500 to-orange-500',
            subtitle: `${stats.totalGrades} avaliações`
          },
          {
            title: "Melhor Nota",
            value: stats.bestGrade.toFixed(1),
            icon: Star,
            gradient: 'from-yellow-500 to-orange-500',
            subtitle: 'Parabéns! 🎉'
          },
          {
            title: "Taxa de Melhoria",
            value: `${stats.improvementRate > 0 ? '+' : ''}${stats.improvementRate.toFixed(1)}%`,
            icon: TrendingUp,
            gradient: stats.improvementRate >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500',
            subtitle: stats.improvementRate >= 0 ? 'Evoluindo! 📈' : 'Precisa atenção'
          },
          {
            title: "Disciplinas",
            value: gradesBySubject.length,
            icon: BookOpen,
            gradient: 'from-purple-500 to-indigo-500',
            subtitle: 'Diferentes matérias'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremiumCard variant="elevated" className="relative overflow-hidden group hover:scale-105 transition-transform">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground mb-2">{stat.title}</div>
                <div className="text-xs font-medium text-primary">{stat.subtitle}</div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* Performance por Disciplina */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <PremiumCard variant="elevated" className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Desempenho por Disciplina</h3>
                <p className="text-sm text-muted-foreground">Compare suas médias em cada matéria</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                <PieChart className="w-5 h-5" />
              </div>
            </div>

            {gradesBySubject.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="Nenhum dado ainda"
                description="Suas estatísticas aparecerão aqui após as primeiras avaliações"
              />
            ) : (
              <div className="space-y-4">
                {gradesBySubject.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getGradeColor(item.average)}`} />
                        <span className="font-medium">{item.subject}</span>
                        <span className="text-xs text-muted-foreground">({item.count} avaliações)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getGradeTextColor(item.average)}`}>
                          {item.average.toFixed(1)}
                        </span>
                        {item.average >= 7 && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.average / 10) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1, type: "spring" }}
                        className={`h-full rounded-full bg-gradient-to-r ${getGradeColor(item.average)}`}
                      />
                    </div>

                    {/* Min/Max */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Menor: {item.worst.toFixed(1)}</span>
                      <span>{((item.average / 10) * 100).toFixed(0)}%</span>
                      <span>Maior: {item.best.toFixed(1)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </PremiumCard>
      </motion.div>

      {/* Evolução das Notas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <PremiumCard variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Últimas Avaliações</h3>
              <p className="text-sm text-muted-foreground">Histórico recente de notas</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <LineChart className="w-5 h-5" />
            </div>
          </div>

          {recentSubmissions.length === 0 ? (
            <EmptyState
              icon={Award}
              title="Nenhuma avaliação ainda"
              description="Suas notas aparecerão aqui"
            />
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border-2 border-border rounded-xl hover:border-primary/50 hover:bg-gradient-to-r hover:from-muted/50 hover:to-transparent transition-all"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{submission.activity?.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>📚 {submission.activity?.class?.name}</span>
                      <span>•</span>
                      <span>📅 {new Date(submission.graded_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getGradeColor(submission.grade)} flex items-center justify-center text-white shadow-lg`}
                  >
                    <div className="text-center">
                      <p className="text-3xl font-bold">{submission.grade}</p>
                      <p className="text-xs opacity-90">/{submission.activity?.max_score || 10}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </PremiumCard>
      </motion.div>
    </div>
  );
};

export default StudentPerformancePage;
