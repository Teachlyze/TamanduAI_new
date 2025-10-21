import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, Target, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { PremiumCard, StatsCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { supabase } from '@/lib/supabaseClient';
import { Line, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';

export default function PerformanceComparison({ classId }) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classAverage, setClassAverage] = useState(0);
  const [topPerformers, setTopPerformers] = useState([]);
  const [needsAttention, setNeedsAttention] = useState([]);

  useEffect(() => {
    if (classId) {
      loadComparison();
    }
  }, [classId]);

  const loadComparison = async () => {
    try {
      setLoading(true);

      // Buscar alunos da turma com suas submissões
      const { data: classStudents, error: studentsError } = await supabase
        .from('class_members')
        .select(`
          user_id,
          profiles:user_id (
            id,
            name,
            email
          )
        `)
        .eq('class_id', classId);

      if (studentsError) throw studentsError;

      // Para cada aluno, buscar suas submissões
      const studentsWithGrades = await Promise.all(
        classStudents.map(async (cs) => {
          const { data: submissions } = await supabase
            .from('submissions')
            .select(`
              grade,
              activities (points),
              submitted_at,
              activity_id
            `)
            .eq('student_id', cs.student_id)
            .not('grade', 'is', null);

          const totalPoints = submissions?.reduce((sum, s) => sum + (s.activities?.points || 0), 0) || 0;
          const earnedPoints = submissions?.reduce((sum, s) => sum + (s.grade || 0), 0) || 0;
          const avgGrade = totalPoints > 0 ? ((earnedPoints / totalPoints) * 100) : 0;
          
          const submissionCount = submissions?.length || 0;
          const onTime = submissions?.filter(s => 
            new Date(s.submitted_at) <= new Date(s.activities?.due_date)
          ).length || 0;
          const onTimeRate = submissionCount > 0 ? ((onTime / submissionCount) * 100) : 0;

          return {
            id: cs.student_id,
            name: cs.students?.name || 'Aluno',
            email: cs.students?.email,
            avgGrade: avgGrade.toFixed(1),
            submissionCount,
            onTimeRate: onTimeRate.toFixed(1),
            earnedPoints,
            totalPoints
          };
        })
      );

      // Calcular média da turma
      const classAvg = studentsWithGrades.length > 0
        ? studentsWithGrades.reduce((sum, s) => sum + parseFloat(s.avgGrade), 0) / studentsWithGrades.length
        : 0;

      // Ordenar alunos por desempenho
      const sorted = [...studentsWithGrades].sort((a, b) => b.avgGrade - a.avgGrade);

      // Top 5 performers
      const top = sorted.slice(0, 5);

      // Alunos que precisam de atenção (abaixo da média ou < 60%)
      const attention = sorted.filter(s => parseFloat(s.avgGrade) < classAvg || parseFloat(s.avgGrade) < 60);

      setStudents(sorted);
      setClassAverage(classAvg);
      setTopPerformers(top);
      setNeedsAttention(attention);

    } catch (error) {
      console.error('Erro ao carregar comparação:', error);
      toast.error('Erro ao carregar comparação de desempenho');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: students.map(s => s.name),
    datasets: [
      {
        label: 'Desempenho do Aluno',
        data: students.map(s => parseFloat(s.avgGrade)),
        backgroundColor: students.map(s => 
          parseFloat(s.avgGrade) >= classAverage 
            ? 'rgba(34, 197, 94, 0.8)' 
            : 'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: students.map(s => 
          parseFloat(s.avgGrade) >= classAverage 
            ? 'rgba(34, 197, 94, 1)' 
            : 'rgba(239, 68, 68, 1)'
        ),
        borderWidth: 2
      },
      {
        label: 'Média da Turma',
        data: students.map(() => classAverage),
        type: 'line',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0
      }
    ]
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-32 rounded-xl" />
        <div className="skeleton h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Média da Turma"
          value={`${classAverage.toFixed(1)}%`}
          change={`${students.length} alunos`}
          trend={classAverage >= 70 ? 'up' : 'down'}
          icon={Award}
        />
        <StatsCard
          title="Top Performer"
          value={topPerformers[0]?.avgGrade + '%'}
          change={topPerformers[0]?.name}
          trend="up"
          icon={TrendingUp}
        />
        <StatsCard
          title="Acima da Média"
          value={students.filter(s => parseFloat(s.avgGrade) >= classAverage).length.toString()}
          change={`${((students.filter(s => parseFloat(s.avgGrade) >= classAverage).length / students.length) * 100).toFixed(0)}%`}
          trend="up"
          icon={Target}
        />
        <StatsCard
          title="Precisam Atenção"
          value={needsAttention.length.toString()}
          change="Abaixo da média"
          trend="down"
          icon={Users}
        />
      </div>

      {/* Main chart */}
      <PremiumCard variant="elevated">
        <div className="p-6">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Comparativo de Desempenho
          </h3>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, position: 'top' },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      if (context.datasetIndex === 0) {
                        const student = students[context.dataIndex];
                        return [
                          `Desempenho: ${context.parsed.y.toFixed(1)}%`,
                          `Entregas: ${student.submissionCount}`,
                          `No prazo: ${student.onTimeRate}%`
                        ];
                      }
                      return `Média da turma: ${context.parsed.y.toFixed(1)}%`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: (value) => value + '%'
                  }
                }
              }
            }}
            height={400}
          />
        </div>
      </PremiumCard>

      {/* Top performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
              <ArrowUp className="w-5 h-5" />
              Top 5 Alunos
            </h3>
            <div className="space-y-3">
              {topPerformers.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.submissionCount} entregas • {student.onTimeRate}% no prazo
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {student.avgGrade}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {student.earnedPoints}/{student.totalPoints} pts
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </PremiumCard>

        {/* Needs attention */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <ArrowDown className="w-5 h-5" />
              Precisam de Atenção
            </h3>
            <div className="space-y-3">
              {needsAttention.slice(0, 5).map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                >
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.submissionCount} entregas • {student.onTimeRate}% no prazo
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {student.avgGrade}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(classAverage - parseFloat(student.avgGrade)).toFixed(1)} abaixo
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </PremiumCard>
      </div>
    </motion.div>
  );
}
