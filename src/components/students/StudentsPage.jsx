import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Icons
import {
  Search,
  Users,
  UserPlus,
  UserCheck,
  BarChart2,
  RefreshCw,
  FilterX,
  LayoutGrid,
  List as ListIcon,
  GraduationCap,
  Loader2
} from 'lucide-react';

// Lazy load components for better performance
  const StudentCard = lazy(() => import('./StudentCard'));
const StudentListItem = lazy(() => import('./StudentListItem'));

// Mock data - In a real app, this would come from an API
const mockStudents = [
  {
    id: 1,
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 99999-9999',
    status: 'active',
    classes: ['Matemática 9º A', 'Física 9º A'],
    avgGrade: 8.5,
    joinDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Bruno Santos',
    email: 'bruno.santos@email.com',
    phone: '(11) 88888-8888',
    status: 'active',
    classes: ['História 8º B', 'Geografia 8º B', 'Português 8º B'],
    avgGrade: 7.8,
    joinDate: '2024-02-01'
  },
  {
    id: 3,
    name: 'Carla Oliveira',
    email: 'carla.oliveira@email.com',
    phone: '(11) 77777-7777',
    status: 'pending',
    classes: ['Química 1º A'],
    avgGrade: 9.2,
    joinDate: '2024-03-10'
  },
  {
    id: 4,
    name: 'Diego Costa',
    email: 'diego.costa@email.com',
    phone: '(11) 66666-6666',
    status: 'active',
    classes: ['Biologia 2º C', 'Química 2º C'],
    avgGrade: 6.9,
    joinDate: '2024-01-20'
  },
  {
    id: 5,
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@email.com',
    phone: '(11) 55555-5555',
    status: 'inactive',
    classes: ['Inglês 7º A'],
    avgGrade: 8.1,
    joinDate: '2023-11-15'
  }
];

const StudentsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [students, setStudents] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage] = useState(12);

  // Debounced search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized calculations for better performance
  const classes = useMemo(() => {
    const allClasses = students.flatMap(student => student.classes || []);
    return [...new Set(allClasses)].sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesClass = selectedClass === 'all' || student.classes?.includes(selectedClass);
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, debouncedSearchTerm, selectedClass, statusFilter]);

  const totalPages = useMemo(() => 
    Math.ceil(filteredStudents.length / itemsPerPage), 
    [filteredStudents.length, itemsPerPage]
  );

  const getCurrentStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const getPageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  // Statistics calculations
  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    avgGrade: students.length > 0 
      ? (students.reduce((sum, s) => sum + (s.avgGrade || 0), 0) / students.length).toFixed(1)
      : '0.0',
    newStudents: students.filter(s => {
      const joinDate = new Date(s.joinDate);
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return joinDate >= lastMonth;
    }).length
  }), [students]);

  // Optimized event handlers with useCallback
  const handleViewStudent = useCallback((student) => {
    navigate(`/dashboard/students/${student.id}`);
  }, [navigate]);

  const handleEditStudent = useCallback((student) => {
    navigate(`/dashboard/students/${student.id}/edit`);
  }, [navigate]);

  const handleDeleteStudent = useCallback((student) => {
    setStudents(prev => prev.filter(s => s.id !== student.id));
    toast({
      title: 'Aluno removido',
      description: `${student.name} foi removido com sucesso.`,
    });
  }, [toast]);

  const handleAction = useCallback((action, student = null) => {
    switch (action) {
      case 'view':
        navigate(`/dashboard/students/${student.id}`);
        break;
      case 'edit':
        navigate(`/dashboard/students/${student.id}/edit`);
        break;
      case 'delete':
        handleDeleteStudent(student);
        break;
      case 'invite':
        navigate('/dashboard/students/invite');
        break;
      default:
        break;
    }
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Lista atualizada',
        description: 'A lista de alunos foi atualizada com sucesso.',
      });
    }, 1000);
  }, [toast]);

  const paginate = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedClass('all');
    setStatusFilter('all');
    setCurrentPage(1);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedClass, statusFilter]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="h-64">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) return <LoadingScreen />;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="p-6 space-y-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl text-white hover:opacity-90" />
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white hover:opacity-90">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-white hover:opacity-90">
                      Gerenciar Alunos
                    </h1>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Alunos aparecem automaticamente ao aceitar convites de turmas
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh} 
                    disabled={isLoading}
                    className="bg-white dark:bg-slate-900 text-foreground border-border bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-white/20 dark:border-gray-600/20 hover:bg-white/80 dark:hover:bg-gray-600/80"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline ml-2">Atualizar</span>
                  </Button>
                </div>
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
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total de Alunos</CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white hover:opacity-90">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+5 em relação ao mês passado</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Alunos Ativos</CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-white hover:opacity-90">
                  <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Estudando ativamente</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Média Geral</CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-white hover:opacity-90">
                  <BarChart2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgGrade}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+0.3 em relação ao mês passado</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Novos Alunos</CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white hover:opacity-90">
                  <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.newStudents}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+2 em relação ao mês passado</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Filtrar Alunos</h2>
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 z-10" />
                      <Input
                        placeholder="Buscar alunos por nome ou e-mail..."
                        className="bg-white dark:bg-slate-900 text-foreground pl-9 pr-4 py-2.5 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 w-full transition-all duration-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">Filtros:</span>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors rounded-lg">
                        <SelectValue placeholder="Todas as turmas" className="text-sm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as turmas</SelectItem>
                        {classes.map((classItem, index) => (
                          <SelectItem key={index} value={classItem}>{classItem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors rounded-lg">
                        <SelectValue placeholder="Status" className="text-sm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativos</SelectItem>
                        <SelectItem value="inactive">Inativos</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="bg-white dark:bg-slate-900 text-foreground border-border dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-lg"
                          onClick={clearFilters}
                        >
                          <FilterX className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Limpar filtros</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 ml-auto">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="icon"
                            className={viewMode === 'grid' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : ''}
                            onClick={() => setViewMode('grid')}
                          >
                            <LayoutGrid className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visualização em grade</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="icon"
                            className={viewMode === 'list' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : ''}
                            onClick={() => setViewMode('list')}
                          >
                            <ListIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visualização em lista</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl min-h-[400px]">
              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                      <p className="text-gray-600 dark:text-gray-300">Carregando alunos...</p>
                    </div>
                  </div>
                ) : getCurrentStudents.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl text-white hover:opacity-90" />
                      <Users className="relative h-16 w-16 mx-auto text-gray-400 mb-4" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhum aluno encontrado</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 mb-6">Tente ajustar sua busca ou filtros</p>
                    <Button 
                      variant="outline"
                      className="bg-white dark:bg-slate-900 text-foreground border-border bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20 hover:bg-white/80 dark:hover:bg-gray-600/80"
                      onClick={clearFilters}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Limpar filtros
                    </Button>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="space-y-6">
                    <Suspense fallback={<LoadingSkeleton />}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                          {getCurrentStudents.map((student, index) => (
                            <motion.div
                              key={student.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, delay: (index % itemsPerPage) * 0.05 }}
                              className="h-full"
                            >
                              <StudentCard
                                student={student}
                                onView={handleViewStudent}
                                onEdit={handleEditStudent}
                                onDelete={handleDeleteStudent}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </Suspense>
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-6 w-full">
                        <Pagination>
                          <PaginationContent className="flex items-center gap-1">
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                            
                            {getPageNumbers.map((pageNumber, index) => (
                              <PaginationItem key={index}>
                                {pageNumber === '...' ? (
                                  <span className="px-2 py-1">...</span>
                                ) : (
                                  <button
                                    onClick={() => paginate(pageNumber)}
                                    className={`px-3 py-1 rounded-md ${
                                      currentPage === pageNumber 
                                        ? 'bg-blue-600 text-white' 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    {pageNumber}
                                  </button>
                                )}
                              </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-xl overflow-hidden border border-white/20 dark:border-gray-600/20">
                      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50/50 dark:bg-gray-700/50 text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-white/20 dark:border-gray-600/20">
                        <div className="col-span-4">Nome</div>
                        <div className="col-span-3">Turma</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-center">Atividades</div>
                        <div className="col-span-1"></div>
                      </div>
                      <ScrollArea className="h-[500px]">
                        <div className="divide-y divide-white/10 dark:divide-gray-600/20">
                          <Suspense fallback={<LoadingSkeleton />}>
                            {getCurrentStudents.map((student, index) => (
                              <motion.div
                                key={student.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (index % itemsPerPage) * 0.03 }}
                              >
                                <StudentListItem
                                  student={student}
                                  onView={handleViewStudent}
                                  onEdit={handleEditStudent}
                                  onDelete={handleDeleteStudent}
                                />
                              </motion.div>
                            ))}
                          </Suspense>
                        </div>
                      </ScrollArea>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="flex justify-center w-full mt-4">
                        <Pagination>
                          <PaginationContent className="flex items-center gap-1">
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                            
                            {getPageNumbers.map((pageNumber, index) => (
                              <PaginationItem key={index}>
                                {pageNumber === '...' ? (
                                  <span className="px-2 py-1">...</span>
                                ) : (
                                  <button
                                    onClick={() => paginate(pageNumber)}
                                    className={`px-3 py-1 rounded-md ${
                                      currentPage === pageNumber 
                                        ? 'bg-blue-600 text-white' 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    {pageNumber}
                                  </button>
                                )}
                              </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default StudentsPage;
