import {
  PremiumCard,
  StatsCard,
  PremiumButton,
  LoadingScreen,
  EmptyState,
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
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

export default function AnalyticsPagePremium() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [compareMode, setCompareMode] = useState('student-student');
  const [selectedEntity1, setSelectedEntity1] = useState(null);
  const [selectedEntity2, setSelectedEntity2] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  // Fetch real data on mount
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch students
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student');

      // Fetch classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('id, name, subject')
        .eq('created_by', user.id);

      // Fetch submissions for averages
      const { data: submissions } = await supabase
        .from('submissions')
        .select('student_id, grade, activity_id');

      // Calculate student averages
      const studentsWithGrades = (studentsData || []).map(student => {
        const studentSubs = submissions?.filter(s => s.student_id === student.id) || [];
        const avgGrade = studentSubs.length > 0
          ? studentSubs.reduce((sum, s) => sum + (s.grade || 0), 0) / studentSubs.length
          : 0;
        
        return {
          id: student.id,
          name: student.full_name || student.email?.split('@')[0] || 'Aluno',
          avgGrade: parseFloat(avgGrade.toFixed(1)),
          activities: studentSubs.length,
          attendance: studentSubs.length > 0 ? Math.round((studentSubs.filter(s => s.grade !== null).length / studentSubs.length) * 100) : 0
        };
      });

      setStudents(studentsWithGrades);
      
      // Calcular médias e contagens reais das turmas
      const classesWithStats = await Promise.all((classesData || []).map(async (c) => {
        // Contar alunos
        const { data: members } = await supabase
          .from('class_members')
          .select('user_id', { count: 'exact' })
          .eq('class_id', c.id)
          .eq('role', 'student');
        
        // Contar atividades
        const { data: classActivities } = await supabase
          .from('activities')
          .select('id', { count: 'exact' })
          .eq('class_id', c.id);
        
        // Calcular média da turma
        const classStudentIds = members?.map(m => m.user_id) || [];
        const classSubmissions = submissions?.filter(s => classStudentIds.includes(s.student_id)) || [];
        const avgGrade = classSubmissions.length > 0
          ? classSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / classSubmissions.length
          : 0;
        
        return {
          id: c.id,
          name: c.name,
          avgGrade: parseFloat(avgGrade.toFixed(1)),
          students: members?.length || 0,
          activities: classActivities?.length || 0
        };
      }));
      
      setClasses(classesWithStats);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [compareMode, selectedEntity1, selectedEntity2]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Simular comparação
      if (selectedEntity1 && selectedEntity2) {
        setComparisonData({
          entity1: selectedEntity1,
          entity2: selectedEntity2,
          metrics: [
            { name: 'Nota Média', value1: 8.5, value2: 7.8, diff: 0.7, better: 'entity1' },
            { name: 'Atividades', value1: 24, value2: 20, diff: 4, better: 'entity1' },
            { name: 'Frequência', value1: 95, value2: 88, diff: 7, better: 'entity1' }
          ]
        });
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEntities = () => {
    return compareMode === 'class-class' ? classes : students;
  };

  const handleExport = () => {
    if (!comparisonData) {
      toast.error('Selecione duas entidades para comparar antes de exportar');
      return;
    }

    try {
      // Criar dados CSV
      const csvData = [
        ['Métrica', comparisonData.entity1.name, comparisonData.entity2.name, 'Diferença'],
        ...comparisonData.metrics.map(m => [
          m.name,
          m.value1,
          m.value2,
          m.diff
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics_${comparisonData.entity1.name}_vs_${comparisonData.entity2.name}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('✅ Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  if (loading && !comparisonData) {
    return <LoadingScreen message="Carregando analytics..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 rounded-2xl text-white relative overflow-hidden">
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
                Analytics Comparativo
              </h1>
              <p className="text-white/90">Compare desempenho entre alunos e turmas</p>
            </div>
            <PremiumButton
              variant="outline"
              leftIcon={Download}
              onClick={handleExport}
              disabled={!comparisonData}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exportar CSV
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Compare Mode Selector */}
      <PremiumCard variant="elevated">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">Modo de Comparação</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setCompareMode('student-student');
                setSelectedEntity1(null);
                setSelectedEntity2(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                compareMode === 'student-student'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Users className="w-6 h-6 mb-2" />
              <p className="font-medium">Aluno vs Aluno</p>
              <p className="text-xs text-muted-foreground mt-1">Compare 2 alunos</p>
            </button>

            <button
              onClick={() => {
                setCompareMode('student-class');
                setSelectedEntity1(null);
                setSelectedEntity2(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                compareMode === 'student-class'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Target className="w-6 h-6 mb-2" />
              <p className="font-medium">Aluno vs Turma</p>
              <p className="text-xs text-muted-foreground mt-1">Compare aluno com média da turma</p>
            </button>

            <button
              onClick={() => {
                setCompareMode('class-class');
                setSelectedEntity1(null);
                setSelectedEntity2(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                compareMode === 'class-class'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 text-gray-700 dark:text-gray-300'
              }`}
            >
              <BookOpen className="w-6 h-6 mb-2" />
              <p className="font-medium">Turma vs Turma</p>
              <p className="text-xs text-muted-foreground mt-1">Compare 2 turmas</p>
            </button>
          </div>
        </div>
      </PremiumCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selector 1 */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Selecione 1º {compareMode === 'class-class' ? 'Turma' : 'Aluno'}</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getEntities().map((entity) => (
                <button
                  key={entity.id}
                  onClick={() => setSelectedEntity1(entity)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedEntity1?.id === entity.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="font-medium">{entity.name}</p>
                  <p className="text-xs opacity-80 mt-1">
                    Média: {entity.avgGrade?.toFixed(1) || 'N/A'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </PremiumCard>

        {/* Selector 2 */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Selecione 2º {compareMode === 'class-class' ? 'Turma' : 'Aluno'}</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getEntities()
                .filter(e => e.id !== selectedEntity1?.id)
                .map((entity) => (
                  <button
                    key={entity.id}
                    onClick={() => setSelectedEntity2(entity)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedEntity2?.id === entity.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="font-medium">{entity.name}</p>
                    <p className="text-xs opacity-80 mt-1">
                      Média: {entity.avgGrade?.toFixed(1) || 'N/A'}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Comparison Results */}
      {comparisonData && (
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-6">Resultados da Comparação</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm text-muted-foreground mb-1">Entidade 1</p>
                <p className="text-xl font-bold">{comparisonData.entity1.name}</p>
                <p className="text-sm mt-2">Nota Média: {comparisonData.entity1.avgGrade?.toFixed(1)}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <p className="text-sm text-muted-foreground mb-1">Entidade 2</p>
                <p className="text-xl font-bold">{comparisonData.entity2.name}</p>
                <p className="text-sm mt-2">Nota Média: {comparisonData.entity2.avgGrade?.toFixed(1)}</p>
              </div>
            </div>

            <div className="space-y-4">
              {comparisonData.metrics.map((metric, index) => (
                <div key={index} className="border-b border-border pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{metric.name}</p>
                    <div className={`flex items-center gap-1 text-sm ${
                      metric.better === 'entity1' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.better === 'entity1' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span>±{metric.diff}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{metric.value1}</p>
                      <ProgressBar 
                        value={(metric.value1 / Math.max(metric.value1, metric.value2)) * 100} 
                        variant="primary" 
                        size="sm"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{metric.value2}</p>
                      <ProgressBar 
                        value={(metric.value2 / Math.max(metric.value1, metric.value2)) * 100} 
                        variant="secondary" 
                        size="sm"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PremiumCard>
      )}

      {!selectedEntity1 && !selectedEntity2 && (
        <EmptyState
          icon={BarChart3}
          title="Selecione as entidades para comparar"
          description="Escolha dois alunos ou duas turmas para visualizar a comparação"
        />
      )}
    </div>
  );
}
