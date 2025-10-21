import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [compareType, setCompareType] = useState('student-student'); // student-student, student-class, class-class
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedItem1, setSelectedItem1] = useState('');
  const [selectedItem2, setSelectedItem2] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [overallStats, setOverallStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalActivities: 0,
    avgCompletion: 0
  });

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedItem1 && selectedItem2 && selectedItem1 !== selectedItem2) {
      loadComparisonData();
    }
  }, [selectedItem1, selectedItem2, compareType]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name, subject')
        .eq('created_by', user.id)
        .eq('is_active', true)
        .order('name');

      if (classesError) throw classesError;
      setClasses(classesData || []);

      const classIds = classesData.map(c => c.id);

      // Load students
      const { data: membersData, error: membersError } = await supabase
        .from('class_members')
        .select('user_id, class_id, profiles:user_id(id, full_name, avatar_url)')
        .in('class_id', classIds)
        .eq('role', 'student');

      if (membersError) throw membersError;

      const uniqueStudents = Array.from(
        new Map(membersData.map(m => [m.user_id, m.profiles])).values()
      );
      setStudents(uniqueStudents.filter(Boolean));

      // Load overall stats
      const totalStudents = uniqueStudents.length;
      const totalClasses = classesData.length;

      const { count: totalActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      // Buscar submissões das atividades do professor
      const { data: teacherActivities } = await supabase
        .from('activities')
        .select('id')
        .eq('created_by', user.id);
      
      const activityIds = (teacherActivities || []).map(a => a.id);
      let submissions = [];
      if (activityIds.length > 0) {
        const { data: subs } = await supabase
          .from('submissions')
          .select('status')
          .in('activity_id', activityIds);
        submissions = subs || [];
      }

      const completedSubmissions = submissions?.filter(s => s.status === 'graded' || s.status === 'submitted').length || 0;
      const avgCompletion = submissions?.length > 0 ? (completedSubmissions / submissions.length) * 100 : 0;

      setOverallStats({
        totalStudents,
        totalClasses,
        totalActivities: totalActivities || 0,
        avgCompletion: avgCompletion.toFixed(1)
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadComparisonData = async () => {
    try {
      if (compareType === 'student-student') {
        await compareStudents(selectedItem1, selectedItem2);
      } else if (compareType === 'student-class') {
        await compareStudentWithClass(selectedItem1, selectedItem2);
      } else if (compareType === 'class-class') {
        await compareClasses(selectedItem1, selectedItem2);
      }
    } catch (error) {
      console.error('Erro ao comparar:', error);
      toast.error('Erro ao carregar comparação');
    }
  };

  const compareStudents = async (student1Id, student2Id) => {
    // Get submissions for both students
    const { data: subs1 } = await supabase
      .from('submissions')
      .select('score, activity_id, submitted_at, status')
      .eq('student_id', student1Id);

    const { data: subs2 } = await supabase
      .from('submissions')
      .select('score, activity_id, submitted_at, status')
      .eq('student_id', student2Id);

    const student1 = students.find(s => s.id === student1Id);
    const student2 = students.find(s => s.id === student2Id);

    const gradedSubs1 = subs1?.filter(s => s.score !== null) || [];
    const gradedSubs2 = subs2?.filter(s => s.score !== null) || [];

    const avg1 = gradedSubs1.length > 0 ? gradedSubs1.reduce((sum, s) => sum + s.score, 0) / gradedSubs1.length : 0;
    const avg2 = gradedSubs2.length > 0 ? gradedSubs2.reduce((sum, s) => sum + s.score, 0) / gradedSubs2.length : 0;

    const completion1 = subs1?.length || 0;
    const completion2 = subs2?.length || 0;

    setComparisonData({
      type: 'student-student',
      item1: { name: student1?.name || 'Aluno 1', avg: avg1.toFixed(1), activities: completion1 },
      item2: { name: student2?.name || 'Aluno 2', avg: avg2.toFixed(1), activities: completion2 },
      chartData: {
        labels: ['Média de Notas', 'Atividades Concluídas'],
        datasets: [
          {
            label: student1?.name || 'Aluno 1',
            data: [avg1, completion1],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2
          },
          {
            label: student2?.name || 'Aluno 2',
            data: [avg2, completion2],
            backgroundColor: 'rgba(249, 115, 22, 0.8)',
            borderColor: 'rgb(249, 115, 22)',
            borderWidth: 2
          }
        ]
      }
    });
  };

  const compareStudentWithClass = async (studentId, classId) => {
    // Get student data
    const { data: studentSubs } = await supabase
      .from('submissions')
      .select('score, activity_id')
      .eq('student_id', studentId);

    const gradedStudentSubs = studentSubs?.filter(s => s.score !== null) || [];
    const studentAvg = gradedStudentSubs.length > 0
      ? gradedStudentSubs.reduce((sum, s) => sum + s.score, 0) / gradedStudentSubs.length
      : 0;

    // Get class data
    const { data: classMembers } = await supabase
      .from('class_members')
      .select('user_id')
      .eq('class_id', classId)
      .eq('role', 'student');

    const studentIds = classMembers?.map(m => m.user_id) || [];

    const { data: classSubs } = await supabase
      .from('submissions')
      .select('score, student_id')
      .in('student_id', studentIds);

    const gradedClassSubs = classSubs?.filter(s => s.score !== null) || [];
    const classAvg = gradedClassSubs.length > 0
      ? gradedClassSubs.reduce((sum, s) => sum + s.score, 0) / gradedClassSubs.length
      : 0;

    const student = students.find(s => s.id === studentId);
    const classInfo = classes.find(c => c.id === classId);

    setComparisonData({
      type: 'student-class',
      item1: { name: student?.name || 'Aluno', avg: studentAvg.toFixed(1), activities: studentSubs?.length || 0 },
      item2: { name: classInfo?.name || 'Turma', avg: classAvg.toFixed(1), students: studentIds.length },
      chartData: {
        labels: ['Média de Notas'],
        datasets: [
          {
            label: student?.name || 'Aluno',
            data: [studentAvg],
            backgroundColor: 'rgba(147, 51, 234, 0.8)',
            borderColor: 'rgb(147, 51, 234)',
            borderWidth: 2
          },
          {
            label: `Média da ${classInfo?.name || 'Turma'}`,
            data: [classAvg],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 2
          }
        ]
      }
    });
  };

  const compareClasses = async (class1Id, class2Id) => {
    // Get class 1 data
    const { data: members1 } = await supabase
      .from('class_members')
      .select('user_id')
      .eq('class_id', class1Id)
      .eq('role', 'student');

    const studentIds1 = members1?.map(m => m.user_id) || [];

    const { data: subs1 } = await supabase
      .from('submissions')
      .select('score')
      .in('student_id', studentIds1);

    const gradedSubs1 = subs1?.filter(s => s.score !== null) || [];
    const avg1 = gradedSubs1.length > 0
      ? gradedSubs1.reduce((sum, s) => sum + s.score, 0) / gradedSubs1.length
      : 0;

    // Get class 2 data
    const { data: members2 } = await supabase
      .from('class_members')
      .select('user_id')
      .eq('class_id', class2Id)
      .eq('role', 'student');

    const studentIds2 = members2?.map(m => m.user_id) || [];

    const { data: subs2 } = await supabase
      .from('submissions')
      .select('score')
      .in('student_id', studentIds2);

    const gradedSubs2 = subs2?.filter(s => s.score !== null) || [];
    const avg2 = gradedSubs2.length > 0
      ? gradedSubs2.reduce((sum, s) => sum + s.score, 0) / gradedSubs2.length
      : 0;

    const class1 = classes.find(c => c.id === class1Id);
    const class2 = classes.find(c => c.id === class2Id);

    setComparisonData({
      type: 'class-class',
      item1: { name: class1?.name || 'Turma 1', avg: avg1.toFixed(1), students: studentIds1.length },
      item2: { name: class2?.name || 'Turma 2', avg: avg2.toFixed(1), students: studentIds2.length },
      chartData: {
        labels: ['Média de Notas', 'Número de Alunos'],
        datasets: [
          {
            label: class1?.name || 'Turma 1',
            data: [avg1, studentIds1.length],
            backgroundColor: 'rgba(168, 85, 247, 0.8)',
            borderColor: 'rgb(168, 85, 247)',
            borderWidth: 2
          },
          {
            label: class2?.name || 'Turma 2',
            data: [avg2, studentIds2.length],
            backgroundColor: 'rgba(236, 72, 153, 0.8)',
            borderColor: 'rgb(236, 72, 153)',
            borderWidth: 2
          }
        ]
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            Analytics
          </h1>
          <p className="text-white/90">Análise comparativa de desempenho</p>
        </div>
      </motion.div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alunos</p>
                <p className="text-2xl font-bold">{overallStats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Turmas</p>
                <p className="text-2xl font-bold">{overallStats.totalClasses}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atividades</p>
                <p className="text-2xl font-bold">{overallStats.totalActivities}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conclusão Média</p>
                <p className="text-2xl font-bold">{overallStats.avgCompletion}%</p>
              </div>
              <Award className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Desempenho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comparison Type Selector */}
          <Tabs value={compareType} onValueChange={setCompareType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="student-student">Aluno vs Aluno</TabsTrigger>
              <TabsTrigger value="student-class">Aluno vs Turma</TabsTrigger>
              <TabsTrigger value="class-class">Turma vs Turma</TabsTrigger>
            </TabsList>

            {/* Student vs Student */}
            <TabsContent value="student-student" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Primeiro Aluno</label>
                  <select
                    value={selectedItem1}
                    onChange={(e) => setSelectedItem1(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione um aluno</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Segundo Aluno</label>
                  <select
                    value={selectedItem2}
                    onChange={(e) => setSelectedItem2(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione um aluno</option>
                    {students.filter(s => s.id !== selectedItem1).map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </TabsContent>

            {/* Student vs Class */}
            <TabsContent value="student-class" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Aluno</label>
                  <select
                    value={selectedItem1}
                    onChange={(e) => setSelectedItem1(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione um aluno</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Turma</label>
                  <select
                    value={selectedItem2}
                    onChange={(e) => setSelectedItem2(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione uma turma</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </TabsContent>

            {/* Class vs Class */}
            <TabsContent value="class-class" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Primeira Turma</label>
                  <select
                    value={selectedItem1}
                    onChange={(e) => setSelectedItem1(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione uma turma</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Segunda Turma</label>
                  <select
                    value={selectedItem2}
                    onChange={(e) => setSelectedItem2(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione uma turma</option>
                    {classes.filter(c => c.id !== selectedItem1).map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Comparison Results */}
          {comparisonData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-blue-200">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-4">{comparisonData.item1.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Média:</span>
                        <span className="font-bold text-blue-600">{comparisonData.item1.avg}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {comparisonData.type === 'class-class' ? 'Alunos:' : 'Atividades:'}
                        </span>
                        <span className="font-bold">
                          {comparisonData.item1.activities || comparisonData.item1.students}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-4">{comparisonData.item2.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Média:</span>
                        <span className="font-bold text-orange-600">{comparisonData.item2.avg}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {comparisonData.type === 'class-class' || comparisonData.type === 'student-class' ? 'Alunos:' : 'Atividades:'}
                        </span>
                        <span className="font-bold">
                          {comparisonData.item2.activities || comparisonData.item2.students}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card>
                <CardContent className="pt-6">
                  <div className="h-[400px] flex items-center justify-center">
                    <Bar
                      data={comparisonData.chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Comparação de Desempenho'
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!comparisonData && selectedItem1 && selectedItem2 && (
            <div className="text-center py-8 text-muted-foreground">
              Carregando comparação...
            </div>
          )}

          {!selectedItem1 && !selectedItem2 && (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Selecione dois itens para comparar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
