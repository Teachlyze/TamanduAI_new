import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, BookOpen, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const StudentListItem = memo(({ student, onView, onEdit, onDelete }) => {
  const statusColors = useMemo(() => ({
    active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }), []);

  const studentInitials = useMemo(() => 
    student.name.split(' ').map(n => n[0]).join(''), 
    [student.name]
  );

  const classesCount = useMemo(() => student.classes?.length || 0, [student.classes]);
  
  const statusLabel = useMemo(() => {
    switch(student.status) {
      case 'active': return 'Ativo';
      case 'pending': return 'Pendente';
      case 'inactive': return 'Inativo';
      default: return 'Pendente';
    }
  }, [student.status]);

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-primary/30 dark:hover:border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10 border border-border/50">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {studentInitials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="font-medium text-foreground">{student.name}</div>
              <div className="text-sm text-muted-foreground flex items-center flex-wrap gap-x-3 gap-y-1">
                <span className="inline-flex items-center">
                  <Mail className="mr-1.5 h-3.5 w-3.5 opacity-70" />
                  <span className="truncate max-w-[180px] md:max-w-none">{student.email}</span>
                </span>
                {student.phone && (
                  <span className="inline-flex items-center">
                    <Phone className="mr-1.5 h-3.5 w-3.5 opacity-70" />
                    <span>{student.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="mr-1 h-4 w-4" />
              {classesCount} turmas
            </div>
            
            <div className="flex flex-wrap gap-1 w-48">
              {student.classes?.slice(0, 2).map((className, idx) => (
                <Badge key={idx} variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs">
                  {className}
                </Badge>
              ))}
              {student.classes?.length > 2 && (
                <Badge variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs">
                  +{student.classes.length - 2}
                </Badge>
              )}
            </div>
            
            <Badge className={statusColors[student.status] || statusColors.inactive}>
              {statusLabel}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onView(student)}
              className="hidden md:flex hover:bg-accent/50 transition-colors"
            >
              Ver detalhes
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden"
                sideOffset={8}
              >
                <DropdownMenuItem 
                  onClick={() => onView(student)}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 transition-colors"
                >
                  <Eye className="mr-2 h-4 w-4 opacity-70" />
                  <span>Visualizar</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onEdit(student)}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 transition-colors"
                >
                  <Edit className="mr-2 h-4 w-4 opacity-70" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem 
                  className="px-3 py-2 text-sm cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 focus:bg-red-50 dark:focus:bg-red-900/30 transition-colors"
                  onClick={() => onDelete(student)}
                >
                  <Trash2 className="mr-2 h-4 w-4 opacity-70" />
                  <span>Remover</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Mobile view */}
        <div className="md:hidden mt-3 pt-3 border-t flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {classesCount} turmas
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(student)}
          >
            Ver detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

StudentListItem.displayName = 'StudentListItem';

export default StudentListItem;
