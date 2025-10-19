import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ClassService } from '@/services/classService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EditClassScheduleCard from '@/components/classes/EditClassScheduleCard';
import ClassRecordings from '@/components/classes/ClassRecordings';
import { 
  ArrowLeft, 
  Settings, 
  Calendar, 
  Video, 
  Clock,
  Users
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const EditClassPage = () => {
  const { classId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classId) {
      loadClassData();
    }
  }, [classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const data = await ClassService.getClassById(classId);
      setClassData(data);
    } catch (error) {
      console.error('Error loading class:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar turma',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando turma...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Turma não encontrada</p>
          <Button onClick={() => navigate('/dashboard/classes')}>
            Voltar para turmas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="relative z-10">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/classes')}
              className="whitespace-nowrap inline-flex items-center gap-2 text-white hover:bg-white/20 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">{classData.name}</h1>
                <p className="text-emerald-100 text-lg">
                  {classData.subject} • {classData.academic_year}
                </p>
                {classData.is_online && (
                  <div className="flex items-center gap-2 mt-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg w-fit">
                    <Video className="w-4 h-4" />
                    <span className="text-sm font-medium">Aula Online Configurada</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                  <Users className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-sm opacity-90">Alunos</p>
                  <p className="text-2xl font-bold">{classData.members?.filter(m => m.role === 'student').length || 0}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </motion.div>

        {/* Tabs de Configuração */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="schedule" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg">
              <TabsTrigger 
                value="schedule" 
                className="whitespace-nowrap inline-flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                <Clock className="w-4 h-4" />
                <span>Horários</span>
              </TabsTrigger>
              <TabsTrigger 
                value="recordings" 
                className="whitespace-nowrap inline-flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                <Video className="w-4 h-4" />
                <span>Gravações</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="whitespace-nowrap inline-flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Horários e Cancelamentos */}
            <TabsContent value="schedule" className="space-y-6">
              <EditClassScheduleCard 
                classId={classId} 
                initialData={classData} 
              />
            </TabsContent>

            {/* Tab: Gravações */}
            <TabsContent value="recordings" className="space-y-6">
              <ClassRecordings classId={classId} />
            </TabsContent>

            {/* Tab: Configurações Gerais */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-600" />
                    Configurações da Turma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Outras configurações da turma aparecerão aqui.
                  </p>
                  {/* Aqui você pode adicionar mais configurações no futuro */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default EditClassPage;
