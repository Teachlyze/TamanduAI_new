import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, LoadingScreen, EmptyState, PremiumButton, toast } from '@/components/ui';
import { BarChart3, TrendingUp, Users, FileText, Award, Target, GraduationCap, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SchoolAnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [xpLogs, setXpLogs] = useState([]);
  const [selectedClassA, setSelectedClassA] = useState('');
  const [selectedClassB, setSelectedClassB] = useState('');
  const [selectedTeacherA, setSelectedTeacherA] = useState('');
  const [selectedTeacherB, setSelectedTeacherB] = useState('');
  const [dateRange, setDateRange] = useState(30);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - dateRange);
      setStartDate(start);
      setEndDate(end);
      try {
        // Escola
        const { data: sch } = await supabase
          .from('schools')
          .select('id, name')
          .eq('owner_id', user.id)
          .maybeSingle();
        if (!sch) {
          setLoading(false);
          return;
        }
        setSchool(sch);

        // Turmas da escola via school_classes
        const { data: schoolClasses } = await supabase
          .from('school_classes')
          .select('class_id, classes(id, name, created_by, is_active)')
          .eq('school_id', sch.id);
        
        const cls = (schoolClasses || [])
          .map(sc => sc.classes)
          .filter(c => c && c.is_active);
        setClasses(cls);

        const classIds = (cls || []).map((c) => c.id);
        const teacherIds = [...new Set((cls || []).map((c) => c.created_by))];

        // Professores
        if (teacherIds.length > 0) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', teacherIds);
          setTeachers(profs || []);
        }

        if (classIds.length === 0) {
          setLoading(false);
          return;
        }

        // Alunos
        const { data: members } = await supabase
          .from('class_members')
          .select('class_id, user_id, user:profiles(id, full_name)')
          .in('class_id', classIds)
          .eq('role', 'student');
        setStudents(members || []);

        // Atividades
        const { data: acts } = await supabase
          .from('activity_class_assignments')
          .select('class_id, activity:activities(id, title, type, max_grade, created_by, created_at)')
          .in('class_id', classIds);
        const allActs = (acts || []).map((a) => ({ ...a.activity, class_id: a.class_id })).filter(Boolean);
        setActivities(allActs);

        // Submissões
        const actIds = allActs.map((a) => a.id);
        if (actIds.length > 0) {
          const { data: subs } = await supabase
            .from('submissions')
            .select('id, activity_id, student_id, grade, status, submitted_at')
            .in('activity_id', actIds);
          setSubmissions(subs || []);
        }

        // XP
        const studentIds = [...new Set((members || []).map((m) => m.user_id))];
        if (studentIds.length > 0) {
          const { data: logs } = await supabase
            .from('xp_log')
            .select('user_id, xp, created_at')
            .in('user_id', studentIds);
          setXpLogs(logs || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, dateRange]);

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
    const totalTeachers = teachers.length;
    const totalClasses = classes.length;
    const totalStudents = new Set(students.map((s) => s.user_id)).size;
    const totalActivities = filteredActivities.length;
    const totalSubmissions = filteredSubmissions.length;
    const gradedSubmissions = filteredSubmissions.filter((s) => s.status === 'graded').length;
    const avgGrade = gradedSubmissions > 0
      ? filteredSubmissions.filter((s) => s.grade != null).reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions
      : 0;

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

    const completionRate = totalActivities > 0 && totalStudents > 0
      ? ((totalSubmissions / (totalActivities * totalStudents)) * 100).toFixed(1)
      : 0;

    return { totalTeachers, totalClasses, totalStudents, totalActivities, totalSubmissions, gradedSubmissions, avgGrade: avgGrade.toFixed(1), onTime, late, completionRate };
  }, [teachers, classes, students, filteredActivities, filteredSubmissions]);

  // Lookup maps
  const classMap = useMemo(() => {
    const m = new Map();
    classes.forEach((c) => m.set(c.id, c));
    return m;
  }, [classes]);

  const teacherMap = useMemo(() => {
    const m = new Map();
    teachers.forEach((t) => m.set(t.id, t));
    return m;
  }, [teachers]);

  // Metrics helpers
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

  const getTeacherMetrics = (teacherId) => {
    if (!teacherId) return null;
    const teacherClasses = classes.filter((c) => c.created_by === teacherId);
    const teacherClassIds = teacherClasses.map((c) => c.id);
    const teacherStudents = students.filter((s) => teacherClassIds.includes(s.class_id));
    const teacherActs = activities.filter((a) => teacherClassIds.includes(a.class_id));
    const teacherActIds = teacherActs.map((a) => a.id);
    const teacherSubs = submissions.filter((s) => teacherActIds.includes(s.activity_id));
    const graded = teacherSubs.filter((s) => s.grade != null);
    const avg = graded.length > 0 ? graded.reduce((sum, s) => sum + (s.grade || 0), 0) / graded.length : 0;
    return {
      classes: teacherClasses.length,
      students: new Set(teacherStudents.map((s) => s.user_id)).size,
      activities: teacherActs.length,
      submissions: teacherSubs.length,
      avgGrade: Number(avg.toFixed(1))
    };
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

  const renderTeacherMetrics = (teacherId) => {
    const m = getTeacherMetrics(teacherId);
    if (!m) return null;
    return (
      <ul className="text-sm space-y-1">
        <li><strong>Turmas:</strong> {m.classes}</li>
        <li><strong>Alunos:</strong> {m.students}</li>
        <li><strong>Atividades:</strong> {m.activities}</li>
        <li><strong>Submissões:</strong> {m.submissions}</li>
        <li><strong>Nota média:</strong> {m.avgGrade}</li>
      </ul>
    );
  };

  const teacherComparison = useMemo(() => {
    return teachers.map((t) => {
      const teacherClasses = classes.filter((c) => c.created_by === t.id);
      const teacherClassIds = teacherClasses.map((c) => c.id);
      const teacherStudents = students.filter((s) => teacherClassIds.includes(s.class_id));
      const teacherActs = activities.filter((a) => a.created_by === t.id);
      const teacherActIds = teacherActs.map((a) => a.id);
      const teacherSubs = submissions.filter((s) => teacherActIds.includes(s.activity_id));
      const graded = teacherSubs.filter((s) => s.grade != null);
      const avg = graded.length > 0 ? graded.reduce((sum, s) => sum + (s.grade || 0), 0) / graded.length : 0;
      return {
        name: t.full_name || 'Professor',
        classes: teacherClasses.length,
        students: new Set(teacherStudents.map((s) => s.user_id)).size,
        activities: teacherActs.length,
        avgGrade: avg,
      };
    });
  }, [teachers, classes, students, activities, submissions]);

  const classComparison = useMemo(() => {
    return classes.slice(0, 10).map((c) => {
      const classStudents = students.filter((s) => s.class_id === c.id);
      const classActs = activities.filter((a) => a.class_id === c.id);
      const classSubs = submissions.filter((sub) => {
        const act = activities.find((a) => a.id === sub.activity_id);
        return act && act.class_id === c.id;
      });
      const graded = classSubs.filter((s) => s.grade != null);
      const avg = graded.length > 0 ? graded.reduce((sum, s) => sum + (s.grade || 0), 0) / graded.length : 0;
      return {
        name: c.name,
        students: classStudents.length,
        submissions: classSubs.length,
        avgGrade: avg,
      };
    });
  }, [classes, students, activities, submissions]);

  const studentPerformance = useMemo(() => {
    const byStudent = {};
    students.forEach((s) => {
      const subs = submissions.filter((sub) => sub.student_id === s.user_id);
      const graded = subs.filter((sub) => sub.grade != null);
      const avg = graded.length > 0 ? graded.reduce((sum, sub) => sum + (sub.grade || 0), 0) / graded.length : 0;
      const xp = xpLogs.filter((l) => l.user_id === s.user_id).reduce((sum, l) => sum + (l.xp || 0), 0);
      byStudent[s.user_id] = {
        name: s.user?.full_name || 'Aluno',
        avgGrade: avg,
        xp,
      };
    });
    return Object.values(byStudent).sort((a, b) => b.avgGrade - a.avgGrade).slice(0, 10);
  }, [students, submissions, xpLogs]);

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

  const gradeHistogram = useMemo(() => {
    const buckets = Array(10).fill(0);
    filteredSubmissions.filter((s) => s.grade != null).forEach((s) => {
      const grade = s.grade || 0;
      const bucketIndex = Math.min(Math.floor(grade / 10), 9);
      buckets[bucketIndex]++;
    });
    return buckets.map((count, i) => ({ range: `${i * 10}-${(i + 1) * 10}`, count }));
  }, [filteredSubmissions]);

  const percentiles = useMemo(() => {
    const grades = filteredSubmissions.filter((s) => s.grade != null).map((s) => s.grade).sort((a, b) => a - b);
    if (grades.length === 0) return { p10: 0, p50: 0, p90: 0, p25: 0, p75: 0 };
    const p = (pct) => {
      const idx = Math.ceil((pct / 100) * grades.length) - 1;
      return grades[Math.max(0, idx)] || 0;
    };
    return { p10: p(10), p25: p(25), p50: p(50), p75: p(75), p90: p(90) };
  }, [filteredSubmissions]);

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

  const getISOWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  if (loading) return <LoadingScreen message="Carregando analytics da escola..." />;
  if (!school) return <EmptyState icon={Users} title="Escola não encontrada" description="Nenhuma escola vinculada." />;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Analytics - ${school.name}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Período: Últimos ${dateRange} dias`, 14, 30);
    
    // Métricas Gerais
    doc.text('Métricas Gerais:', 14, 45);
    const metricsData = [
      ['Métrica', 'Valor'],
      ['Total de Professores', metrics.totalTeachers],
      ['Total de Turmas', metrics.totalClasses],
      ['Total de Alunos', metrics.totalStudents],
      ['Média Geral', metrics.avgGrade],
      ['Taxa de Conclusão', `${metrics.completionRate}%`],
    ];
    doc.autoTable({ startY: 50, head: [metricsData[0]], body: metricsData.slice(1) });

    doc.save(`analytics_${school.name.replace(/\s/g, '_')}.pdf`);
    toast({ title: 'Sucesso', description: 'Relatório exportado em PDF!' });
  };

  const exportExcel = () => {
    // Sheet 1: Métricas Gerais
    const ws1 = XLSX.utils.json_to_sheet([
      { Métrica: 'Total de Professores', Valor: metrics.totalTeachers },
      { Métrica: 'Total de Turmas', Valor: metrics.totalClasses },
      { Métrica: 'Total de Alunos', Valor: metrics.totalStudents },
      { Métrica: 'Média Geral', Valor: metrics.avgGrade },
      { Métrica: 'Taxa de Conclusão', Valor: `${metrics.completionRate}%` },
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Métricas');
    XLSX.writeFile(wb, `analytics_${school.name.replace(/\s/g, '_')}.xlsx`);
    toast({ title: 'Sucesso', description: 'Relatório exportado em Excel!' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-600 to-gray-700 p-8 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3"><BarChart3 className="w-6 h-6"/> Analytics da Escola</h1>
            <p className="text-white/90">{school.name} - Métricas e Comparações</p>
          </div>
          <div className="flex gap-3">
            <PremiumButton onClick={exportPDF} variant="secondary" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              PDF
            </PremiumButton>
            <PremiumButton onClick={exportExcel} variant="secondary" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Excel
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
                    ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white'
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

      {/* Comparação Manual - Turma x Turma */}
      <PremiumCard variant="elevated">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold">Comparação Manual: Turma x Turma</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select className="px-3 py-2 rounded-lg border border-border" value={selectedClassA} onChange={(e) => setSelectedClassA(e.target.value)}>
              <option value="">Selecione Turma A</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select className="px-3 py-2 rounded-lg border border-border" value={selectedClassB} onChange={(e) => setSelectedClassB(e.target.value)}>
              <option value="">Selecione Turma B</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border">
              <div className="font-semibold mb-2">Turma A {selectedClassA && classMap.get(selectedClassA)?.name ? `- ${classMap.get(selectedClassA).name}` : ''}</div>
              {selectedClassA ? (
                renderClassMetrics(selectedClassA)
              ) : <div className="text-sm text-muted-foreground">Selecione uma turma</div>}
            </div>
            <div className="p-4 rounded-lg border border-border">
              <div className="font-semibold mb-2">Turma B {selectedClassB && classMap.get(selectedClassB)?.name ? `- ${classMap.get(selectedClassB).name}` : ''}</div>
              {selectedClassB ? (
                renderClassMetrics(selectedClassB)
              ) : <div className="text-sm text-muted-foreground">Selecione uma turma</div>}
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Comparação Manual - Professor x Professor */}
      <PremiumCard variant="elevated">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold">Comparação Manual: Professor x Professor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input list="teachers-list" placeholder="Buscar professor A por nome" className="px-3 py-2 rounded-lg border border-border" onChange={(e) => {
              const name = e.target.value.toLowerCase();
              const match = teachers.find((t) => (t.full_name || '').toLowerCase() === name);
              setSelectedTeacherA(match ? match.id : '');
            }} />
            <input list="teachers-list" placeholder="Buscar professor B por nome" className="px-3 py-2 rounded-lg border border-border" onChange={(e) => {
              const name = e.target.value.toLowerCase();
              const match = teachers.find((t) => (t.full_name || '').toLowerCase() === name);
              setSelectedTeacherB(match ? match.id : '');
            }} />
            <datalist id="teachers-list">
              {teachers.map((t) => (
                <option key={t.id} value={(t.full_name || '').toLowerCase()} />
              ))}
            </datalist>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border">
              <div className="font-semibold mb-2">Professor A {selectedTeacherA && teacherMap.get(selectedTeacherA)?.full_name ? `- ${teacherMap.get(selectedTeacherA).full_name}` : ''}</div>
              {selectedTeacherA ? (
                renderTeacherMetrics(selectedTeacherA)
              ) : <div className="text-sm text-muted-foreground">Selecione um professor</div>}
            </div>
            <div className="p-4 rounded-lg border border-border">
              <div className="font-semibold mb-2">Professor B {selectedTeacherB && teacherMap.get(selectedTeacherB)?.full_name ? `- ${teacherMap.get(selectedTeacherB).full_name}` : ''}</div>
              {selectedTeacherB ? (
                renderTeacherMetrics(selectedTeacherB)
              ) : <div className="text-sm text-muted-foreground">Selecione um professor</div>}
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
        <PremiumCard variant="elevated">
          <div className="p-4 text-center">
            <GraduationCap className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
            <div className="text-2xl font-bold">{metrics.totalTeachers}</div>
            <div className="text-sm text-muted-foreground">Professores</div>
          </div>
        </PremiumCard>
        <PremiumCard variant="elevated">
          <div className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{metrics.totalClasses}</div>
            <div className="text-sm text-muted-foreground">Turmas</div>
          </div>
        </PremiumCard>
        <PremiumCard variant="elevated">
          <div className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
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

      {/* Comparação Professor x Professor */}
      <PremiumCard variant="elevated">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold">Comparação de Professores</h2>
          {teacherComparison.length === 0 ? (
            <EmptyState icon={GraduationCap} title="Sem dados" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teacherComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#3b82f6" name="Alunos" />
                <Bar dataKey="activities" fill="#10b981" name="Atividades" />
                <Bar dataKey="avgGrade" fill="#f59e0b" name="Nota Média" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </PremiumCard>

      {/* Comparação Turma x Turma */}
      <PremiumCard variant="elevated">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold">Comparação de Turmas (Top 10)</h2>
          {classComparison.length === 0 ? (
            <EmptyState icon={Users} title="Sem turmas" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgGrade" fill="#8b5cf6" name="Nota Média" />
                <Bar dataKey="submissions" fill="#ec4899" name="Submissões" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </PremiumCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Alunos */}
        <PremiumCard variant="elevated">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Top 10 Alunos</h2>
            {studentPerformance.length === 0 ? (
              <EmptyState icon={Users} title="Sem dados" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studentPerformance}>
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

        {/* Distribuição por Tipo */}
        <PremiumCard variant="elevated">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Atividades por Tipo</h2>
            {activityTypeDistribution.length === 0 ? (
              <EmptyState icon={FileText} title="Sem atividades" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
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

export default SchoolAnalyticsPage;
