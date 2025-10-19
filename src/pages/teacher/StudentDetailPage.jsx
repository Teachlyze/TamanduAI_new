import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { 
  ArrowLeft, BarChart2, BookOpen, Award, TrendingUp, 
  MessageSquare, Loader2, AlertCircle, Trophy, Target,
  FileText, CheckCircle, Clock, Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StudentDetailPage = () => {
  const { studentId: paramStudentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Se não tem studentId na URL, usa o próprio user.id (aluno vendo seus dados)
  const studentId = paramStudentId || user?.id;
  
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [xpHistory, setXpHistory] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (studentId && user) {
      fetchStudentData();
    }
  }, [studentId, user]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // 🎯 DETECTAR NÍVEL DE ACESSO
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const userRole = currentUserProfile?.role;

      // 🔒 NÍVEL 1: ALUNO vendo seus próprios dados
      if (userRole === 'student') {
        // Aluno só pode ver seus próprios dados
        if (studentId !== user.id) {
          setHasAccess(false);
          setLoading(false);
          return;
        }
        setHasAccess(true);
        // Sem filtro - aluno vê TODAS suas turmas
        var allowedClassIds = null; // null = sem filtro
      }
      // 🔒 NÍVEL 2: PROFESSOR vendo aluno
      else if (userRole === 'teacher') {
        const { data: accessCheck } = await supabase
          .from('class_members')
          .select(`
            class_id,
            classes!inner (id, created_by)
          `)
          .eq('user_id', studentId)
          .eq('role', 'student');

        if (!accessCheck || accessCheck.length === 0) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Professor só vê turmas onde ele é o created_by
        const userOwnedClasses = accessCheck.filter(ac => 
          ac.classes.created_by === user.id
        );

        if (userOwnedClasses.length === 0) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        setHasAccess(true);
        var allowedClassIds = userOwnedClasses.map(c => c.class_id);
      }
      // 🔒 NÍVEL 3: ESCOLA vendo aluno
      else if (userRole === 'school') {
        const { data: accessCheck } = await supabase
          .from('class_members')
          .select(`
            class_id,
            classes!inner (
              id,
              school_classes!inner (school_id, schools!inner (owner_id))
            )
          `)
          .eq('user_id', studentId)
          .eq('role', 'student');

        if (!accessCheck || accessCheck.length === 0) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Escola só vê turmas da SUA escola
        const schoolOwnedClasses = accessCheck.filter(ac => 
          ac.classes?.school_classes?.schools?.owner_id === user.id
        );

        if (schoolOwnedClasses.length === 0) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        setHasAccess(true);
        var allowedClassIds = schoolOwnedClasses.map(c => c.class_id);
      }
      else {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Buscar perfil do aluno
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();

      // Buscar turmas com filtro condicional
      let classQuery = supabase
        .from('class_members')
        .select(`
          joined_at,
          classes (id, name, subject, grade_level, color)
        `)
        .eq('user_id', studentId);
      
      // Aplicar filtro apenas se não for aluno (aluno vê todas)
      if (allowedClassIds !== null) {
        classQuery = classQuery.in('class_id', allowedClassIds);
      }
      
      const { data: classData } = await classQuery;

      // Buscar submissões com filtro condicional
      let submissionsQuery = supabase
        .from('submissions')
        .select(`
          id, grade, submitted_at, status, feedback, graded_at,
          activities (
            id, title, max_score, due_date, class_id,
            classes (name, subject)
          )
        `)
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })
        .limit(50);
      
      const { data: submissionsData } = await submissionsQuery;
      
      // Filtrar submissões manualmente se necessário (para professor/escola)
      const filteredSubmissions = allowedClassIds !== null
        ? submissionsData?.filter(s => allowedClassIds.includes(s.activities?.class_id))
        : submissionsData;

      // Buscar histórico de XP (se existir tabela xp_log)
      const { data: xpData } = await supabase
        .from('xp_log')
        .select('*')
        .eq('user_id', studentId)
        .order('created_at', { ascending: false })
        .limit(100);

      setStudent(profileData);
      setClasses(classData?.map(c => c.classes) || []);
      setSubmissions(filteredSubmissions?.filter(s => s.activities) || []);
      setXpHistory(xpData || []);

      // Extrair feedbacks das submissões filtradas
      const feedbackList = filteredSubmissions
        ?.filter(s => s.feedback)
        .map(s => ({
          ...s,
          activityName: s.activities?.title,
          className: s.activities?.classes?.name
        })) || [];
      setFeedbacks(feedbackList);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar os dados do aluno'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando dados do aluno...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess || !student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
            <div className="text-muted-foreground mb-4 space-y-2">
              <p><strong>Níveis de acesso:</strong></p>
              <ul className="text-sm text-left space-y-1">
                <li>👨‍🎓 <strong>Aluno:</strong> Vê todos seus dados de todas as turmas</li>
                <li>👨‍🏫 <strong>Professor:</strong> Vê apenas dados das turmas onde é professor</li>
                <li>🏫 <strong>Escola:</strong> Vê apenas dados das turmas vinculadas à escola</li>
              </ul>
            </div>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular métricas
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter(s => s.grade !== null);
  const avgGrade = gradedSubmissions.length > 0
    ? (gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length).toFixed(1)
    : 0;
  const totalXP = xpHistory.reduce((sum, x) => sum + x.xp, 0);
  const currentLevel = Math.floor(totalXP / 100) + 1;

  // Dados para gráficos
  const gradesByClass = classes.map(cls => {
    const classSubmissions = submissions.filter(s => s.activities?.classes?.name === cls.name && s.grade !== null);
    const avg = classSubmissions.length > 0
      ? classSubmissions.reduce((sum, s) => sum + s.grade, 0) / classSubmissions.length
      : 0;
    return { name: cls.name, media: avg.toFixed(1) };
  });

  const xpBySource = xpHistory.reduce((acc, x) => {
    const source = x.source || 'Outros';
    acc[source] = (acc[source] || 0) + x.xp;
    return acc;
  }, {});

  const xpChartData = Object.entries(xpBySource).map(([name, value]) => ({ name, value }));

  const studentName = student.full_name || student.name || student.email?.split('@')[0] || 'Aluno';

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalhes do Aluno</h1>
            <p className="text-muted-foreground">Visualize o desempenho completo</p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{studentName}</h2>
                <p className="text-muted-foreground">{student.email}</p>
                <Badge className="mt-2">Aluno</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 className="w-4 h-4 text-blue-500" />
                    <p className="text-sm font-medium">Média Geral</p>
                  </div>
                  <p className="text-2xl font-bold">{avgGrade}</p>
                  <p className="text-xs text-muted-foreground">de 10.0</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    <p className="text-sm font-medium">Atividades</p>
                  </div>
                  <p className="text-2xl font-bold">{gradedSubmissions.length}</p>
                  <p className="text-xs text-muted-foreground">de {totalSubmissions} total</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <p className="text-sm font-medium">XP Total</p>
                  </div>
                  <p className="text-2xl font-bold">{totalXP}</p>
                  <p className="text-xs text-muted-foreground">Nível {currentLevel}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <p className="text-sm font-medium">Turmas</p>
                  </div>
                  <p className="text-2xl font-bold">{classes.length}</p>
                  <p className="text-xs text-muted-foreground">ativas</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="xp">XP & Gamificação</TabsTrigger>
          <TabsTrigger value="feedback">Feedbacks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Turma</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gradesByClass}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="media" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Turmas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {classes.map((cls, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{cls.name}</p>
                        <p className="text-sm text-muted-foreground">{cls.subject}</p>
                      </div>
                      <Badge>{cls.grade_level}</Badge>
                    </div>
                  ))}
                  {classes.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhuma turma encontrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades ({submissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {submissions.slice(0, 20).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{sub.activities?.title}</p>
                      <p className="text-sm text-muted-foreground">{sub.activities?.classes?.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Entregue em {new Date(sub.submitted_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      {sub.grade !== null ? (
                        <>
                          <p className="text-2xl font-bold">{sub.grade}</p>
                          <p className="text-xs text-muted-foreground">de {sub.activities?.max_score}</p>
                          <Badge className="mt-1" variant={sub.grade >= 7 ? 'default' : 'destructive'}>
                            {sub.grade >= 7 ? 'Aprovado' : 'Recuperação'}
                          </Badge>
                        </>
                      ) : (
                        <Badge variant="secondary">Aguardando correção</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {submissions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhuma atividade encontrada</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* XP Tab */}
        <TabsContent value="xp">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Origem do XP</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={xpChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {xpChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de XP (últimas 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {xpHistory.slice(0, 10).map((xp, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium">{xp.source}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(xp.created_at).toLocaleDateString('pt-BR')} às {new Date(xp.created_at).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                      <Badge className="bg-yellow-500">+{xp.xp} XP</Badge>
                    </div>
                  ))}
                  {xpHistory.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhum XP registrado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedbacks Recebidos ({feedbacks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbacks.map((fb, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{fb.activityName}</p>
                          <p className="text-sm text-muted-foreground">{fb.className}</p>
                        </div>
                        <Badge>{fb.grade}/10</Badge>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 mt-2">
                        <p className="text-sm">{fb.feedback}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {fb.graded_at ? `Corrigido em ${new Date(fb.graded_at).toLocaleDateString('pt-BR')}` : ''}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {feedbacks.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum feedback encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
                    <p className="text-2xl font-bold">
                      {totalSubmissions > 0 ? Math.round((gradedSubmissions.length / totalSubmissions) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Aproveitamento</p>
                    <p className="text-2xl font-bold">
                      {avgGrade > 0 ? Math.round((avgGrade / 10) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Engajamento</p>
                    <p className="text-2xl font-bold">
                      {xpHistory.length > 0 ? 'Alto' : 'Médio'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {avgGrade >= 8 && (
                  <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500">
                    <p className="font-medium text-green-900 dark:text-green-100">
                      🎉 Excelente desempenho! Média acima de 8.0
                    </p>
                  </div>
                )}
                {avgGrade < 6 && avgGrade > 0 && (
                  <div className="p-4 rounded-lg bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      ⚠️ Atenção: Média abaixo de 6.0. Considere um acompanhamento mais próximo.
                    </p>
                  </div>
                )}
                {totalSubmissions - gradedSubmissions.length > 5 && (
                  <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      📝 {totalSubmissions - gradedSubmissions.length} atividades pendentes de correção
                    </p>
                  </div>
                )}
                {xpHistory.length === 0 && (
                  <div className="p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 border-l-4 border-purple-500">
                    <p className="font-medium text-purple-900 dark:text-purple-100">
                      💡 Incentive o aluno a participar mais das atividades gamificadas!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDetailPage;
