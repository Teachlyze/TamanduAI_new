import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import schoolService from '@/services/schoolService';

const Stat = ({ icon: Icon, label, value, color = 'blue', sublabel }) => (
  <div className={`rounded-2xl border border-border/50 bg-gradient-to-br from-${color}-500/5 to-${color}-600/5 p-6 shadow-sm`}>
    <div className="flex items-center gap-3">
      <div className={`rounded-lg bg-${color}-500/10 p-2`}>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
      <div className="flex-1">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-bold">{value}</div>
        {sublabel && <div className="text-xs text-muted-foreground mt-1">{sublabel}</div>}
      </div>
    </div>
  </div>
);

const SchoolDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Buscar escola do usuário
        const schoolData = await schoolService.getUserSchool(user.id);
        setSchool(schoolData);

        if (schoolData?.id) {
          // Buscar estatísticas
          const statsData = await schoolService.getDashboardStats(schoolData.id);
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error loading school dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">
          Você ainda não está vinculado a nenhuma escola. Entre em contato com o administrador.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
        <div className="flex items-center gap-4">
          {school.logo && (
            <img src={school.logo} alt={school.name} className="h-16 w-16 rounded-full bg-white/20 object-cover" />
          )}
          <div>
            <h1 className="text-3xl font-bold">{school.name}</h1>
            <p className="mt-2 text-blue-100">Visão geral de professores, turmas e desempenho da instituição.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Users}
          label="Professores vinculados"
          value={stats?.totalTeachers || 0}
          color="blue"
        />
        <Stat
          icon={GraduationCap}
          label="Alunos vinculados"
          value={stats?.totalStudents || 0}
          color="green"
        />
        <Stat
          icon={BookOpen}
          label="Turmas ativas"
          value={stats?.totalClasses || 0}
          color="purple"
        />
        <Stat
          icon={TrendingUp}
          label="Média geral"
          value={stats?.averageGrade || '-'}
          color="orange"
          sublabel="Baseado em notas lançadas"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <div className="text-lg font-semibold">Taxa de Entrega no Prazo</div>
          </div>
          <div className="text-4xl font-bold text-primary">{stats?.onTimeRate || 0}%</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Últimos 30 dias ({stats?.submissionsLast30Days || 0} entregas)
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
              style={{ width: `${stats?.onTimeRate || 0}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="mb-4 text-lg font-semibold">Ações Rápidas</div>
          <div className="space-y-2">
            <a
              href="/dashboard/school/teachers"
              className="block rounded-lg border border-border p-3 text-sm hover:bg-muted"
            >
              → Gerenciar Professores
            </a>
            <a
              href="/dashboard/school/classes"
              className="block rounded-lg border border-border p-3 text-sm hover:bg-muted"
            >
              → Gerenciar Turmas
            </a>
            <a
              href="/dashboard/school/reports"
              className="block rounded-lg border border-border p-3 text-sm hover:bg-muted"
            >
              → Ver Relatórios Detalhados
            </a>
            <a
              href="/dashboard/school/comms"
              className="block rounded-lg border border-border p-3 text-sm hover:bg-muted"
            >
              → Enviar Comunicado
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
