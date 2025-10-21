import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  TrendingUp,
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import attendanceService from '@/services/attendanceService';
import toast from 'react-hot-toast';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ClassAttendancePage = () => {
  const { classId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rollCall, setRollCall] = useState(null);
  const [summary, setSummary] = useState([]);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'summary'

  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId, selectedDate, viewMode]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (viewMode === 'daily') {
        const rollCallData = await attendanceService.getAttendanceByDate(classId, selectedDate);
        setRollCall(rollCallData);
      } else {
        const [summaryData, statsData] = await Promise.all([
          attendanceService.getAttendanceSummary(classId),
          attendanceService.getAttendanceRate(classId),
        ]);
        setSummary(summaryData);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Erro ao carregar frequência:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = async (student) => {
    try {
      if (student.is_present) {
        // Remove attendance
        await attendanceService.deleteAttendance(student.attendance_id);
        toast.success('Falta marcada');
      } else {
        // Mark present
        await attendanceService.markAttendance(classId, student.user_id, selectedDate);
        toast.success('Presença marcada');
      }
      
      loadData();
    } catch (error) {
      toast.error('Erro ao atualizar presença');
    }
  };

  const handleMarkAllPresent = async () => {
    try {
      const absentStudents = rollCall.students.filter(s => !s.is_present);
      if (absentStudents.length === 0) {
        toast.error('Todos já estão presentes');
        return;
      }

      await attendanceService.bulkMarkAttendance(
        classId,
        absentStudents.map(s => s.user_id),
        selectedDate
      );
      
      toast.success('Todos marcados como presentes');
      loadData();
    } catch (error) {
      toast.error('Erro ao marcar presença em lote');
    }
  };

  const handleExportCSV = async () => {
    try {
      await attendanceService.exportAttendanceCSV(classId, 'Turma');
      toast.success('Relatório exportado!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  const changeDate = (days) => {
    setSelectedDate(prev => addDays(prev, days));
  };

  if (loading) {
    return <LoadingScreen message="Carregando frequência..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white"
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
              <h1 className="text-4xl font-bold mb-2">📋 Chamada / Frequência</h1>
              <p className="text-white/90 text-lg">Controle de presença da turma</p>
            </div>

            <div className="flex gap-3">
              <PremiumButton
                variant="white"
                leftIcon={Download}
                onClick={handleExportCSV}
                className="whitespace-nowrap inline-flex items-center gap-2 bg-white text-green-600 hover:bg-white/90"
              >
                <span>Exportar CSV</span>
              </PremiumButton>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 w-fit">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'daily'
                  ? 'bg-white text-green-600'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Chamada Diária
            </button>
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'summary'
                  ? 'bg-white text-green-600'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Resumo Geral
            </button>
          </div>
        </div>
      </motion.div>

      {/* Daily Roll Call */}
      {viewMode === 'daily' && rollCall && (
        <>
          {/* Date Navigation */}
          <PremiumCard variant="elevated">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => changeDate(-1)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <h3 className="text-2xl font-bold">
                    {format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedDate, "EEEE", { locale: ptBR })}
                  </p>
                </div>

                <button
                  onClick={() => changeDate(1)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{rollCall.total_students}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">{rollCall.present_count}</p>
                  <p className="text-sm text-green-700 dark:text-green-400">Presentes</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <XCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold text-red-600">{rollCall.absent_count}</p>
                  <p className="text-sm text-red-700 dark:text-red-400">Ausentes</p>
                </div>
              </div>

              {/* Bulk Actions */}
              {rollCall.absent_count > 0 && (
                <div className="mt-4">
                  <PremiumButton
                    variant="outline"
                    leftIcon={UserCheck}
                    onClick={handleMarkAllPresent}
                    className="w-full whitespace-nowrap inline-flex items-center gap-2 justify-center"
                  >
                    <span>Marcar Todos Como Presentes</span>
                  </PremiumButton>
                </div>
              )}
            </div>
          </PremiumCard>

          {/* Student List */}
          <PremiumCard variant="elevated">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Lista de Chamada</h3>

              <div className="space-y-2">
                {rollCall.students.map((student, idx) => (
                  <motion.div
                    key={student.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      student.is_present
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : 'border-border bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {student.avatar_url ? (
                        <img
                          src={student.avatar_url}
                          alt={student.student_name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {student.student_name[0]}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold">{student.student_name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {student.is_present && student.was_on_time && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          No horário
                        </span>
                      )}

                      {student.is_present && !student.was_on_time && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Atrasado
                        </span>
                      )}

                      <button
                        onClick={() => handleToggleAttendance(student)}
                        className={`p-2 rounded-lg transition-colors ${
                          student.is_present
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-muted hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-600'
                        }`}
                      >
                        {student.is_present ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </PremiumCard>
        </>
      )}

      {/* Summary View */}
      {viewMode === 'summary' && (
        <>
          {/* Overall Stats */}
          {stats && (
            <div className="grid md:grid-cols-4 gap-4">
              <PremiumCard variant="elevated">
                <div className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <p className="text-3xl font-bold mb-1">{stats.total_students}</p>
                  <p className="text-sm text-muted-foreground">Alunos</p>
                </div>
              </PremiumCard>

              <PremiumCard variant="elevated">
                <div className="p-6 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <p className="text-3xl font-bold mb-1">{stats.total_classes}</p>
                  <p className="text-sm text-muted-foreground">Aulas Realizadas</p>
                </div>
              </PremiumCard>

              <PremiumCard variant="elevated">
                <div className="p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-green-600" />
                  <p className="text-3xl font-bold mb-1 text-green-600">{stats.total_attendances}</p>
                  <p className="text-sm text-muted-foreground">Total de Presenças</p>
                </div>
              </PremiumCard>

              <PremiumCard variant="elevated">
                <div className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <p className="text-3xl font-bold mb-1">{stats.attendance_rate?.toFixed(1) || 0}%</p>
                  <p className="text-sm text-muted-foreground">Taxa de Presença</p>
                </div>
              </PremiumCard>
            </div>
          )}

          {/* Student Summary Table */}
          <PremiumCard variant="elevated">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Resumo por Aluno</h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 border-b-2 border-primary/20">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold">Aluno</th>
                      <th className="px-4 py-3 text-center text-sm font-bold">Total de Aulas</th>
                      <th className="px-4 py-3 text-center text-sm font-bold">Presenças</th>
                      <th className="px-4 py-3 text-center text-sm font-bold">Faltas</th>
                      <th className="px-4 py-3 text-center text-sm font-bold">No Horário</th>
                      <th className="px-4 py-3 text-center text-sm font-bold">Atrasado</th>
                      <th className="px-4 py-3 text-center text-sm font-bold">Taxa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((student, idx) => (
                      <motion.tr
                        key={student.user_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-border hover:bg-muted/30"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {student.avatar_url ? (
                              <img src={student.avatar_url} alt={student.student_name} className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                {student.student_name[0]}
                              </div>
                            )}
                            <span className="font-medium">{student.student_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">{student.total_classes}</td>
                        <td className="px-4 py-3 text-center font-bold text-green-600">{student.present_count}</td>
                        <td className="px-4 py-3 text-center font-bold text-red-600">{student.absent_count}</td>
                        <td className="px-4 py-3 text-center">{student.on_time_count}</td>
                        <td className="px-4 py-3 text-center">{student.late_count}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            student.attendance_rate >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            student.attendance_rate >= 75 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            student.attendance_rate >= 60 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {student.attendance_rate.toFixed(1)}%
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </PremiumCard>
        </>
      )}
    </div>
  );
};

export default ClassAttendancePage;
