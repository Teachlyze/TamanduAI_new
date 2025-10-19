import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Icons
import { 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2,
  Clock as ClockIcon,
  BookOpen,
  BookOpenCheck,
  AlertCircle
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
};

export const StudentOverviewTab = ({ 
  student, 
  activities, 
  isLoadingActivities,
  completedActivities,
  pendingActivities,
  lateActivities,
  averageGrade
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Student Information */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Informações do Aluno</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">E-mail</Label>
              <div className="flex items-center mt-1">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <a 
                  href={`mailto:${student.email}`} 
                  className="text-foreground hover:underline hover:text-primary transition-colors"
                >
                  {student.email}
                </a>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
              <div className="flex items-center mt-1">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-foreground">{student.phone}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Data de Nascimento</Label>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-foreground">{formatDate(student.birthDate)}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Endereço</Label>
              <div className="flex items-center mt-1">
                <span className="text-foreground">{student.address}</span>
              </div>
            </div>
            
            {student.parentName && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Responsável</Label>
                <div className="mt-1">
                  <p className="text-foreground">{student.parentName}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 mr-1" />
                    <a 
                      href={`mailto:${student.parentEmail}`} 
                      className="hover:underline hover:text-primary transition-colors"
                    >
                      {student.parentEmail}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 mr-1" />
                    {student.parentPhone}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <h3 className="text-sm font-medium mb-3">Turmas</h3>
            <div className="space-y-3">
              {student.classes.map((cls) => (
                <div 
                  key={cls.id} 
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{cls.name}</h4>
                    <p className="text-sm text-muted-foreground">{cls.teacher}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {cls.schedule}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atividades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 mr-3">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Concluídas</p>
                  <p className="text-xs text-muted-foreground">
                    {completedActivities} de {activities.length}
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {activities.length > 0 ? Math.round((completedActivities / activities.length) * 100) : 0}%
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Média Geral</span>
                <span className="font-medium">{averageGrade}</span>
              </div>
              <Progress value={averageGrade * 10} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pendentes</span>
                <span className="font-medium">{pendingActivities}</span>
              </div>
              <Progress 
                value={(pendingActivities / activities.length) * 100 || 0} 
                className="h-2" 
                indicatorClassName="bg-amber-500" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Atrasadas</span>
                <span className="font-medium">{lateActivities}</span>
              </div>
              <Progress 
                value={(lateActivities / activities.length) * 100 || 0} 
                className="h-2" 
                indicatorClassName="bg-red-500" 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Próximas Atividades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingActivities ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : activities.filter(a => a.status === 'pending' || a.status === 'late').length > 0 ? (
              activities
                .filter(a => a.status === 'pending' || a.status === 'late')
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 3)
                .map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-md ${
                      activity.status === 'late' 
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30' 
                        : 'bg-blue-100 text-blue-600 dark:bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {activity.status === 'late' ? (
                        <ClockIcon className="h-5 w-5" />
                      ) : (
                        <BookOpen className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.subject?.name} • Entrega: {formatDate(activity.dueDate)}
                      </p>
                    </div>
                    <Badge 
                      variant={activity.status === 'late' ? 'destructive' : 'outline'}
                      className="whitespace-nowrap"
                    >
                      {activity.status === 'late' ? 'Atrasada' : 'Pendente'}
                    </Badge>
                  </div>
                ))
            ) : (
              <div className="text-center py-6">
                <BookOpenCheck className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma atividade pendente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentOverviewTab;

