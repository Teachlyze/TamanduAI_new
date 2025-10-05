import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createClient } from '@supabase/supabase-js';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

// Icons
import { 
  Search, 
  UserPlus, 
  Users,
  UserCheck,
  RefreshCw,
  List as ListIcon,
  LayoutGrid,
  Loader2,
  FilterX,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  AlertCircle
} from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const StudentsPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [viewMode, setViewMode] = useState('table');

  // Fetch students from Supabase
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you would fetch from your Supabase tables
      // Example:
      // const { data, error } = await supabase
      //   .from('students')
      //   .select(`
      //     *,
      //     classes (id, name)
      //   `);
      
      // For now, using a timeout to simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - replace with actual Supabase data
      const mockStudents = [
        { 
          id: 1, 
          name: 'Ana Silva', 
          email: 'ana.silva@email.com', 
          phone: '(11) 99999-9999', 
          classes: ['Matemática 9A', 'Física 2B'], 
          joinDate: '2024-01-10', 
          activities: 15, 
          avgGrade: 8.5, 
          status: 'active',
          avatar: 'AS' 
        },
        { 
          id: 2, 
          name: 'Carlos Oliveira', 
          email: 'carlos.oliveira@email.com', 
          phone: '(11) 98888-8888', 
          classes: ['Português 9A', 'História 2B'], 
          joinDate: '2024-02-15', 
          activities: 12, 
          avgGrade: 7.8, 
          status: 'active',
          avatar: 'CO' 
        },
        { 
          id: 3, 
          name: 'Mariana Santos', 
          email: 'mariana.santos@email.com', 
          phone: '(11) 97777-7777', 
          classes: ['Química 9A', 'Biologia 2B'], 
          joinDate: '2024-01-20', 
          activities: 18, 
          avgGrade: 9.2, 
          status: 'active',
          avatar: 'MS' 
        },
        { 
          id: 4, 
          name: 'Pedro Henrique', 
          email: 'pedro.henrique@email.com', 
          phone: '(11) 96666-6666', 
          classes: ['Física 2B', 'Matemática 9A'], 
          joinDate: '2023-12-05', 
          activities: 20, 
          avgGrade: 8.9, 
          status: 'inactive',
          avatar: 'PH' 
        },
        { 
          id: 5, 
          name: 'Juliana Costa', 
          email: 'juliana.costa@email.com', 
          phone: '(11) 95555-5555', 
          classes: ['Geografia 9A', 'História 2B'], 
          joinDate: '2024-03-01', 
          activities: 10, 
          avgGrade: 8.1, 
          status: 'active',
          avatar: 'JC' 
        },
      ];
      
      setStudents(mockStudents);
      
      // Extract unique classes for filter
      const classes = [...new Set(mockStudents.flatMap(student => student.classes))];
      setAvailableClasses(classes);
      
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar alunos',
        description: 'Não foi possível carregar a lista de alunos. Tente novamente mais tarde.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    const matchesClass = classFilter === 'all' || 
                        student.classes.some(cls => cls === classFilter);
    
    return matchesSearch && matchesStatus && matchesClass;
  });

  // Format date to Brazilian format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  // Handle student deletion
  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.')) {
      try {
        // In a real implementation, you would call Supabase to delete the student
        // await supabase.from('students').delete().eq('id', studentId);
        
        // For now, just update the local state
        setStudents(students.filter(student => student.id !== studentId));
        
        toast({
          title: 'Aluno excluído',
          description: 'O aluno foi removido com sucesso.',
        });
      } catch (error) {
        console.error('Error deleting student:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao excluir aluno',
          description: 'Não foi possível excluir o aluno. Tente novamente mais tarde.'
        });
      }
    }
  };

  // Loading skeleton for table view
  const TableSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full mr-4" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-20 ml-4" />
          <Skeleton className="h-4 w-24 ml-4" />
          <Skeleton className="h-9 w-24 ml-4" />
        </div>
      ))}
    </div>
  );

  // Loading skeleton for grid view
  const GridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="h-full">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="mt-4 flex justify-between">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground">
            Gerencie os alunos e visualize suas informações
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/students/new')}>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Aluno
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar alunos..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas as turmas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="inline-flex items-center justify-center rounded-md bg-muted p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      className="h-9 w-9"
                    >
                      <LayoutGrid className="h-4 w-4" />
                      <span className="sr-only">Visualização em grade</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Visualização em grade</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('table')}
                      className="h-9 w-9"
                    >
                      <ListIcon className="h-4 w-4" />
                      <span className="sr-only">Visualização em tabela</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Visualização em tabela</TooltipContent>
                </Tooltip>
              </div>
              
              {(searchTerm || statusFilter !== 'all' || classFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setClassFilter('all');
                  }}
                  className="h-9"
                >
                  <FilterX className="h-4 w-4 mr-2" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            viewMode === 'table' ? <TableSkeleton /> : <GridSkeleton />
          ) : filteredStudents.length > 0 ? (
            viewMode === 'table' ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Turmas</TableHead>
                      <TableHead className="text-right">Média</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 border">
                              <AvatarImage 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4f46e5&color=fff`} 
                                alt={student.name} 
                              />
                              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                                {student.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {student.status === 'active' ? (
                                  <Badge variant="default" className="text-xs">Ativo</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">Inativo</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="truncate max-w-[180px]" title={student.email}>
                                {student.email}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-4 w-4 mr-2" />
                              {student.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {student.classes.slice(0, 2).map((cls, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {cls}
                              </Badge>
                            ))}
                            {student.classes.length > 2 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="text-xs">
                                    +{student.classes.length - 2} mais
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    {student.classes.slice(2).map((cls, i) => (
                                      <div key={i}>{cls}</div>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {student.avgGrade.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/students/edit/${student.id}`);
                              }}
                            >
                              Editar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStudent(student.id);
                              }}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 border-2 border-primary">
                          <AvatarImage 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4f46e5&color=fff`} 
                            alt={student.name} 
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                            {student.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            {student.status === 'active' ? (
                              <Badge variant="default" className="text-xs">Ativo</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Inativo</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="truncate" title={student.email}>
                            {student.email}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          {student.phone}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          Membro desde {formatDate(student.joinDate)}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Média</span>
                          <span className="font-medium">{student.avgGrade.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Atividades</span>
                          <span className="font-medium">{student.activities}</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/students/${student.id}`);
                          }}
                        >
                          Ver detalhes
                        </Button>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/students/edit/${student.id}`);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStudent(student.id);
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum aluno encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || statusFilter !== 'all' || classFilter !== 'all' 
                  ? 'Tente ajustar seus filtros de busca.' 
                  : 'Adicione um novo aluno para começar.'}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  if (searchTerm || statusFilter !== 'all' || classFilter !== 'all') {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setClassFilter('all');
                  } else {
                    navigate('/dashboard/students/new');
                  }
                }}
              >
                {searchTerm || statusFilter !== 'all' || classFilter !== 'all' 
                  ? 'Limpar filtros' 
                  : 'Adicionar Aluno'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsPage;
