import React, { useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Icons
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  BookOpenCheck,
  Search,
  Filter,
  Download
} from 'lucide-react';

  const formatDate = (dateString) => {
  if (!dateString) return '';
  return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
};

const statusOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'completed', label: 'Concluídas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'late', label: 'Atrasadas' },
];

export const StudentActivitiesTab = ({ 
  activities, 
  isLoadingActivities,
  subjects = []
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get unique subjects from activities
  const uniqueSubjects = [
    { id: 'all', name: 'Todas as matérias' },
    ...Array.from(new Set(activities.map(a => a.subject?.name)))
      .filter(Boolean)
      .map((name, index) => ({ id: `subject-${index}`, name }))
  ];

  // Filter activities based on filters
  const filteredActivities = activities.filter(activity => {
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && activity.status === 'completed') ||
      (statusFilter === 'pending' && activity.status === 'pending') ||
      (statusFilter === 'late' && activity.status === 'late');
    
    const matchesSubject = subjectFilter === 'all' || 
      activity.subject?.name === subjectFilter;
    
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSubject && matchesSearch;
  });

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
  return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Concluída
          </Badge>
        );
      case 'late':
  return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Atrasada
          </Badge>
        );
      default:
  return (
          <Badge variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border gap-1">
            <Clock className="h-3 w-3" />
            Pendente
          </Badge>
        );
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Atividades do Aluno</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize e gerencie as atividades deste aluno
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 text-foreground border-border gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar atividades..."
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2 opacity-50" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[180px]">
                <BookOpenCheck className="h-4 w-4 mr-2 opacity-50" />
                <SelectValue placeholder="Matéria" />
              </SelectTrigger>
              <SelectContent>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Activities Table */}
        {isLoadingActivities ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center p-4 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full mr-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-20 ml-4" />
                <Skeleton className="h-9 w-24 ml-4" />
              </div>
            ))}
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Atividade</TableHead>
                  <TableHead>Matéria</TableHead>
                  <TableHead>Data de Entrega</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Nota</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${
                          activity.status === 'completed' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30' 
                            : activity.status === 'late' 
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30' 
                              : 'bg-blue-100 text-blue-600 dark:bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {activity.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.subject?.name && (
                        <Badge variant="outline">
                          {activity.subject.name}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(activity.dueDate)}</TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                    <TableCell className="text-right">
                      {activity.grade ? (
                        <span className="font-medium">{activity.grade.toFixed(1)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpenCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">Nenhuma atividade encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Nenhuma atividade corresponde aos filtros selecionados.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentActivitiesTab;

