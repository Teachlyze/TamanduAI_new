import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, LoadingScreen, EmptyState, PremiumButton, toast } from '@/components/ui';
import { BarChart3, TrendingUp, Users, FileText, Award, Target, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const TeacherAnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [xpLogs, setXpLogs] = useState([]);
  const [selectedStudentA, setSelectedStudentA] = useState('');
  const [selectedStudentB, setSelectedStudentB] = useState('');
  const [selectedClassA, setSelectedClassA] = useState('');
  const [selectedClassB, setSelectedClassB] = useState('');
  const [dateRange, setDateRange] = useState(30); // days
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchStudentA, setSearchStudentA] = useState('');
  const [searchStudentB, setSearchStudentB] = useState('');
  const [searchStudentC, setSearchStudentC] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      // Set default date range (last 30 days)
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - dateRange);
      setStartDate(start);
      setEndDate(end);
      try {
        // Minhas turmas
        const { data: cls } = await supabase
          .from('classes')
          .select('id, name, created_by')
          .eq('created_by', user.id)
          .eq('is_active', true);
        setClasses(cls || []);

        const classIds = (cls || []).map((c) => c.id);
        if (classIds.length === 0) {
          setLoading(false);
          return;
        }

        // Membros (alunos) - Two-step para evitar PGRST201
        const { data: members } = await supabase
          .from('class_members')
          .select('class_id, user_id')
          .in('class_id', classIds)
          .eq('role', 'student');

        // Buscar dados dos alunos separadamente
        if (members && members.length > 0) {
          const studentIds = [...new Set(members.map(m => m.user_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', studentIds);

          // Combinar dados
          members.forEach(member => {
            member.user = profiles?.find(p => p.id === member.user_id);
          });
        }
        setStudents(members || []);

        // Atividades
        const { data: acts } = await supabase
          .from('activity_class_assignments')
          .select('class_id, activity:activities(id, title, type, max_grade, created_at)')
          .in('class_id', classIds);
        const allActs = (acts || []).map((a) => ({ ...a.activity, class_id: a.class_id })).filter(Boolean);
        setActivities(allActs);

        // Submissões
        const actIds = allActs.map((a) => a.id);
        if (actIds.length > 0) {
          const { data: subs } = await supabase
            .from('submissions')
            .select('id, activity_id, student_id, grade, status, submitted_at, graded_at')
            .in('activity_id', actIds);
          setSubmissions(subs || []);
        }

        // XP logs
        const studentIds = [...new Set((members || []).map((m) => m.user_id))];
        if (studentIds.length > 0) {
          const { data: logs } = await supabase
            .from('xp_log')
            .select('user_id, xp, source, created_at')
            .in('user_id', studentIds);
          setXpLogs(logs || []);
        }
      } finally {
        setLoading(false);
      }
    };

  // Render helpers to avoid complex IIFEs inside JSX
  const renderStudentMetrics = (studentId) => {
    const m = getStudentMetrics(studentId);
    if (!m) return null;
    return (
      <ul className="text-sm space-y-1">
        <li><strong>Nota média:</strong> {m.avgGrade}</li>
        <li><strong>Submissões:</strong> {m.totalSubmissions}</li>
        <li><strong>XP:</strong> {m.xp}</li>
      </ul>
    );
  };

  const renderClassMetrics = (classId) => {
    const m = getClassMetrics(classId);
    if (!m) return null;
    return (
      <ul className="text-sm space-y-1">
        <li><strong>Alunos:</strong> {m.students}</li>
        <li><strong>Atividades:</strong> {m.activities}</li>
        <li><strong>Submissões:</strong> {m.submissions}</li>
        <li><strong>Nota média:</strong> {m.avgGrade}</li>
      </ul>
    );
  };
    load();
  }, [user?.id, dateRange]);

  // Alunos únicos (sem duplicatas) - um aluno pode estar em várias turmas
  const uniqueStudents = useMemo(() => {
    const seen = new Set();
    return students.filter(s => {
      if (seen.has(s.user_id)) return false;
      seen.add(s.user_id);
      return true;
    });
  }, [students]);

  // Filter data by date range
  const filteredSubmissions = useMemo(() => {
    if (!startDate || !endDate) return submissions;
    return submissions.filter((s) => {
      if (!s.submitted_at) return false;
      const subDate = new Date(s.submitted_at);
      return subDate >= startDate && subDate <= endDate;
    });
  }, [submissions, startDate, endDate]);

  const filteredActivities = useMemo(() => {
    if (!startDate || !endDate) return activities;
    return activities.filter((a) => {
      if (!a.created_at) return true;
      const actDate = new Date(a.created_at);
      return actDate >= startDate && actDate <= endDate;
    });
  }, [activities, startDate, endDate]);

  const metrics = useMemo(() => {
    const totalStudents = new Set(students.map((s) => s.user_id)).size;
    const totalActivities = filteredActivities.length;
    const totalSubmissions = filteredSubmissions.length;
    const gradedSubmissions = filteredSubmissions.filter((s) => s.status === 'graded').length;
    const avgGrade = gradedSubmissions > 0
      ? filteredSubmissions.filter((s) => s.grade != null).reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions
      : 0;

    // On-time vs Late
    const onTime = filteredSubmissions.filter((s) => {
      const act = filteredActivities.find((a) => a.id === s.activity_id);
      if (!act?.due_date || !s.submitted_at) return false;
      return new Date(s.submitted_at) <= new Date(act.due_date);
    }).length;
    const late = filteredSubmissions.filter((s) => {
      const act = filteredActivities.find((a) => a.id === s.activity_id);
      if (!act?.due_date || !s.submitted_at) return false;
      return new Date(s.submitted_at) > new Date(act.due_date);
    }).length;

    // Completion rate
    const completionRate = totalActivities > 0 && totalStudents > 0
      ? ((totalSubmissions / (totalActivities * totalStudents)) * 100).toFixed(1)
      : 0;

    return { totalStudents, totalActivities, totalSubmissions, gradedSubmissions, avgGrade: avgGrade.toFixed(1), onTime, late, completionRate };
  }, [students, filteredActivities, filteredSubmissions]);

  const studentComparison = useMemo(() => {
    const byStudent = {};
    students.forEach((s) => {
      const subs = submissions.filter((sub) => sub.student_id === s.user_id);
      const graded = subs.filter((sub) => sub.grade != null);
      const avg = graded.length > 0 ? graded.reduce((sum, sub) => sum + (sub.grade || 0), 0) / graded.length : 0;
      const xp = xpLogs.filter((l) => l.user_id === s.user_id).reduce((sum, l) => sum + (l.xp || 0), 0);
      byStudent[s.user_id] = {
        name: s.user?.full_name || 'Aluno',
        avgGrade: avg,
        totalSubmissions: subs.length,
        xp,
      };
    });
    return Object.values(byStudent).sort((a, b) => b.avgGrade - a.avgGrade).slice(0, 10);
  }, [students, submissions, xpLogs]);

  // Lookup helpers
  const studentMap = useMemo(() => {
    const m = new Map();
    students.forEach((s) => m.set(s.user_id, s));
    return m;
  }, [students]);

  const classMap = useMemo(() => {
    const m = new Map();
    classes.forEach((c) => m.set(c.id, c));
    return m;
  }, [classes]);

  // Compute metrics for a single student
  const getStudentMetrics = (studentId) => {
    if (!studentId) return null;
    const subs = submissions.filter((sub) => sub.student_id === studentId);
    const graded = subs.filter((sub) => sub.grade != null);
    const avg = graded.length > 0 ? graded.reduce((sum, sub) => sum + (sub.grade || 0), 0) / graded.length : 0;
    const xp = xpLogs.filter((l) => l.user_id === studentId).reduce((sum, l) => sum + (l.xp || 0), 0);
    return { avgGrade: Number(avg.toFixed(1)), totalSubmissions: subs.length, xp };
  };

  // Compute metrics for a single class
  const getClassMetrics = (classId) => {
    if (!classId) return null;
    const classStudents = students.filter((s) => s.class_id === classId).map((s) => s.user_id);
    const classActs = activities.filter((a) => a.class_id === classId).map((a) => a.id);
    const classSubs = submissions.filter((sub) => classActs.includes(sub.activity_id));
    const graded = classSubs.filter((s) => s.grade != null);
    const avg = graded.length > 0 ? graded.reduce((sum, s) => sum + (s.grade || 0), 0) / graded.length : 0;
    return {
      students: new Set(classStudents).size,
      activities: classActs.length,
      submissions: classSubs.length,
      avgGrade: Number(avg.toFixed(1))
    };
  };

  const classComparison = useMemo(() => {
    return classes.map((c) => {
      const classStudents = students.filter((s) => s.class_id === c.id);
      const classActs = activities.filter((a) => a.class_id === c.id);
      const studentIds = classStudents.map((s) => s.user_id);
      const classSubs = submissions.filter((sub) => {
        const act = activities.find((a) => a.id === sub.activity_id);
        return act && act.class_id === c.id;
      });
      const graded = classSubs.filter((s) => s.grade != null);
      const avg = graded.length > 0 ? graded.reduce((sum, s) => sum + (s.grade || 0), 0) / graded.length : 0;
      return {
        name: c.name,
        students: classStudents.length,
        activities: classActs.length,
        submissions: classSubs.length,
        avgGrade: avg,
      };
    });
  }, [classes, students, activities, submissions]);

  const activityTypeDistribution = useMemo(() => {
    const dist = activities.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(dist).map(([type, count]) => ({
      name: type === 'assignment' ? 'Tarefa' : type === 'quiz' ? 'Quiz' : 'Projeto',
      value: count,
    }));
  }, [activities]);

  const submissionTrend = useMemo(() => {
    const byDate = filteredSubmissions.reduce((acc, s) => {
      if (!s.submitted_at) return acc;
      const date = new Date(s.submitted_at).toLocaleDateString('pt-BR');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(byDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')))
      .slice(-30);
  }, [filteredSubmissions]);

  // Grade histogram (buckets: 0-10, 10-20, ..., 90-100)
  const gradeHistogram = useMemo(() => {
    const buckets = Array(10).fill(0);
    filteredSubmissions.filter((s) => s.grade != null).forEach((s) => {
      const grade = s.grade || 0;
      const bucketIndex = Math.min(Math.floor(grade / 10), 9);
      buckets[bucketIndex]++;
    });
    return buckets.map((count, i) => ({ range: `${i * 10}-${(i + 1) * 10}`, count }));
  }, [filteredSubmissions]);

  // Percentiles (p10, p50/median, p90)
  const percentiles = useMemo(() => {
    const grades = filteredSubmissions.filter((s) => s.grade != null).map((s) => s.grade).sort((a, b) => a - b);
    if (grades.length === 0) return { p10: 0, p50: 0, p90: 0, p25: 0, p75: 0 };
    const p = (pct) => {
      const idx = Math.ceil((pct / 100) * grades.length) - 1;
      return grades[Math.max(0, idx)] || 0;
    };
    return { p10: p(10), p25: p(25), p50: p(50), p75: p(75), p90: p(90) };
  }, [filteredSubmissions]);

  // Weekly trends (ISO week number)
  const weeklyTrends = useMemo(() => {
    const byWeek = {};
    filteredSubmissions.forEach((s) => {
      if (!s.submitted_at) return;
      const date = new Date(s.submitted_at);
      const year = date.getFullYear();
      const week = getISOWeek(date);
      const key = `${year}-W${week}`;
      if (!byWeek[key]) byWeek[key] = { count: 0, grades: [] };
      byWeek[key].count++;
      if (s.grade != null) byWeek[key].grades.push(s.grade);
    });
    return Object.entries(byWeek)
      .map(([week, data]) => ({
        week,
        count: data.count,
        avgGrade: data.grades.length > 0 ? (data.grades.reduce((a, b) => a + b, 0) / data.grades.length).toFixed(1) : 0
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }, [filteredSubmissions]);

  // Helper: get ISO week number
  const getISOWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  if (loading) return <LoadingScreen message="Carregando analytics..." />;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Analytics Avançado - Professor', 14, 20);
    doc.setFontSize(12);
    doc.text(`Período: Últimos ${dateRange} dias`, 14, 30);
    
    // Métricas Gerais
    doc.text('Métricas Gerais:', 14, 45);
    const metricsData = [
      ['Métrica', 'Valor'],
      ['Total de Alunos', metrics.totalStudents],
      ['Total de Atividades', metrics.totalActivities],
      ['Total de Submissões', metrics.totalSubmissions],
      ['Média Geral', metrics.avgGrade],
      ['Taxa de Conclusão', `${metrics.completionRate}%`],
      ['On-time', metrics.onTime],
      ['Atrasadas', metrics.late],
    ];
    doc.autoTable({ startY: 50, head: [metricsData[0]], body: metricsData.slice(1) });

    // Top 10 Alunos
    const yPos = doc.lastAutoTable.finalY + 15;
    doc.text('Top 10 Alunos:', 14, yPos);
    const studentsData = studentComparison.slice(0, 10).map((s) => [
      studentMap.get(s.studentId)?.full_name || 'N/A',
      s.avgGrade,
      s.submissions,
      s.xp,
    ]);
    doc.autoTable({
      startY: yPos + 5,
      head: [['Nome', 'Média', 'Submissões', 'XP']],
      body: studentsData,
    });

    doc.save('analytics_professor.pdf');
    toast({ title: 'Sucesso', description: 'Relatório exportado em PDF!' });
  };

  const exportExcel = () => {
    // Sheet 1: Métricas Gerais
    const ws1 = XLSX.utils.json_to_sheet([
      { Métrica: 'Total de Alunos', Valor: metrics.totalStudents },
      { Métrica: 'Total de Atividades', Valor: metrics.totalActivities },
      { Métrica: 'Total de Submissões', Valor: metrics.totalSubmissions },
      { Métrica: 'Média Geral', Valor: metrics.avgGrade },
      { Métrica: 'Taxa de Conclusão', Valor: `${metrics.completionRate}%` },
      { Métrica: 'On-time', Valor: metrics.onTime },
      { Métrica: 'Atrasadas', Valor: metrics.late },
    ]);

    // Sheet 2: Top Alunos
    const ws2 = XLSX.utils.json_to_sheet(
      studentComparison.slice(0, 20).map((s) => ({
        Nome: studentMap.get(s.studentId)?.full_name || 'N/A',
        Média: s.avgGrade,
        Submissões: s.submissions,
        XP: s.xp,
      }))
    );

    // Sheet 3: Comparação de Turmas
    const ws3 = XLSX.utils.json_to_sheet(
      classComparison.map((c) => ({
        Turma: c.name,
        Alunos: c.students,
        Atividades: c.activities,
        Submissões: c.submissions,
        Média: c.avgGrade,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Métricas Gerais');
    XLSX.utils.book_append_sheet(wb, ws2, 'Top Alunos');
    XLSX.utils.book_append_sheet(wb, ws3, 'Comparação Turmas');
    XLSX.writeFile(wb, 'analytics_professor.xlsx');
    toast({ title: 'Sucesso', description: 'Relatório exportado em Excel!' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3"><BarChart3 className="w-6 h-6"/> Analytics Avançado</h1>
            <p className="text-white/90">Métricas detalhadas e comparações</p>
          </div>
          <div className="flex gap-3">
            <PremiumButton onClick={exportPDF} variant="secondary" className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit">
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </PremiumButton>
            <PremiumButton onClick={exportExcel} variant="secondary" className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit">
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Date Range Filters */}
      <PremiumCard variant="elevated">
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-sm">Período:</span>
            {[7, 15, 30, 90, 180, 365].map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === days
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                {days === 7 ? '7 dias' : days === 15 ? '15 dias' : days === 30 ? '30 dias' : days === 90 ? '3 meses' : days === 180 ? '6 meses' : '1 ano'}
              </button>
            ))}
          </div>
        </div>
      </PremiumCard>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Taxa de Conclusão</div>
            <div className="text-2xl font-bold text-green-600">{metrics.completionRate}%</div>
          </div>
        </PremiumCard>
        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="text-sm text-muted-foreground mb-1">On-time / Late</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-green-600">{metrics.onTime}</div>
              <div className="text-muted-foreground">/</div>
              <div className="text-lg font-bold text-red-600">{metrics.late}</div>
            </div>
          </div>
        </PremiumCard>
        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Mediana (p50)</div>
            <div className="text-2xl font-bold text-blue-600">{percentiles.p50}</div>
          </div>
        </PremiumCard>
        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Percentis</div>
            <div className="text-xs space-y-1">
              <div>p10: <strong>{percentiles.p10}</strong></div>
              <div>p25: <strong>{percentiles.p25}</strong></div>
              <div>p75: <strong>{percentiles.p75}</strong></div>
              <div>p90: <strong>{percentiles.p90}</strong></div>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Comparação Manual - Aluno x Aluno */}
      <PremiumCard variant="elevated">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold mb-4">Comparação Manual: Aluno x Aluno</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input 
                type="text"
                placeholder="Filtrar aluno A por nome..." 
                value={searchStudentA}
                onChange={(e) => setSearchStudentA(e.target.value)}
                className="w-full px-3 py-2 rounded-t-lg border border-b-0 border-border bg-white dark:bg-slate-900 text-foreground" 
              />
              <select 
                className="w-full px-3 py-2 rounded-b-lg border border-border bg-white dark:bg-slate-900 text-foreground max-h-40" 
                value={selectedStudentA} 
                onChange={(e) => setSelectedStudentA(e.target.value)}
                size="5"
              >
                <option value="">— Selecione Aluno A —</option>
                {uniqueStudents
                  .filter(s => !searchStudentA || (s.user?.full_name || '').toLowerCase().includes(searchStudentA.toLowerCase()))
                  .map((s) => (
                    <option key={s.user_id} value={s.user_id}>
                      {s.user?.full_name || 'Aluno'}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <input 
                type="text"
                placeholder="Filtrar aluno B por nome..." 
                value={searchStudentB}
                onChange={(e) => setSearchStudentB(e.target.value)}
                className="w-full px-3 py-2 rounded-t-lg border border-b-0 border-border bg-white dark:bg-slate-900 text-foreground" 
              />
              <select 
                className="w-full px-3 py-2 rounded-b-lg border border-border bg-white dark:bg-slate-900 text-foreground" 
                value={selectedStudentB} 
                onChange={(e) => setSelectedStudentB(e.target.value)}
                size="5"
              >
                <option value="">— Selecione Aluno B —</option>
                {uniqueStudents
                  .filter(s => !searchStudentB || (s.user?.full_name || '').toLowerCase().includes(searchStudentB.toLowerCase()))
                  .map((s) => (
                    <option key={s.user_id} value={s.user_id}>
                      {s.user?.full_name || 'Aluno'}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-white dark:bg-slate-900">
              <div className="font-semibold mb-3 pb-2 border-b border-border">
                Aluno A
                {selectedStudentA && (
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    {uniqueStudents.find(s => s.user_id === selectedStudentA)?.user?.full_name || 'N/A'}
                  </div>
                )}
              </div>
              {selectedStudentA ? (
                renderStudentMetrics(selectedStudentA)
              ) : <div className="text-sm text-muted-foreground">Selecione um aluno</div>}
            </div>
            <div className="p-4 rounded-lg border border-border bg-white dark:bg-slate-900">
              <div className="font-semibold mb-3 pb-2 border-b border-border">
                Aluno B
                {selectedStudentB && (
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    {uniqueStudents.find(s => s.user_id === selectedStudentB)?.user?.full_name || 'N/A'}
                  </div>
                )}
              </div>
              {selectedStudentB ? (
                renderStudentMetrics(selectedStudentB)
              ) : <div className="text-sm text-muted-foreground">Selecione um aluno</div>}
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Comparação Manual - Turma x Turma */}
      <PremiumCard variant="elevated">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold mb-4">Comparação Manual: Turma x Turma</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select 
              className="px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground" 
              value={selectedClassA} 
              onChange={(e) => setSelectedClassA(e.target.value)}
            >
              <option value="">Selecione Turma A</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select 
              className="px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground" 
              value={selectedClassB} 
              onChange={(e) => setSelectedClassB(e.target.value)}
            >
              <option value="">Selecione Turma B</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-white dark:bg-slate-900">
              <div className="font-semibold mb-3 pb-2 border-b border-border">
                Turma A
                {selectedClassA && classMap.get(selectedClassA)?.name && (
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    {classMap.get(selectedClassA).name}
                  </div>
                )}
              </div>
              {selectedClassA ? (
                renderClassMetrics(selectedClassA)
              ) : <div className="text-sm text-muted-foreground">Selecione uma turma</div>}
            </div>
            <div className="p-4 rounded-lg border border-border bg-white dark:bg-slate-900">
              <div className="font-semibold mb-3 pb-2 border-b border-border">
                Turma B
                {selectedClassB && classMap.get(selectedClassB)?.name && (
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    {classMap.get(selectedClassB).name}
                  </div>
                )}
              </div>
              {selectedClassB ? (
                renderClassMetrics(selectedClassB)
              ) : <div className="text-sm text-muted-foreground">Selecione uma turma</div>}
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Comparação Manual - Aluno x Turma */}
      <PremiumCard variant="elevated">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold mb-4">Comparação Manual: Aluno x Turma</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input 
                type="text"
                placeholder="Filtrar aluno por nome..." 
                value={searchStudentC}
                onChange={(e) => setSearchStudentC(e.target.value)}
                className="w-full px-3 py-2 rounded-t-lg border border-b-0 border-border bg-white dark:bg-slate-900 text-foreground" 
              />
              <select 
                className="w-full px-3 py-2 rounded-b-lg border border-border bg-white dark:bg-slate-900 text-foreground" 
                value={selectedStudentA} 
                onChange={(e) => setSelectedStudentA(e.target.value)}
                size="5"
              >
                <option value="">— Selecione Aluno —</option>
                {uniqueStudents
                  .filter(s => !searchStudentC || (s.user?.full_name || '').toLowerCase().includes(searchStudentC.toLowerCase()))
                  .map((s) => (
                    <option key={s.user_id} value={s.user_id}>
                      {s.user?.full_name || 'Aluno'}
                    </option>
                  ))}
              </select>
            </div>
            <select 
              className="px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground" 
              value={selectedClassA} 
              onChange={(e) => setSelectedClassA(e.target.value)}
            >
              <option value="">— Selecione Turma —</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-white dark:bg-slate-900">
              <div className="font-semibold mb-3 pb-2 border-b border-border">
                Aluno
                {selectedStudentA && (
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    {uniqueStudents.find(s => s.user_id === selectedStudentA)?.user?.full_name || 'N/A'}
                  </div>
                )}
              </div>
              {selectedStudentA ? (
                renderStudentMetrics(selectedStudentA)
              ) : <div className="text-sm text-muted-foreground">Selecione um aluno</div>}
            </div>
            <div className="p-4 rounded-lg border border-border bg-white dark:bg-slate-900">
              <div className="font-semibold mb-3 pb-2 border-b border-border">
                Turma
                {selectedClassA && classMap.get(selectedClassA)?.name && (
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    {classMap.get(selectedClassA).name}
                  </div>
                )}
              </div>
              {selectedClassA ? (
                renderClassMetrics(selectedClassA)
              ) : <div className="text-sm text-muted-foreground">Selecione uma turma</div>}
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <PremiumCard variant="elevated">
          <div className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{metrics.totalStudents}</div>
            <div className="text-sm text-muted-foreground">Alunos</div>
          </div>
        </PremiumCard>
        <PremiumCard variant="elevated">
          <div className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{metrics.totalActivities}</div>
            <div className="text-sm text-muted-foreground">Atividades</div>
          </div>
        </PremiumCard>
        <PremiumCard variant="elevated">
          <div className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-amber-600" />
            <div className="text-2xl font-bold">{metrics.totalSubmissions}</div>
            <div className="text-sm text-muted-foreground">Submissões</div>
          </div>
        </PremiumCard>
        <PremiumCard variant="elevated">
          <div className="p-4 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{metrics.gradedSubmissions}</div>
            <div className="text-sm text-muted-foreground">Avaliadas</div>
          </div>
        </PremiumCard>
        <PremiumCard variant="elevated">
          <div className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-rose-600" />
            <div className="text-2xl font-bold">{metrics.avgGrade}</div>
            <div className="text-sm text-muted-foreground">Nota Média</div>
          </div>
        </PremiumCard>
      </div>

      {/* Comparação Aluno x Aluno */}
      <PremiumCard variant="elevated">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold">Top 10 Alunos - Desempenho</h2>
          {studentComparison.length === 0 ? (
            <EmptyState icon={Users} title="Sem dados" description="Aguardando submissões avaliadas." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgGrade" fill="#3b82f6" name="Nota Média" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </PremiumCard>

      {/* Comparação Turma x Turma */}
      <PremiumCard variant="elevated">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold">Comparação de Turmas</h2>
          {classComparison.length === 0 ? (
            <EmptyState icon={Users} title="Sem turmas" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgGrade" fill="#10b981" name="Nota Média" />
                <Bar dataKey="submissions" fill="#f59e0b" name="Submissões" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </PremiumCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Tipo */}
        <PremiumCard variant="elevated">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Atividades por Tipo</h2>
            {activityTypeDistribution.length === 0 ? (
              <EmptyState icon={FileText} title="Sem atividades" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={activityTypeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {activityTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </PremiumCard>

        {/* Tendência de Submissões */}
        <PremiumCard variant="elevated">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Submissões (últimos 30 dias)</h2>
            {submissionTrend.length === 0 ? (
              <EmptyState icon={TrendingUp} title="Sem dados" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={submissionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" name="Submissões" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </PremiumCard>
      </div>

      {/* Histograma de Notas e Tendências Semanais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histograma de Notas */}
        <PremiumCard variant="elevated">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Distribuição de Notas</h2>
            {gradeHistogram.every((b) => b.count === 0) ? (
              <EmptyState icon={BarChart3} title="Sem notas" description="Aguardando avaliações." />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={gradeHistogram}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </PremiumCard>

        {/* Tendências Semanais */}
        <PremiumCard variant="elevated">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Tendências Semanais</h2>
            {weeklyTrends.length === 0 ? (
              <EmptyState icon={TrendingUp} title="Sem dados" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3b82f6" name="Submissões" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="avgGrade" stroke="#10b981" name="Nota Média" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </PremiumCard>
      </div>
    </div>
  );
};

export default TeacherAnalyticsPage;
