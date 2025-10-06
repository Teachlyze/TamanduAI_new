import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  ArrowLeft,
  Download,
  BookOpen,
  BarChart2,
  MessageSquare,
  CheckCircle,
  Users,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  AlertCircle,
  FileText,
  Award,
  BookCheck,
  Loader2,
  MessageCircle
} from 'lucide-react';
import { useStudentPerformance } from '@/hooks/useRedisCache';

const StudentProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [activeTab, setActiveTab] = useState('overview');

  // Use Redis cache for student performance data
  const { data: performanceData, loading: performanceLoading, error: performanceError } = useStudentPerformance(id);

  useEffect(() => {
    // Fetch student profile data from API
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/students/${id}/profile`);
        if (!response.ok) {
          throw new Error('Failed to fetch student profile');
        }

        const studentData = await response.json();
        setStudent(studentData);

        // Log successful data fetch
        console.log(`📊 Student profile loaded for: ${studentData.name}`);
      } catch (err) {
        console.error('❌ Error fetching student profile:', err);
        setError(err.message);

        // Log error details for debugging
        console.error('🔍 Error details:', {
          studentId: id,
          error: err.message,
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudentData();
    }
  }, [id]);

  // Log performance data when it loads
  useEffect(() => {
    if (performanceData && !performanceLoading) {
      console.log(`📈 Student performance loaded for: ${student?.name || id}`);
    }
  }, [performanceData, performanceLoading, student, id]);

  // Log errors
  useEffect(() => {
    if (performanceError) {
      console.error('❌ Performance data error:', performanceError);
    }
  }, [performanceError]);

  if (loading || performanceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dados do aluno...</p>
        </div>
      </div>
    );
  }

  if (error || performanceError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive">Erro ao carregar dados</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error || performanceError || 'Ocorreu um erro inesperado'}
          </p>
        </div>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-2">
          Voltar
        </Button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
        <div className="text-center">
          <h3 className="text-lg font-medium">Aluno não encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            O aluno que você está procurando não foi encontrado ou não existe.
          </p>
        </div>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-2">
          Voltar
        </Button>
      </div>
    );
  }

  // Calculate stats from real data
  const averageGrade = student.stats?.averageGrade || 0;
  const totalActivities = student.stats?.totalActivities || 0;
  const completedActivities = student.stats?.completedActivities || 0;
  const progressPercentage = student.stats?.overallProgress || 0;

  return (
    <div className="w-full h-full p-6">
      {/* Header with back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Perfil do Aluno</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 pl-10 sm:pl-0">
            Visualize e gerencie as informações do aluno
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Enviar Mensagem</span>
          </Button>
        </div>
      </div>

      {/* Student Profile Card */}
      <Card className="mb-6 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-sm">
                  <AvatarFallback className="text-2xl font-medium bg-gradient-to-br from-primary/10 to-primary/20 text-primary">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold">{student.name}</h2>
                <p className="text-sm text-muted-foreground">{student.email}</p>
                <Badge variant="outline" className="mt-2">
                  {student.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
              <StatCard
                icon={<BarChart2 className="h-5 w-5" />}
                label="Média Geral"
                value={averageGrade.toFixed(1)}
                description={`de 10.0 pontos`}
                trend="up"
                trendValue={2.5}
              />

              <StatCard
                icon={<BookCheck className="h-5 w-5" />}
                label="Atividades"
                value={`${completedActivities}/${totalActivities}`}
                description={`${progressPercentage}% concluído`}
                progress={progressPercentage}
              />

              <StatCard
                icon={<Users className="h-5 w-5" />}
                label="Turmas"
                value={student.stats?.totalClasses || 0}
                description={`${student.stats?.totalClasses || 0} turma${(student.stats?.totalClasses || 0) !== 1 ? 's' : ''} ativa${(student.stats?.totalClasses || 0) !== 1 ? 's' : ''}`}
              />

              <StatCard
                icon={<Calendar className="h-5 w-5" />}
                label="Membro desde"
                value={new Date(student.joinDate).toLocaleDateString('pt-BR')}
                description={`${Math.floor((new Date() - new Date(student.joinDate)) / (1000 * 60 * 60 * 24 * 30))} meses`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs
        defaultValue="overview"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full sm:w-auto grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center justify-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Turmas</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Atividades</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Desempenho por Matéria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {student.classes?.length > 0 ? (
                    student.classes.map((cls) => (
                      <div key={cls.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{cls.name}</span>
                          <span className="text-sm font-medium">{cls.average.toFixed(1)}</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              cls.average >= 8 ? 'bg-green-500' :
                              cls.average >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                            } rounded-full`}
                            style={{ width: `${cls.average * 10}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progresso: {cls.progress}%</span>
                          <span>{cls.completed}/{cls.total} atividades</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma turma encontrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Últimas Atividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {student.grades?.length > 0 ? (
                    student.grades.slice(0, 3).map((grade) => (
                      <div key={grade.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${
                          grade.grade >= 8 ? 'bg-green-100 dark:bg-green-900/30' :
                          'bg-amber-100 dark:bg-amber-900/30'
                        } flex items-center justify-center`}>
                          <FileText className={`h-5 w-5 ${
                            grade.grade >= 8 ? 'text-green-600 dark:text-green-400' :
                            'text-amber-600 dark:text-amber-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{grade.subject}</h4>
                          <p className="text-sm text-muted-foreground truncate">{grade.activity}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              grade.grade >= 8 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {grade.grade.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(grade.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma atividade encontrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {student.classes?.length > 0 ? (
                  student.classes.map((cls) => {
                    const progress = cls.progress || 0;
                    const progressColor = progress >= 80 ? 'bg-green-500' :
                                        progress >= 50 ? 'bg-yellow-500' : 'bg-red-500';

                    return (
                      <div key={cls.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">{cls.name}</h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center">
                                    <Award className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                                    Média: {cls.average.toFixed(1)}
                                  </span>
                                  <span className="flex items-center">
                                    <BookCheck className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                                    {cls.completed}/{cls.total} atividades
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right min-w-[80px]">
                              <div className="text-sm font-medium">{progress}%</div>
                              <div className="text-xs text-muted-foreground">Concluído</div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ChevronRight className="h-4 w-4" />
                              <span className="sr-only">Ver detalhes</span>
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma turma encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {student.grades?.length > 0 ? (
                  student.grades.map((grade) => {
                    const isApproved = grade.grade >= 7;
                    return (
                      <div key={grade.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${
                              isApproved ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                            } flex items-center justify-center`}>
                              {isApproved ? (
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{grade.subject}</h3>
                              <p className="text-sm text-muted-foreground">{grade.activity}</p>
                              <div className="mt-1 flex items-center text-xs text-muted-foreground">
                                <Calendar className="mr-1 h-3 w-3 opacity-70" />
                                {new Date(grade.date).toLocaleDateString('pt-BR')}
                                <span className="mx-1.5">•</span>
                                <span className="capitalize">{grade.type.toLowerCase()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${
                              isApproved ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {grade.grade.toFixed(1)}
                            </div>
                            <div className={`text-xs font-medium ${
                              isApproved ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {isApproved ? 'Aprovado' : 'Recuperação'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma atividade encontrada</p>
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

export default StudentProfilePage;
