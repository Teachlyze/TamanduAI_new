import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  BarChart3,
  Grid3x3,
  List,
  Search,
  Filter,
} from 'lucide-react';
import gradesService from '@/services/gradesService';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import GradesTable from '@/components/teacher/GradesTable';
import toast from 'react-hot-toast';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';

const ClassGradesPage = () => {
  const { classId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('matrix'); // 'matrix', 'students', 'activities'
  const [stats, setStats] = useState(null);
  const [matrixData, setMatrixData] = useState({ students: [], activities: [], grades: {} });
  const [studentGrades, setStudentGrades] = useState([]);
  const [activityGrades, setActivityGrades] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (classId) {
      loadAllData();
    }
  }, [classId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [statsData, matrixRaw, studentsData, activitiesData] = await Promise.all([
        gradesService.getClassGradeStats(classId),
        gradesService.getGradeMatrix(classId),
        gradesService.getStudentGrades(classId),
        gradesService.getActivityGrades(classId),
      ]);

      setStats(statsData);
      setMatrixData(gradesService.transformMatrixData(matrixRaw));
      setStudentGrades(studentsData);
      setActivityGrades(activitiesData);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      toast.error('Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const data = await gradesService.getGradesExportData(classId);
      
      const formattedData = data.map(row => ({
        'Aluno': row.student_name,
        'Email': row.student_email,
        'Atividade': row.activity_title,
        'Tipo': row.activity_type,
        'Nota': row.grade || '-',
        'Total': row.total_points,
        'Porcentagem': row.percentage ? `${row.percentage}%` : '-',
        'Status': row.status,
        'Entrega': row.submitted_at ? new Date(row.submitted_at).toLocaleDateString('pt-BR') : '-',
        'Atrasada': row.is_late ? 'Sim' : 'Não',
      }));

      exportToExcel(formattedData, `notas_turma_${classId}`);
      toast.success('Exportado para Excel!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar');
    }
  };

  const handleExportPDF = async () => {
    try {
      const data = await gradesService.getGradesExportData(classId);
      
      const formattedData = data.map(row => ({
        'Aluno': row.student_name,
        'Atividade': row.activity_title,
        'Nota': row.grade || '-',
        'Total': row.total_points,
        '%': row.percentage ? `${row.percentage}%` : '-',
      }));

      exportToPDF(formattedData, `notas_turma_${classId}`, 'Boletim da Turma');
      toast.success('Exportado para PDF!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar');
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando notas..." />;
  }

  const filteredStudents = studentGrades.filter(student =>
    student.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = activityGrades.filter(activity =>
    activity.activity_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-4xl font-bold mb-2">📊 Painel de Notas</h1>
              <p className="text-white/90 text-lg">
                Visualize, edite e exporte notas da turma
              </p>
            </div>

            <div className="flex items-center gap-2">
              <PremiumButton
                variant="white"
                leftIcon={Download}
                onClick={handleExportExcel}
                className="whitespace-nowrap inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-white/90"
              >
                <span>Excel</span>
              </PremiumButton>

              <PremiumButton
                variant="white"
                leftIcon={Download}
                onClick={handleExportPDF}
                className="whitespace-nowrap inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-white/90"
              >
                <span>PDF</span>
              </PremiumButton>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Alunos</p>
                    <p className="text-2xl font-bold">{stats.total_students || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Atividades</p>
                    <p className="text-2xl font-bold">{stats.total_activities || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Média Geral</p>
                    <p className="text-2xl font-bold">
                      {stats.average_class_grade ? `${stats.average_class_grade.toFixed(1)}` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/30 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Maior Média</p>
                    <p className="text-2xl font-bold">
                      {stats.highest_student_avg ? `${stats.highest_student_avg.toFixed(1)}` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/30 rounded-lg">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Menor Média</p>
                    <p className="text-2xl font-bold">
                      {stats.lowest_student_avg ? `${stats.lowest_student_avg.toFixed(1)}` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* View Selector & Search */}
      <PremiumCard variant="elevated">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* View Tabs */}
            <div className="flex gap-2">
              {[
                { id: 'matrix', label: 'Matriz', icon: Grid3x3 },
                { id: 'students', label: 'Por Aluno', icon: Users },
                { id: 'activities', label: 'Por Atividade', icon: FileText },
              ].map((v) => {
                const Icon = v.icon;
                const isActive = view === v.id;

                return (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id)}
                    className={`whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-white dark:bg-slate-900 text-foreground border border-border hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{v.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            {view !== 'matrix' && (
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={view === 'students' ? 'Buscar aluno...' : 'Buscar atividade...'}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground"
                />
              </div>
            )}
          </div>
        </div>
      </PremiumCard>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'matrix' && (
          <GradesTable
            students={matrixData.students}
            activities={matrixData.activities}
            grades={matrixData.grades}
            onGradeUpdate={loadAllData}
          />
        )}

        {view === 'students' && (
          <StudentGradesView students={filteredStudents} />
        )}

        {view === 'activities' && (
          <ActivityGradesView activities={filteredActivities} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Student Grades View Component
const StudentGradesView = ({ students }) => {
  if (students.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum aluno encontrado"
        description="Ajuste sua busca ou adicione alunos à turma"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map((student) => (
        <PremiumCard key={student.student_id} variant="elevated">
          <div className="p-6">
            <h3 className="font-bold text-lg mb-4">{student.student_name}</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Média:</span>
                <span className="text-2xl font-bold text-primary">
                  {student.average_grade ? `${student.average_grade.toFixed(1)}` : '-'}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Submissões:</span>
                <span className="font-medium">{student.total_submissions || 0}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Corrigidas:</span>
                <span className="font-medium">{student.graded_submissions || 0}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Pendentes:</span>
                <span className="font-medium text-orange-600">{student.pending_count || 0}</span>
              </div>

              {student.overall_percentage && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">Aproveitamento:</span>
                    <span className="text-sm font-bold">{student.overall_percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(student.overall_percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </PremiumCard>
      ))}
    </div>
  );
};

// Activity Grades View Component
const ActivityGradesView = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhuma atividade encontrada"
        description="Ajuste sua busca ou crie novas atividades"
      />
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <PremiumCard key={activity.activity_id} variant="elevated">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg mb-1">{activity.activity_title}</h3>
                <p className="text-sm text-muted-foreground">
                  {activity.activity_type} • {activity.total_points} pontos
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {activity.average_grade ? `${activity.average_grade.toFixed(1)}` : '-'}
                </div>
                <div className="text-xs text-muted-foreground">média</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Entregas:</div>
                <div className="text-lg font-semibold">{activity.total_submissions || 0}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Corrigidas:</div>
                <div className="text-lg font-semibold">{activity.graded_count || 0}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Maior Nota:</div>
                <div className="text-lg font-semibold text-green-600">
                  {activity.highest_grade || '-'}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Menor Nota:</div>
                <div className="text-lg font-semibold text-orange-600">
                  {activity.lowest_grade || '-'}
                </div>
              </div>
            </div>

            {activity.submission_rate && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Taxa de Submissão:</span>
                  <span className="text-sm font-bold">{activity.submission_rate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(activity.submission_rate, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </PremiumCard>
      ))}
    </div>
  );
};

export default ClassGradesPage;
