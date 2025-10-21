import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import { 
  BarChart2, 
  LineChart, 
  PieChart, 
  Download, 
  Calendar, 
  Award,
  BookOpen,
  BookOpenCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
};

export const StudentReportsTab = ({ 
  student, 
  activities, 
  isLoadingActivities 
}) => {
  // Calculate statistics
  const completedActivities = activities.filter(a => a.status === 'completed').length;
  const pendingActivities = activities.filter(a => a.status === 'pending').length;
  const lateActivities = activities.filter(a => a.status === 'late').length;
  const totalActivities = activities.length;
  
  const averageGrade = totalActivities > 0 
    ? (activities.reduce((sum, a) => sum + (a.grade || 0), 0) / activities.length).toFixed(1)
    : 0;
  
  // Group activities by subject
  const activitiesBySubject = activities.reduce((acc, activity) => {
    const subjectName = activity.subject?.name || 'Outras';
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(activity);
    return acc;
  }, {});
  
  // Calculate subject statistics
  const subjectStatistics = Object.entries(activitiesBySubject).map(([subject, subjectActivities]) => {
    const completed = subjectActivities.filter(a => a.status === 'completed').length;
    const pending = subjectActivities.filter(a => a.status === 'pending').length;
    const late = subjectActivities.filter(a => a.status === 'late').length;
    const total = subjectActivities.length;
    const average = total > 0 
      ? (subjectActivities.reduce((sum, a) => sum + (a.grade || 0), 0) / total).toFixed(1)
      : 0;
    
    return {
      subject,
      total,
      completed,
      pending,
      late,
      average,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  });
  
  // Sort subjects by completion rate (highest first)
  subjectStatistics.sort((a, b) => b.completionRate - a.completionRate);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Atividades</CardDescription>
            <CardTitle className="text-3xl">
              {isLoadingActivities ? <Skeleton className="h-8 w-12" /> : totalActivities}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {isLoadingActivities ? (
                <Skeleton className="h-2 w-full mt-2" />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span>Concluídas: {completedActivities}</span>
                    <span>{totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0}%</span>
                  </div>
                  <Progress 
                    value={totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0} 
                    className="h-2" 
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Média Geral</CardDescription>
            <CardTitle className="text-3xl">
              {isLoadingActivities ? (
                <Skeleton className="h-8 w-12" />
              ) : totalActivities > 0 ? (
                <div className="flex items-center">
                  {averageGrade}
                  <span className="text-sm text-muted-foreground ml-1">/ 10</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {isLoadingActivities ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                `Atualizado em ${formatDate(new Date().toISOString())}`
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Atividades Pendentes</CardDescription>
            <CardTitle className="text-3xl">
              {isLoadingActivities ? <Skeleton className="h-8 w-12" /> : pendingActivities}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border gap-1">
                <Clock className="h-3 w-3" />
                {isLoadingActivities ? (
                  <Skeleton className="h-3 w-8" />
                ) : (
                  `${totalActivities > 0 ? Math.round((pendingActivities / totalActivities) * 100) : 0}% do total`
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Atividades Atrasadas</CardDescription>
            <CardTitle className="text-3xl">
              {isLoadingActivities ? <Skeleton className="h-8 w-12" /> : lateActivities}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                {isLoadingActivities ? (
                  <Skeleton className="h-3 w-8" />
                ) : (
                  `${totalActivities > 0 ? Math.round((lateActivities / totalActivities) * 100) : 0}% do total`
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="subjects" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="subjects" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Por Matéria
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Desempenho
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 text-foreground border-border gap-2">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
        
        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Matéria</CardTitle>
              <CardDescription>
                Visão detalhada do desempenho do aluno em cada matéria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingActivities ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : subjectStatistics.length > 0 ? (
                <div className="space-y-4">
                  {subjectStatistics.map((stats, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-md bg-primary/10 text-primary">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{stats.subject}</h3>
                            <p className="text-sm text-muted-foreground">
                              {stats.completed} de {stats.total} atividades concluídas
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{stats.average}</div>
                          <div className="text-xs text-muted-foreground">Média</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Taxa de conclusão</span>
                          <span className="font-medium">{stats.completionRate}%</span>
                        </div>
                        <Progress value={stats.completionRate} className="h-2" />
                        
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                            <span>Concluídas: {stats.completed}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
                            <span>Pendentes: {stats.pending}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                            <span>Atrasadas: {stats.late}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">Nenhum dado disponível</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Não há atividades registradas para gerar relatórios.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Desempenho</CardTitle>
              <CardDescription>
                Gráficos e métricas de desempenho ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <LineChart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Gráficos de desempenho serão exibidos aqui</p>
                <p className="text-sm">(Implementação em desenvolvimento)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
              <CardDescription>
                Cronograma e histórico completo de atividades
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Linha do tempo de atividades será exibida aqui</p>
                <p className="text-sm">(Implementação em desenvolvimento)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentReportsTab;
