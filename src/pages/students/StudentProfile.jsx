import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Download,
  BookOpen,
  BarChart2,
  MessageSquare,
  CheckCircle,
  Users
} from 'lucide-react';
import { useStudentPerformance } from '../../hooks/useRedisCache';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: studentPerformance, loading, error } = useStudentPerformance(id);

  useEffect(() => {
    // Data from cache is already loaded by the hook
    // No need for additional API calls
    if (studentPerformance && !loading) {
      console.log('Student performance data loaded from cache:', studentPerformance);
    }
  }, [studentPerformance, loading]);

  // Transform cache data to component format
  const student = studentPerformance ? {
    id,
    name: `Aluno ${id}`,
    email: `aluno${id}@escola.com`,
    classes: studentPerformance.map((perf, index) => ({
      name: perf.class_name || `Turma ${index + 1}`,
      average: perf.average_grade || 8.5,
      total: perf.total_activities || 10,
      completed: perf.completed_activities || 9,
    })),
    grades: [
      { subject: 'Matemática 9A', activity: 'Atividade 1', grade: 9.0, date: '2024-01-10' },
      { subject: 'Matemática 9A', activity: 'Atividade 2', grade: 8.5, date: '2024-01-20' },
    ],
    feedbacks: [
      { subject: 'Matemática 9A', teacher: 'Prof. Carlos', comment: 'Excelente desempenho!', date: '2024-01-22' },
    ]
  } : null;

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!student) {
    return <div>Aluno não encontrado</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="grid gap-6">
        {/* Student Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-2xl">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{student.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{student.email}</p>
              </div>
            </div>
            <Button onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Dados
            </Button>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  student.classes.reduce((sum, cls) => sum + cls.average, 0) / 
                  student.classes.length
                ).toFixed(1)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividades</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {student.classes.reduce((sum, cls) => sum + cls.completed, 0)}/
                {student.classes.reduce((sum, cls) => sum + cls.total, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Turmas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {student.classes.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classes">
              <BookOpen className="mr-2 h-4 w-4" />
              Turmas
            </TabsTrigger>
            <TabsTrigger value="grades">
              <BarChart2 className="mr-2 h-4 w-4" />
              Notas
            </TabsTrigger>
            <TabsTrigger value="feedbacks">
              <MessageSquare className="mr-2 h-4 w-4" />
              Feedbacks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classes">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {student.classes.map((cls, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{cls.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Média: {cls.average.toFixed(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {cls.completed}/{cls.total} atividades
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((cls.completed / cls.total) * 100)}% concluído
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {student.grades.map((grade, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{grade.subject} - {grade.activity}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(grade.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {grade.grade.toFixed(1)}
                        </p>
                        <p className={`text-sm ${
                          grade.grade >= 7 ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          {grade.grade >= 7 ? 'Aprovado' : 'Recuperação'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedbacks">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {student.feedbacks.map((feedback, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{feedback.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            {feedback.teacher} • {new Date(feedback.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm">
                        {feedback.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentProfile;
