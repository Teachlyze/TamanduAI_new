import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useActivities } from '@/contexts/ActivityContext';
import { 
  Plus, 
  Search, 
  Calendar,
  Clock,
  Users,
  CheckCircle,
  BookOpen,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  FileText,
  Activity,
  Target,
  TrendingUp
} from 'lucide-react';
import useUserRole from '@/hooks/useUserRole';

const ActivitiesPage = () => {
  const navigate = useNavigate();
  const { activities, setActivities: setGlobalActivities } = useActivities();
  const { isTeacher } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

  const handleAction = (action, activity = null) => {
    switch (action) {
      case 'create':
        if (isTeacher) navigate('/dashboard/activities/new');
        break;
      case 'view':
        if (activity) {
          navigate(`/dashboard/activities/${activity.id}`);
        }
        break;
      case 'edit':
        if (isTeacher && activity) {
          navigate(`/dashboard/activities/edit/${activity.id}`);
        }
        break;
      case 'filter':
        // Lógica para filtros avançados
        toast({
          title: "Filtros",
          description: "Use os campos de busca e seleção para filtrar as atividades.",
        });
        break;
      case 'export':
        // Lógica para exportar lista de atividades
        toast({
          title: "Exportar Dados",
          description: "Exportando lista de atividades...",
        });
        // Simulando exportação
        setTimeout(() => {
          toast({
            title: "Exportação Concluída",
            description: "A lista de atividades foi exportada com sucesso!",
          });
        }, 1500);
        break;
      case 'loadMaterial':
        // Lógica para carregar material
        toast({
          title: "Carregar Material",
          description: "Selecione o arquivo para fazer upload.",
        });
        // Aqui você pode implementar a lógica para abrir um seletor de arquivos
        break;
      default:
        toast({
          title: "Ação não implementada",
          description: `A ação ${action} ainda não foi implementada.`,
        });
    }
  };

  const handleDeleteRequest = (activity) => {
    setActivityToDelete(activity);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (activityToDelete) {
      setGlobalActivities(prev => prev.filter(a => a.id !== activityToDelete.id));
      toast({
        title: "Atividade removida!",
        description: `A atividade "${activityToDelete.title}" foi removida com sucesso.`,
      });
    }
    setShowDeleteDialog(false);
    setActivityToDelete(null);
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || activity.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusClasses = {
    draft: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200',
    published: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200',
    completed: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200',
    archived: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900 dark:to-purple-800 dark:text-purple-200'
  };

  const statusIcons = {
    draft: <FileText className="w-4 h-4" />,
    published: <BookOpen className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    archived: <BookOpen className="w-4 h-4" />
  };

  const statusLabels = {
    draft: 'Rascunho',
    published: 'Publicada',
    completed: 'Concluída',
    archived: 'Arquivada'
  };

  // Stats calculation
  const totalActivities = activities.length;
  const publishedActivities = activities.filter(a => a.status === 'published').length;
  const completedActivities = activities.filter(a => a.status === 'completed').length;
  const draftActivities = activities.filter(a => a.status === 'draft').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-indigo-950 dark:via-violet-950 dark:to-purple-950">
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl" />
          <div className="p-12 rounded-3xl shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-5 bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-700 rounded-4xl shadow-4xl hover:shadow-5xl transition-all duration-700 hover:scale-130">
                    <Activity className="h-6 w-6 text-slate-900 dark:text-white" />
                  </div>
                  <h1 className="text-7xl font-black bg-gradient-to-br from-indigo-800 via-violet-800 to-purple-800 bg-clip-text text-transparent drop-shadow-3xl">
                    Atividades
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Gerencie e acompanhe as atividades da sua turma</p>
              </div>
              {isTeacher && (
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline"
                    className="shadow-sm"
                    onClick={() => navigate('/dashboard/activities/drafts')}
                  >
                    <FileText className="mr-2 w-4 h-4" />
                    Rascunhos
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => navigate('/dashboard/activities/new')}
                  >
                    <Plus className="mr-2 w-4 h-4" />
                    Nova Atividade
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total</CardTitle>
              <div className="p-4 bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 shadow-xl">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalActivities}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Atividades criadas</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Publicadas</CardTitle>
              <div className="p-4 bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-xl">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{publishedActivities}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Disponíveis para alunos</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Concluídas</CardTitle>
              <div className="p-4 bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-xl">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{completedActivities}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Finalizadas</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Rascunhos</CardTitle>
              <div className="p-4 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl border border-amber-200/50 dark:border-amber-700/50 shadow-xl">
                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{draftActivities}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Em desenvolvimento</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    placeholder="Buscar atividades..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20 focus:bg-white dark:focus:bg-gray-700"
                    aria-label="Buscar atividades"
                  />
                </div>
                
                <div className="relative inline-flex items-center">
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 border rounded-md text-sm bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white border-white/20 dark:border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Filtrar por situação"
                  >
                    <option value="all">Todas as situações</option>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <div className="absolute right-2 pointer-events-none text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => handleAction('filter')}
                  className="bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20 hover:bg-white/80 dark:hover:bg-gray-600/80"
                >
                  <Filter className="mr-2 w-4 h-4" />
                  Filtros
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Activities Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500 overflow-hidden h-full flex flex-col">
                    <div className="p-8 border-b border-slate-200/30 dark:border-slate-600/30">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{activity.description}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                            <DropdownMenuItem onClick={() => handleAction('view', activity)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Visualizar</span>
                            </DropdownMenuItem>
                            {isTeacher && (
                              <DropdownMenuItem onClick={() => handleAction('edit', activity)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {isTeacher && (
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                onClick={() => handleDeleteRequest(activity)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Excluir</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="p-8 space-y-6 flex-grow">
                      <div className="flex items-center space-x-2">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClasses[activity.status]}`}>
                          {statusIcons[activity.status]}
                          <span className="ml-1">{statusLabels[activity.status]}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Data de entrega</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(activity.dueDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Turma</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.class || 'Todas'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 border-t border-slate-200/30 dark:border-slate-600/30 bg-slate-50/60 dark:bg-slate-800/60">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20 hover:bg-white dark:hover:bg-gray-600 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 group-hover:text-white group-hover:border-transparent transition-all duration-300"
                        onClick={() => handleAction('view', activity)}
                      >
                        <Eye className="mr-2 w-4 h-4" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl">
              <div className="p-12 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="relative">
                    <div className="absolute top-4 bg-gradient-to-br from-rose-500/20 via-pink-500/20 to-red-500/20 rounded-full border border-rose-200/50 dark:border-rose-700/50 shadow-xl blur-xl" />
                    <BookOpen className="relative mx-auto h-16 w-16 text-gray-400 mb-4" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhuma atividade encontrada</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                    {searchTerm || selectedStatus !== 'all' 
                      ? 'Tente ajustar sua busca' 
                      : 'Nenhuma atividade criada ainda'
                    }
                  </p>
                  {!searchTerm && selectedStatus === 'all' && isTeacher && (
                    <Button 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => handleAction('create')}
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      Criar Primeira Atividade
                    </Button>
                  )}
                </motion.div>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a atividade &quot;{activityToDelete?.title}&quot;? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105"
              >
                Sim, excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ActivitiesPage;
