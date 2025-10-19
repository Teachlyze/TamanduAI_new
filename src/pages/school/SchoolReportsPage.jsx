import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, Clock, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import schoolService from '@/services/schoolService';
import { supabase } from '@/lib/supabaseClient';

const StatCard = ({ icon: Icon, label, value, trend, color = 'blue' }) => (
  <div className={`rounded-xl border border-border/50 bg-gradient-to-br from-${color}-50 to-${color}-100/50 p-4`}>
    <div className="flex items-center gap-3">
      <div className={`rounded-lg bg-${color}-500/10 p-2`}>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
      <div className="flex-1">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold">{value}</div>
        {trend && (
          <div className={`mt-1 flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}% vs mês anterior
          </div>
        )}
      </div>
    </div>
  </div>
);

const SubjectPerformance = ({ subject, avgGrade, submissions, studentCount }) => {
  const getGradeColor = (grade) => {
    if (grade >= 9) return 'text-green-600 bg-green-100';
    if (grade >= 7) return 'text-yellow-600 bg-yellow-100';
    if (grade >= 5) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-card p-4">
      <div className="flex-1">
        <div className="font-semibold">{subject || 'Sem disciplina'}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {studentCount} alunos • {submissions} entregas
        </div>
      </div>
      <div className={`rounded-full px-3 py-1.5 text-sm font-bold ${getGradeColor(avgGrade)}`}>
        {avgGrade?.toFixed(1) || '-'}
      </div>
    </div>
  );
};

const SchoolReportsPage = () => {
  const { user } = useAuth();
  const [school, setSchool] = useState(null);
  const [stats, setStats] = useState(null);
  const [subjectStats, setSubjectStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const schoolData = await schoolService.getUserSchool(user.id);
      setSchool(schoolData);

      if (schoolData?.id) {
        // Stats gerais
        const statsData = await schoolService.getDashboardStats(schoolData.id);
        setStats(statsData);

        // Stats por disciplina
        await loadSubjectStats(schoolData.id, statsData.classIds);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectStats = async (schoolId, classIds) => {
    if (!classIds || classIds.length === 0) return;

    try {
      // Buscar turmas com subject
      const { data: classes } = await supabase
        .from('classes')
        .select('id, subject')
        .in('id', classIds);

      // Agrupar por subject
      const subjectMap = new Map();
      
      for (const cls of classes || []) {
        const subject = cls.subject || 'Sem disciplina';
        
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, {
            subject,
            classIds: [],
            studentCount: 0,
            submissions: 0,
            totalGrade: 0,
            gradeCount: 0,
          });
        }
        
        subjectMap.get(subject).classIds.push(cls.id);
      }

      // Calcular stats para cada subject
      for (const [subject, data] of subjectMap.entries()) {
        // Contar alunos
        const { count: students } = await supabase
          .from('class_members')
          .select('user_id', { count: 'exact', head: true })
          .in('class_id', data.classIds)
          .eq('role', 'student');

        data.studentCount = students || 0;

        // Buscar atividades das turmas
        const { data: activities } = await supabase
          .from('activity_class_assignments')
          .select('activity_id')
          .in('class_id', data.classIds);

        const activityIds = activities?.map(a => a.activity_id) || [];

        if (activityIds.length > 0) {
          // Contar submissões
          const { count: subs } = await supabase
            .from('submissions')
            .select('id', { count: 'exact', head: true })
            .in('activity_id', activityIds)
            .eq('status', 'submitted');

          data.submissions = subs || 0;

          // Calcular média de notas
          const { data: grades } = await supabase
            .from('submissions')
            .select('grade')
            .in('activity_id', activityIds)
            .not('grade', 'is', null);

          if (grades && grades.length > 0) {
            const sum = grades.reduce((acc, g) => acc + (g.grade || 0), 0);
            data.totalGrade = sum;
            data.gradeCount = grades.length;
          }
        }
      }

      const subjectArray = Array.from(subjectMap.values()).map(s => ({
        subject: s.subject,
        avgGrade: s.gradeCount > 0 ? s.totalGrade / s.gradeCount : null,
        submissions: s.submissions,
        studentCount: s.studentCount,
      }));

      // Ordenar por média (maior primeiro)
      subjectArray.sort((a, b) => (b.avgGrade || 0) - (a.avgGrade || 0));

      setSubjectStats(subjectArray);
    } catch (error) {
      console.error('Error loading subject stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!school) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
        <p className="text-muted-foreground">Escola não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatórios e Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Análise detalhada do desempenho de {school.name}
        </p>
      </div>

      {/* KPIs Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total de Alunos"
          value={stats?.totalStudents || 0}
          color="blue"
        />
        <StatCard
          icon={Award}
          label="Média Geral"
          value={stats?.averageGrade || '-'}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Taxa de Pontualidade"
          value={`${stats?.onTimeRate || 0}%`}
          color="purple"
        />
      </div>

      {/* Performance por Disciplina */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Desempenho por Disciplina</h3>
        </div>

        {subjectStats.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Nenhum dado disponível ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {subjectStats.map((subject, idx) => (
              <SubjectPerformance key={idx} {...subject} />
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
        <h3 className="mb-3 text-lg font-semibold">💡 Insights</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>
              {stats?.onTimeRate >= 70 
                ? `Taxa de pontualidade de ${stats.onTimeRate}% está acima da meta (70%).`
                : `Taxa de pontualidade de ${stats?.onTimeRate || 0}% está abaixo da meta. Considere incentivar entregas antecipadas.`
              }
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">ℹ</span>
            <span>
              {subjectStats.length > 0 && subjectStats[0].avgGrade
                ? `Melhor desempenho em ${subjectStats[0].subject} (média ${subjectStats[0].avgGrade.toFixed(1)}).`
                : 'Ainda não há dados suficientes para análise por disciplina.'
              }
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600">📊</span>
            <span>
              Total de {stats?.submissionsLast30Days || 0} entregas nos últimos 30 dias.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SchoolReportsPage;
