import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, LoadingScreen, EmptyState, PremiumButton, toast } from '@/components/ui';
import { User, Award, TrendingUp, BookOpen, Download, BarChart3, Target, Calendar, Trophy } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const StudentDetailPage = () => {
  const { studentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [xpLogs, setXpLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id || !studentId) return;
      try {
        // Buscar dados do aluno
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', studentId)
          .single();
        setStudent(profile);

        // Buscar turmas do aluno
        const { data: classMemberships } = await supabase
          .from('class_members')
          .select('class_id, role, joined_at, classes!inner(id, name, subject, created_by)')
          .eq('user_id', studentId)
          .eq('role', 'student')
          .eq('classes.created_by', user.id);
        
        const classesData = classMemberships?.map((m) => m.classes) || [];
        setClasses(classesData);

        const classIds = classesData.map((c) => c.id);
        if (classIds.length === 0) {
          setLoading(false);
          return;
        }

        // Buscar atividades das turmas
        const { data: acts } = await supabase
          .from('activities')
          .select('*')
          .in('class_id', classIds);
        setActivities(acts || []);

        const activityIds = acts?.map((a) => a.id) || [];

        // Buscar submissões do aluno
        const { data: subs } = await supabase
          .from('submissions')
          .select('*')
          .eq('student_id', studentId)
          .in('activity_id', activityIds);
        setSubmissions(subs || []);

        // Buscar XP logs
        const { data: logs } = await supabase
          .from('xp_log')
          .select('*')
          .eq('user_id', studentId)
          .order('created_at', { ascending: true });
        setXpLogs(logs || []);
      } catch (error) {
        console.error('Erro ao carregar dados do aluno:', error);
        toast({ title: 'Erro', description: 'Não foi possível carregar dados do aluno.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, studentId]);

  const stats = useMemo(() => {
    const totalActivities = activities.length;
    const totalSubmissions = submissions.length;
    const gradedSubs = submissions.filter((s) => s.grade != null);
    const avgGrade = gradedSubs.length > 0 ? gradedSubs.reduce((sum, s) => sum + s.grade, 0) / gradedSubs.length : 0;
    const totalXp = xpLogs.reduce((sum, log) => sum + (log.xp || 0), 0);
    const level = Math.floor(totalXp / 100) + 1;

    const onTime = submissions.filter((s) => {
      const act = activities.find((a) => a.id === s.activity_id);
      if (!act?.due_date || !s.submitted_at) return false;
      return new Date(s.submitted_at) <= new Date(act.due_date);
    }).length;

    const late = submissions.filter((s) => {
      const act = activities.find((a) => a.id === s.activity_id);
      if (!act?.due_date || !s.submitted_at) return false;
      return new Date(s.submitted_at) > new Date(act.due_date);
    }).length;

    const completionRate = totalActivities > 0 ? ((totalSubmissions / totalActivities) * 100).toFixed(1) : 0;

    return { totalActivities, totalSubmissions, avgGrade: avgGrade.toFixed(1), totalXp, level, onTime, late, completionRate };
  }, [activities, submissions, xpLogs]);

  const performanceByClass = useMemo(() => {
    return classes.map((c) => {
      const classActs = activities.filter((a) => a.class_id === c.id);
      const classSubs = submissions.filter((s) => classActs.some((a) => a.id === s.activity_id));
      const graded = classSubs.filter((s) => s.grade != null);
      const avg = graded.length > 0 ? graded.reduce((sum, s) => sum + s.grade, 0) / graded.length : 0;
      return { name: c.name, avgGrade: avg.toFixed(1), submissions: classSubs.length, activities: classActs.length };
    });
  }, [classes, activities, submissions]);

  const gradeTimeline = useMemo(() => {
    const sorted = submissions.filter((s) => s.grade != null && s.submitted_at).sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
    return sorted.slice(-10).map((s) => ({
      date: new Date(s.submitted_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      grade: s.grade,
    }));
  }, [submissions]);

  const xpTimeline = useMemo(() => {
    let cumulative = 0;
    return xpLogs.slice(-15).map((log) => {
      cumulative += log.xp || 0;
      return {
        date: new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        xp: cumulative,
      };
    });
  }, [xpLogs]);

  const performancePrediction = useMemo(() => {
    if (gradeTimeline.length < 3) return null;
    const recentGrades = gradeTimeline.slice(-5).map((g) => parseFloat(g.grade));
    const avg = recentGrades.reduce((a, b) => a + b, 0) / recentGrades.length;
    const trend = recentGrades[recentGrades.length - 1] - recentGrades[0];
    const prediction = Math.max(0, Math.min(10, avg + trend * 0.5));
    return {
      prediction: prediction.toFixed(1),
      trend: trend > 0.5 ? 'improving' : trend < -0.5 ? 'declining' : 'stable',
      confidence: recentGrades.length >= 5 ? 'Alta' : 'Média',
    };
  }, [gradeTimeline]);

  const radarData = useMemo(() => {
    const subjects = ['Participação', 'Pontualidade', 'Qualidade', 'Consistência', 'Engajamento'];
    const scores = [
      ((stats.totalSubmissions / stats.totalActivities) * 100) || 0,
      ((stats.onTime / (stats.onTime + stats.late)) * 100) || 50,
      parseFloat(stats.avgGrade) * 10 || 50,
      (submissions.filter((s) => s.grade != null).length / stats.totalSubmissions) * 100 || 50,
      (stats.totalXp / (stats.level * 100)) * 100 || 50,
    ];
    return subjects.map((subject, i) => ({ subject, score: Math.min(100, scores[i]) }));
  }, [stats, submissions]);

  const exportPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Boletim - ${student?.full_name || 'Aluno'}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Nível: ${stats.level} | XP Total: ${stats.totalXp}`, 14, 30);
    doc.text(`Média Geral: ${stats.avgGrade}`, 14, 38);
    doc.text(`Taxa de Conclusão: ${stats.completionRate}%`, 14, 46);
    
    const tableData = performanceByClass.map((p) => [p.name, p.avgGrade, `${p.submissions}/${p.activities}`]);
    doc.autoTable({
      startY: 55,
      head: [['Turma', 'Média', 'Entregas']],
      body: tableData,
    });

    doc.save(`boletim_${student?.full_name?.replace(/\s/g, '_')}.pdf`);
    toast({ title: 'Sucesso', description: 'Boletim exportado em PDF!' });
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Campo: 'Nome', Valor: student?.full_name || '' },
      { Campo: 'Email', Valor: student?.email || '' },
      { Campo: 'Nível', Valor: stats.level },
      { Campo: 'XP Total', Valor: stats.totalXp },
      { Campo: 'Média Geral', Valor: stats.avgGrade },
      { Campo: 'Taxa de Conclusão', Valor: `${stats.completionRate}%` },
      {},
      { Campo: 'Turma', Valor: 'Média', '': 'Entregas' },
      ...performanceByClass.map((p) => ({ Campo: p.name, Valor: p.avgGrade, '': `${p.submissions}/${p.activities}` })),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Boletim');
    XLSX.writeFile(wb, `boletim_${student?.full_name?.replace(/\s/g, '_')}.xlsx`);
    toast({ title: 'Sucesso', description: 'Boletim exportado em Excel!' });
  };

  if (loading) return <LoadingScreen message="Carregando detalhes do aluno..." />;
  if (!student) return <EmptyState icon={User} title="Aluno não encontrado" />;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{student.full_name}</h1>
              <p className="text-white/90">{student.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span className="font-semibold">Nível {stats.level}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{stats.totalXp} XP</span>
                </div>
              </div>
            </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Média Geral</div>
                <div className="text-2xl font-bold">{stats.avgGrade}</div>
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Entregas</div>
                <div className="text-2xl font-bold">{stats.totalSubmissions}/{stats.totalActivities}</div>
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">No Prazo / Atrasadas</div>
                <div className="text-xl font-bold text-green-600">{stats.onTime}</div>
                <div className="text-xl font-bold text-red-600">{stats.late}</div>
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
                <div className="text-2xl font-bold">{stats.completionRate}%</div>
              </div>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Turmas do Aluno */}
      <PremiumCard variant="elevated">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Turmas
          </h2>
          {classes.length === 0 ? (
            <EmptyState icon={BookOpen} title="Sem turmas" description="Este aluno não está matriculado em nenhuma turma sua." />
          ) : (
            <div className="space-y-2">
              {classes.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-muted-foreground">{c.subject}</div>
                  </div>
                  <div className="text-sm">
                    {performanceByClass.find((p) => p.name === c.name)?.avgGrade || '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PremiumCard>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Notas */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Evolução de Notas</h2>
            {gradeTimeline.length === 0 ? (
              <EmptyState icon={BarChart3} title="Sem dados" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={gradeTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="grade" stroke="#8b5cf6" strokeWidth={2} name="Nota" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </PremiumCard>

        {/* Desempenho por Turma */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Desempenho por Turma</h2>
            {performanceByClass.length === 0 ? (
              <EmptyState icon={BarChart3} title="Sem dados" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceByClass}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgGrade" fill="#3b82f6" name="Média" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </PremiumCard>

        {/* Evolução de XP */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Evolução de XP</h2>
            {xpTimeline.length === 0 ? (
              <EmptyState icon={Award} title="Sem XP" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={xpTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="xp" stroke="#10b981" strokeWidth={2} name="XP Acumulado" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </PremiumCard>

        {/* Radar de Competências */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Análise de Competências</h2>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>
      </div>

      {/* Previsão de Desempenho */}
      {performancePrediction && (
        <PremiumCard variant="elevated">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Previsão de Desempenho (IA)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Próxima Nota Estimada</div>
                <div className="text-4xl font-bold text-blue-600">{performancePrediction.prediction}</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Tendência</div>
                <div className="text-2xl font-bold capitalize">
                  {performancePrediction.trend === 'improving' ? '📈 Melhorando' : 
                   performancePrediction.trend === 'declining' ? '📉 Caindo' : '➡️ Estável'}
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Confiança da Previsão</div>
                <div className="text-2xl font-bold text-green-600">{performancePrediction.confidence}</div>
              </div>
            </div>
          </div>
        </PremiumCard>
      )}
    </div>
  );
};

export default StudentDetailPage;
