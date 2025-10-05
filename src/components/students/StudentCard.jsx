import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, 
  Mail, 
  Phone, 
  BookOpen, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ChevronRight,
  User,
  GraduationCap,
  BarChart2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const StudentCard = ({ student, onView, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const statusConfig = {
    active: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      icon: CheckCircle2,
      label: 'Ativo'
    },
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      icon: XCircle,
      label: 'Pendente'
    },
    inactive: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      icon: XCircle,
      label: 'Inativo'
    }
  };

  const status = statusConfig[student.status] || statusConfig.inactive;
  const StatusIcon = status.icon;
  const studentInitials = student.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -4, 
        scale: 1.01,
        transition: { 
          duration: 0.2,
          ease: "easeOut"
        } 
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg dark:hover:border-primary/30 hover:shadow-primary/10 dark:hover:shadow-primary/5">
        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-primary/90 to-primary/70 text-white text-lg font-medium">
                    {studentInitials}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${status.bg}`}>
                  <StatusIcon className={`h-2.5 w-2.5 ${status.text}`} />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-lg font-semibold tracking-tight">
                  {student.name}
                </CardTitle>
                <div className="flex items-center space-x-1.5">
                  <Badge variant="secondary" className="text-xs font-normal">
                    <User className="mr-1 h-3 w-3" />
                    {student.classes?.length || 0} turmas
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <GraduationCap className="mr-1 h-3 w-3" />
                    {student.avgGrade ? `${student.avgGrade.toFixed(1)}` : 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
            
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
                  <span>Visualizar perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onEdit(student)}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 transition-colors"
                >
                  <Edit className="mr-2 h-4 w-4 opacity-70" />
                  <span>Editar aluno</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem 
                  className="px-3 py-2 text-sm cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 focus:bg-red-50 dark:focus:bg-red-900/30 transition-colors"
                  onClick={() => onDelete(student)}
                >
                  <Trash2 className="mr-2 h-4 w-4 opacity-70" />
                  <span>Remover aluno</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                      <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{student.email}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {student.phone && (
              <div className="flex items-center text-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a 
                        href={`tel:${student.phone}`} 
                        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>{student.phone}</span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Ligar para {student.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground">Turmas</span>
                <span className="text-xs text-muted-foreground">
                  {student.classes?.length || 0} turmas
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {student.classes?.slice(0, 3).map((className, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="text-xs font-normal px-2 py-0.5 hover:bg-primary/10 transition-colors"
                  >
                    {className}
                  </Badge>
                ))}
                {student.classes?.length > 3 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-0.5 cursor-default"
                        >
                          +{student.classes.length - 3}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="flex flex-col space-y-1">
                          {student.classes.slice(3).map((className, idx) => (
                            <span key={idx} className="text-xs">{className}</span>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status.bg} ${status.text}`}>
                <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                {status.label}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onView(student)}
                className="group h-8 px-3 text-sm font-medium text-primary hover:bg-primary/5"
              >
                Ver perfil
                <ChevronRight className="ml-1 h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StudentCard;
