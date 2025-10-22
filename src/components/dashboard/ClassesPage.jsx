import React, { createElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  Users, 
  BookOpen, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  Filter,
  TrendingUp,
  Clock,
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getUserClasses, exportClassData } from '@/services/apiSupabase';
import ClassService from '@/services/classService';
import { useUserClasses } from '@/hooks/useRedisCache';
import { useAuth } from "@/hooks/useAuth";
import useUserRole from '@/hooks/useUserRole';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getNextClassDate, formatNextClass } from '@/utils/classScheduleUtils';
// Using native browser API for file downloads

const ClassesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isTeacher } = useUserRole();

  // Use Redis cache for classes data
  const { data: classesData, loading: classesLoading, error: classesError, invalidate: invalidateClassesCache } = useUserClasses(user?.id, isTeacher ? 'teacher' : 'student');

  // Colors for class cards (cycled through)
  const classColors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
    'from-amber-500 to-amber-600',
  ];

  // Fetch classes from the database
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;

      try {
        setLoading(classesLoading);
        setError(classesError);

        if (classesData) {
          // Add color and format data for display
          const formattedClasses = classesData.map((cls, index) => {
            // Calculate next class based on weekly_schedule and dates
            const nextClassDate = getNextClassDate(cls);
            const nextClassText = formatNextClass(nextClassDate);
            
            return {
              ...cls,
              color: classColors[index % classColors.length],
              students: cls.students_count || 0,
              activities: cls.activities_count || 0,
              nextClass: nextClassText,
              nextClassDate: nextClassDate
            };
          });

          setClasses(formattedClasses);
        }
      } catch (err) {
        console.error('Error processing classes:', err);
        setError(`Falha ao processar as turmas: ${err.message}`);
        toast({
          title: 'Erro',
          description: 'Não foi possível processar as turmas.',
          variant: 'destructive',
        });
      }
    };

    fetchClasses();
  }, [user, classesData, classesLoading, classesError]);

  const handleAction = async (action, classItem = null) => {
    try {
      if (!classItem && action !== 'create') {
        console.error('No class provided for action:', action);
        return;
      }

      switch (action) {
        case 'create':
          navigate('/dashboard/classes/new');
          break;
        case 'view':
          if (classItem?.id) {
            navigate(`/dashboard/classes/${classItem.id}`);
          }
          break;
        case 'edit':
          // Implement edit functionality
          toast({
            title: 'Editar turma',
            description: `Editando turma: ${classItem?.name || 'Sem nome'}`,
          });
          break;
        case 'inviteStudent':
          // Navigate to class details with invites tab
          if (classItem?.id) {
            navigate(`/dashboard/classes/${classItem.id}?tab=invites`);
          }
          break;
          
        case 'delete':
          setClassToDelete(classItem);
          setShowDeleteDialog(true);
          break;
          
        case 'export':
          handleExport(classItem);
          break;
        case 'uploadMaterial':
          setSelectedClass(classItem);
          setShowUploadDialog(true);
          break;
        case 'students':
          // Navigate to class students tab instead of general students page
          if (classItem?.id) {
            navigate(`/dashboard/classes/${classItem.id}?tab=students`);
          }
          break;
        case 'filter':
          // Implement advanced filters logic
          toast({
            title: "Filtros",
            description: "Use os campos de busca e seleção para filtrar as turmas.",
          });
          break;
        default:
          toast({
            title: "Ação não implementada",
            description: `A ação ${action} ainda não foi implementada.`,
          });
          console.warn('Ação não implementada:', action);
          break;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    }
  };

  const handleDeleteRequest = (classItem) => {
    setClassToDelete(classItem);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (classToDelete) {
      try {
        // Backend: soft delete class
        await ClassService.deleteClass(classToDelete.id);
        // Invalidate classes cache
        await invalidateClassesCache();

        setClasses(classes.filter(c => c.id !== classToDelete.id));
        toast({
          title: "Turma removida!",
          description: `A turma "${classToDelete.name}" foi removida com sucesso.`,
        });
      } catch (error) {
        console.error('Error invalidating cache:', error);
        // Still remove from local state even if cache invalidation fails
        setClasses(classes.filter(c => c.id !== classToDelete.id));
        toast({
          title: "Turma removida!",
          description: `A turma "${classToDelete.name}" foi removida com sucesso.`,
        });
      }
    }
    setShowDeleteDialog(false);
    setClassToDelete(null);
  };


  const handleExport = async (classItem) => {
    if (!classItem) return;
    
    setIsLoading(true);
    try {
      const data = await exportClassData(classItem.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dados-turma-${classItem.name}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Exportação concluída!",
        description: `Os dados da turma foram baixados com sucesso.`,
      });
    } catch (error) {
      console.error('Error exporting class data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar os dados da turma.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadMaterial = async () => {
    if (!selectedClass || !file) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo para enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('classId', selectedClass.id);
      formData.append('uploadedBy', user.id);

      // TODO: Replace with actual API call to upload material
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Material enviado!",
        description: `O arquivo foi enviado com sucesso para a turma ${selectedClass.name}.`,
      });
      
      setShowUploadDialog(false);
      setFile(null);
    } catch (error) {
      console.error('Error uploading material:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o material. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 10MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = classes.reduce((sum, cls) => sum + cls.students, 0);
  const avgPerformance = Math.round(classes.reduce((sum, cls) => sum + cls.performance, 0) / classes.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full space-y-8 p-6">
        {/* Header com gradiente */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">Turmas</h1>
                <p className="text-blue-100 text-lg">Gerencie suas turmas e acompanhe o desempenho dos alunos</p>
              </div>
              {isTeacher && (
                <Button 
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 transition-all duration-300"
                  onClick={() => handleAction('create')}
                >
                  <Plus className="mr-2 w-5 h-5" />
                  Nova Turma
                </Button>
              )}
            </div>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </motion.div>

        {/* Cards de estatísticas */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Turmas</p>
                <p className="text-3xl font-bold text-gray-900">{classes.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Alunos</p>
                <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Performance Média</p>
                <p className="text-3xl font-bold text-gray-900">{avgPerformance}%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              placeholder="Buscar turmas..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-12 h-12 bg-white/70 backdrop-blur-sm border-white/50 rounded-xl" 
            />
          </div>
          <Button variant="outline" className="h-12 bg-white/70 backdrop-blur-sm border-white/50" onClick={() => handleAction('filter')}>
            <Filter className="mr-2 w-5 h-5" />
            Filtros
          </Button>
          {isTeacher && (
            <>
              <Button variant="outline" className="h-12 bg-white/70 backdrop-blur-sm border-white/50" onClick={() => handleAction('export')}>
                Exportar
              </Button>
              <Button variant="outline" className="h-12 bg-white/70 backdrop-blur-sm border-white/50" onClick={() => handleAction('uploadMaterial')}>
                Carregar Material
              </Button>
            </>
          )}
        </motion.div>

        {/* Classes Grid */}
        {filteredClasses.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredClasses.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {/* Class Header */}
                <div className={`bg-gradient-to-r ${classItem.color} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-bold text-xl">{classItem.name}</h3>
                        <p className="text-white/90">{classItem.subject}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Star className="w-4 h-4 text-yellow-300" />
                          <span className="text-sm font-medium">{classItem.performance}% performance</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm">
                          <DropdownMenuItem onClick={() => handleAction('view', classItem)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Visualizar</span>
                          </DropdownMenuItem>
                          {isTeacher && (
                          <DropdownMenuItem onClick={() => handleAction('edit', classItem)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          )}
                          {isTeacher && (
                          <DropdownMenuItem onClick={() => handleAction('inviteStudent', classItem)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            <span>Convidar Aluno</span>
                          </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {isTeacher && (
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => handleDeleteRequest(classItem)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Excluir</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                </div>

                {/* Class Content */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Alunos</p>
                        <p className="font-semibold text-gray-900">{classItem.students}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Atividades</p>
                        <p className="font-semibold text-gray-900">{classItem.activities}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Próxima Aula</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(classItem.nextClass).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Class Footer */}
                <div className="p-6 pt-0">
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-white/50 hover:bg-white/80 transition-all duration-300"
                      onClick={() => handleAction('view', classItem)}
                    >
                      <Eye className="mr-2 w-4 h-4" />
                      Visualizar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-white/50 hover:bg-white/80 transition-all duration-300"
                      onClick={() => handleAction('students', classItem)}
                    >
                      <UserPlus className="mr-2 w-4 h-4" />
                      Alunos
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50"
          >
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma turma encontrada</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando sua primeira turma'}
            </p>
            {!searchTerm && isTeacher && (
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                onClick={() => handleAction('create')}
              >
                <Plus className="mr-2 w-5 h-5" />
                Nova Turma
              </Button>
            )}
          </motion.div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a turma "{classToDelete?.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Sim, excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>


      {/* Upload Material Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enviar Material</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">Selecione um arquivo</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={isLoading}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formatos suportados: PDF, DOC, XLS, PPT, JPG, PNG (até 10MB)
              </p>
              {file && (
                <div className="mt-2 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadDialog(false);
                setFile(null);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUploadMaterial}
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Material'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassesPage;
