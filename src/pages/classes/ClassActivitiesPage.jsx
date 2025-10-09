import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Avatar,
  Badge,
  CardActionArea,
  CardActions,
  CardMedia,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Book as BookIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Event as EventIcon,
  FilterList as FilterListIcon,
  Grade as GradeIcon,
  MoreVert as MoreVertIcon,
  Pending as PendingIcon,
  Quiz as QuizIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Today as TodayIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/PageHeader';
import { useClassActivities } from '../../hooks/useRedisCache';

// Mock data - substituir por chamadas à API
const mockActivities = [
  {
    id: 'act-1',
    type: 'assignment',
    title: 'Trabalho de Álgebra Linear',
    description: 'Resolva os exercícios dos capítulos 1 e 2 do livro texto.',
    dueDate: '2023-10-15T23:59:59',
    points: 10,
    status: 'pending', // pending, submitted, graded, late
    submissionCount: 15,
    totalStudents: 25,
    createdAt: '2023-09-10T14:30:00',
    attachments: [
      { id: 'file1', name: 'enunciado.pdf', type: 'pdf', size: '2.4 MB' },
      { id: 'file2', name: 'material-apoio.docx', type: 'doc', size: '1.2 MB' },
    ],
  },
  {
    id: 'act-2',
    type: 'quiz',
    title: 'Prova de Trigonometria',
    description: 'Prova sobre identidades trigonométricas e resolução de triângulos.',
    dueDate: '2023-10-05T10:00:00',
    points: 20,
    status: 'graded',
    averageScore: 7.8,
    submissionCount: 24,
    totalStudents: 25,
    createdAt: '2023-09-01T09:15:00',
    timeLimit: 60, // minutos
    questionCount: 15,
  },
  {
    id: 'act-3',
    type: 'material',
    title: 'Apostila de Cálculo I',
    description: 'Material de apoio para a unidade de derivadas e integrais.',
    status: 'published',
    createdAt: '2023-08-28T16:45:00',
    attachments: [
      { id: 'file3', name: 'apostila-calculo.pdf', type: 'pdf', size: '5.7 MB' },
    ],
    viewCount: 42,
  },
  {
    id: 'act-4',
    type: 'assignment',
    title: 'Exercícios de Geometria Analítica',
    description: 'Lista de exercícios sobre retas e planos no espaço.',
    dueDate: '2023-09-28T23:59:59',
    points: 15,
    status: 'submitted',
    submissionCount: 18,
    totalStudents: 25,
    createdAt: '2023-09-15T11:20:00',
    isGraded: false,
  },
  {
    id: 'act-5',
    type: 'quiz',
    title: 'Questionário de Revisão',
    description: 'Perguntas sobre os tópicos da última aula.',
    dueDate: '2023-09-20T23:59:59',
    points: 5,
    status: 'pending',
    submissionCount: 10,
    totalStudents: 25,
    createdAt: '2023-09-18T08:30:00',
    timeLimit: 30,
    questionCount: 10,
  },
];

// Filtros disponíveis
const FILTER_OPTIONS = [
  { value: 'all', label: 'Todas as atividades' },
  { value: 'assignment', label: 'Trabalhos' },
  { value: 'quiz', label: 'Questionários' },
  { value: 'material', label: 'Materiais' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'submitted', label: 'Entregues' },
  { value: 'graded', label: 'Avaliados' },
  { value: 'overdue', label: 'Atrasados' },
];

// Opções de ordenação
const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais recentes primeiro' },
  { value: 'oldest', label: 'Mais antigas primeiro' },
  { value: 'dueDate', label: 'Data de entrega' },
  { value: 'title', label: 'Título (A-Z)' },
];

const ClassActivitiesPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser } = useAuth();

  // State
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [selectedItems, setSelectedItems] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterMenuEl, setFilterMenuEl] = useState(null);
  const [sortMenuEl, setSortMenuEl] = useState(null);

  // Use Redis cache for activities data
  const { data: activitiesData, loading: activitiesLoading, error: activitiesError, invalidateCache } = useClassActivities(classId);

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (!classId) return;

      try {
        setLoading(activitiesLoading);
        setError(activitiesError);

        if (activitiesData) {
          // Transform cache data to component format
          const formattedActivities = activitiesData.map((activity, index) => ({
            id: activity.id,
            type: activity.type || 'assignment',
            title: activity.title || `Atividade ${index + 1}`,
            description: activity.description || 'Sem descrição',
            dueDate: activity.due_date || null,
            points: activity.total_points || 10,
            status: activity.status || 'pending',
            submissionCount: 0, // TODO: Get from submissions table
            totalStudents: 25, // TODO: Get from class_students table
            createdAt: activity.created_at || new Date().toISOString(),
            attachments: activity.instructions ? [{ id: 'file1', name: 'instructions.txt', type: 'text', size: '1 KB' }] : [],
            isGraded: false,
          }));

          setActivities(formattedActivities);
        } else if (!activitiesLoading) {
          // Fallback to mock data if no cache and not loading
          await new Promise(resolve => setTimeout(resolve, 800));
          setActivities(mockActivities);
        }
      } catch (err) {
        console.error('Error processing activities:', err);
        setError('Erro ao processar as atividades');
      }
    };

    fetchActivities();
  }, [classId, activitiesData, activitiesLoading, activitiesError]);
  
  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let result = [...activities];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(activity => 
        activity.title.toLowerCase().includes(term) || 
        (activity.description && activity.description.toLowerCase().includes(term))
      );
    }
    
    // Apply type/status filter
    if (filter !== 'all') {
      if (['assignment', 'quiz', 'material'].includes(filter)) {
        result = result.filter(activity => activity.type === filter);
      } else {
        switch (filter) {
          case 'pending':
            result = result.filter(activity => 
              activity.dueDate && 
              isAfter(parseISO(activity.dueDate), new Date()) &&
              (!activity.submissionCount || activity.submissionCount < activity.totalStudents)
            );
            break;
          case 'submitted':
            result = result.filter(activity => 
              activity.status === 'submitted' || activity.status === 'graded'
            );
            break;
          case 'graded':
            result = result.filter(activity => activity.status === 'graded');
            break;
          case 'overdue':
            result = result.filter(activity => 
              activity.dueDate && 
              isBefore(parseISO(activity.dueDate), new Date()) &&
              (!activity.submissionCount || activity.submissionCount < activity.totalStudents)
            );
            break;
          default:
            break;
        }
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    
    return result;
  }, [activities, searchTerm, filter, sortBy]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setFilter(newValue === 'all' ? 'all' : newValue);
  };
  
  // Handle menu actions
  const handleMenuOpen = (event, activityId) => {
    setAnchorEl(event.currentTarget);
    // Store the activity ID in the menu element's dataset
    event.currentTarget.dataset.activityId = activityId;
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleMenuAction = (action) => {
    const activityId = anchorEl?.dataset?.activityId;
    handleMenuClose();
    
    if (!activityId) return;
    
    switch (action) {
      case 'view':
        navigate(`/dashboard/classes/${classId}/activities/${activityId}`);
        break;
      case 'edit':
        navigate(`/dashboard/classes/${classId}/activities/${activityId}/edit`);
        break;
      case 'grade':
        navigate(`/dashboard/classes/${classId}/activities/${activityId}/grade`);
        break;
      case 'duplicate':
        // TODO: Handle duplicate action
        console.log('Duplicate activity:', activityId);
        break;
      case 'delete':
        if (window.confirm('Tem certeza que deseja excluir esta atividade?')) {
          // TODO: Handle delete action
          console.log('Delete activity:', activityId);
          setActivities(prev => prev.filter(a => a.id !== activityId));
        }
        break;
      default:
        break;
    }
  };
  
  // Handle bulk actions
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedItems(filteredActivities.map(activity => activity.id));
    } else {
      setSelectedItems([]);
    }
  };
  
  const handleSelectItem = (event, id) => {
    const selectedIndex = selectedItems.indexOf(id);
    let newSelected = [];
    
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedItems, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedItems.slice(1));
    } else if (selectedIndex === selectedItems.length - 1) {
      newSelected = newSelected.concat(selectedItems.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedItems.slice(0, selectedIndex),
        selectedItems.slice(selectedIndex + 1)
      );
    }
    
    setSelectedItems(newSelected);
  };
  
  // Handle bulk action
  const handleBulkAction = (action) => {
    switch (action) {
      case 'delete':
        if (window.confirm(`Tem certeza que deseja excluir as ${selectedItems.length} atividades selecionadas?`)) {
          // TODO: Handle bulk delete
          console.log('Delete activities:', selectedItems);
          setActivities(prev => prev.filter(a => !selectedItems.includes(a.id)));
          setSelectedItems([]);
        }
        break;
      case 'publish':
        // TODO: Handle bulk publish
        console.log('Publish activities:', selectedItems);
        setSelectedItems([]);
        break;
      case 'unpublish':
        // TODO: Handle bulk unpublish
        console.log('Unpublish activities:', selectedItems);
        setSelectedItems([]);
        break;
      default:
        break;
    }
  };
  
  // Get activity status
  const getActivityStatus = (activity) => {
    if (!activity.dueDate) return null;
    
    const dueDate = parseISO(activity.dueDate);
    const isOverdue = isBefore(dueDate, new Date());
    
    if (activity.status === 'graded') {
      return { text: 'Avaliado', color: 'success' };
    }
    
    if (activity.status === 'submitted') {
      return { text: 'Entregue', color: 'info' };
    }
    
    if (isOverdue) {
      return { text: 'Atrasado', color: 'error' };
    }
    
    if (isToday(dueDate)) {
      return { text: 'Vence hoje', color: 'warning' };
    }
    
    return null;
  };
  
  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <AssignmentIcon />;
      case 'quiz':
        return <QuizIcon />;
      case 'material':
        return <BookIcon />;
      default:
        return <DescriptionIcon />;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(parseISO(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };
  
  // Render activity card (grid view)
  const renderActivityCard = (activity) => {
    const status = getActivityStatus(activity);
    const isSelected = selectedItems.includes(activity.id);
    
    return (
      <Card 
        key={activity.id}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
          borderColor: 'divider',
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardActionArea 
          component="div"
          onClick={() => navigate(`/dashboard/classes/${classId}/activities/${activity.id}`)}
          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
        >
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                {getActivityIcon(activity.type)}
              </Avatar>
            }
            action={
              <Checkbox
                checked={isSelected}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleSelectItem(e, activity.id)}
                inputProps={{ 'aria-label': 'selecionar atividade' }}
                sx={{ p: 1 }}
              />
            }
            title={
              <Typography variant="subtitle1" noWrap sx={{ width: '100%' }}>
                {activity.title}
              </Typography>
            }
            subheader={
              <Typography variant="body2" color="text.secondary" noWrap>
                {activity.type === 'assignment' ? 'Trabalho' : 
                 activity.type === 'quiz' ? 'Questionário' : 'Material'}
              </Typography>
            }
            sx={{ width: '100%', p: 1.5, pb: 0 }}
          />
          
          <CardContent sx={{ width: '100%', p: 2, pt: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1.5,
              minHeight: 60
            }}>
              {activity.description || 'Sem descrição'}
            </Typography>
            
            {activity.dueDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {format(parseISO(activity.dueDate), "dd/MM/yyyy 'às' HH:mm")}
                </Typography>
              </Box>
            )}
            
            {activity.points > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GradeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {activity.points} {activity.points === 1 ? 'ponto' : 'pontos'}
                </Typography>
              </Box>
            )}
            
            {activity.type === 'quiz' && activity.timeLimit && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TodayIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {activity.timeLimit} min • {activity.questionCount} perguntas
                </Typography>
              </Box>
            )}
            
            {status && (
              <Chip
                label={status.text}
                size="small"
                color={status.color}
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
            
            {activity.attachments && activity.attachments.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Anexos ({activity.attachments.length}):
                </Typography>
                {activity.attachments.slice(0, 2).map((file, index) => (
                  <Chip
                    key={file.id}
                    icon={<DescriptionIcon />}
                    label={`${file.name} (${file.size})`}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 0.5, mb: 0.5, maxWidth: '100%' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Handle file download
                      console.log('Download file:', file.id);
                    }}
                  />
                ))}
                {activity.attachments.length > 2 && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    +{activity.attachments.length - 2} mais
                  </Typography>
                )}
              </Box>
            )}
            
            {activity.type === 'assignment' && activity.submissionCount !== undefined && (
              <Box sx={{ mt: 2, mb: 1 }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Entregas
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.submissionCount}/{activity.totalStudents}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(activity.submissionCount / activity.totalStudents) * 100} 
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            )}
            
            {activity.type === 'quiz' && activity.averageScore !== undefined && (
              <Box sx={{ mt: 2, mb: 1 }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Média da turma
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.averageScore.toFixed(1)}/{activity.points}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(activity.averageScore / activity.points) * 100} 
                  color={activity.averageScore >= (activity.points * 0.7) ? 'success' : 'primary'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            )}
          </CardContent>
        </CardActionArea>
        
        <Divider />
        
        <CardActions sx={{ p: 1, justifyContent: 'space-between' }}>
          <Box>
            {activity.type === 'assignment' && (
              <Tooltip title="Ver entregas">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/classes/${classId}/activities/${activity.id}/submissions`);
                  }}
                >
                  <AssignmentTurnedInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {activity.type === 'quiz' && activity.averageScore !== undefined && (
              <Tooltip title="Ver resultados">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/classes/${classId}/activities/${activity.id}/results`);
                  }}
                >
                  <BarChartIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {activity.viewCount !== undefined && (
              <Tooltip title={`Visualizado ${activity.viewCount} vezes`}>
                <Box display="inline-flex" alignItems="center" ml={1} color="text.secondary">
                  <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    {activity.viewCount}
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
          
          <Box>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, activity.id);
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardActions>
      </Card>
    );
  };
  
  // Render activity list item (list view)
  const renderActivityListItem = (activity) => {
    const status = getActivityStatus(activity);
    const isSelected = selectedItems.includes(activity.id);
    
    return (
      <React.Fragment key={activity.id}>
        <ListItem 
          sx={{
            p: 0,
            bgcolor: isSelected ? 'action.selected' : 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            mb: 1,
            borderRadius: 1,
            overflow: 'hidden',
            '&:hover': {
              boxShadow: theme.shadows[1],
            },
          }}
          secondaryAction={
            <Box display="flex" alignItems="center">
              {activity.dueDate && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mr: 2,
                    display: { xs: 'none', md: 'block' },
                    whiteSpace: 'nowrap',
                  }}
                >
                  {format(parseISO(activity.dueDate), "dd/MM/yyyy 'às' HH:mm")}
                </Typography>
              )}
              
              {status && (
                <Chip
                  label={status.text}
                  size="small"
                  color={status.color}
                  variant="outlined"
                  sx={{ mr: 1, display: { xs: 'none', sm: 'flex' } }}
                />
              )}
              
              <Checkbox
                checked={isSelected}
                onChange={(e) => handleSelectItem(e, activity.id)}
                onClick={(e) => e.stopPropagation()}
                inputProps={{ 'aria-label': 'selecionar atividade' }}
                sx={{ p: 1 }}
              />
              
              <IconButton 
                edge="end" 
                aria-label="mais opções"
                onClick={(e) => handleMenuOpen(e, activity.id)}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          }
        >
          <ListItemButton
            component="div"
            onClick={() => navigate(`/dashboard/classes/${classId}/activities/${activity.id}`)}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Checkbox
                checked={isSelected}
                tabIndex={-1}
                disableRipple
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectItem(e, activity.id);
                }}
                inputProps={{ 'aria-label': 'selecionar atividade' }}
                sx={{ p: 0, mr: 1 }}
              />
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                {getActivityIcon(activity.type)}
              </Avatar>
            </ListItemIcon>
            
            <ListItemText
              primary={
                <Typography variant="subtitle1" noWrap>
                  {activity.title}
                </Typography>
              }
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: 'inline', mr: 1 }}
                  >
                    {activity.type === 'assignment' ? 'Trabalho' : 
                     activity.type === 'quiz' ? 'Questionário' : 'Material'}
                  </Typography>
                  {activity.points > 0 && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'inline', mr: 1 }}>
                      • {activity.points} {activity.points === 1 ? 'ponto' : 'pontos'}
                    </Typography>
                  )}
                  {activity.type === 'quiz' && activity.timeLimit && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'inline' }}>
                      • {activity.timeLimit} min • {activity.questionCount} perguntas
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {activity.description || 'Sem descrição'}
                  </Typography>
                </>
              }
              secondaryTypographyProps={{ component: 'div' }}
              sx={{
                mr: 2,
                '& .MuiListItemText-primary': {
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            />
            
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end', ml: 2 }}>
              {activity.type === 'assignment' && activity.submissionCount !== undefined && (
                <Tooltip title={`${activity.submissionCount} de ${activity.totalStudents} alunos entregaram`}>
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <AssignmentTurnedInIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {activity.submissionCount}/{activity.totalStudents}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              
              {activity.type === 'quiz' && activity.averageScore !== undefined && (
                <Tooltip title={`Média da turma: ${activity.averageScore.toFixed(1)}/${activity.points}`}>
                  <Box display="flex" alignItems="center">
                    <GradeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {activity.averageScore.toFixed(1)}/{activity.points}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              
              {activity.viewCount !== undefined && (
                <Tooltip title={`Visualizado ${activity.viewCount} vezes`}>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <VisibilityIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {activity.viewCount}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>
          </ListItemButton>
        </ListItem>
      </React.Fragment>
    );
  };
  
  return (
    <Box>
      <PageHeader 
        title="Atividades da Turma"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Turmas', href: '/dashboard/classes' },
          { title: classId, href: `/dashboard/classes/${classId}` },
          { title: 'Atividades' }
        ]}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/dashboard/classes/${classId}/activities/new`)}
          >
            Nova Atividade
          </Button>
        }
      />
      
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Buscar atividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  endAdornment: searchTerm && (
                    <IconButton 
                      size="small" 
                      onClick={() => setSearchTerm('')}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={8}>
              <Box display="flex" justifyContent="flex-end" flexWrap="wrap" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterListIcon />}
                  onClick={(e) => setFilterMenuEl(e.currentTarget)}
                  sx={{ textTransform: 'none' }}
                >
                  {FILTER_OPTIONS.find(f => f.value === filter)?.label || 'Filtrar'}
                </Button>
                
                <Menu
                  anchorEl={filterMenuEl}
                  open={Boolean(filterMenuEl)}
                  onClose={() => setFilterMenuEl(null)}
                >
                  <MenuItem disabled>
                    <Typography variant="subtitle2" color="text.secondary">
                      Filtrar por tipo
                    </Typography>
                  </MenuItem>
                  {FILTER_OPTIONS.map((option) => (
                    <MenuItem 
                      key={option.value} 
                      selected={filter === option.value}
                      onClick={() => {
                        setFilter(option.value);
                        setFilterMenuEl(null);
                      }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Menu>
                
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SortIcon />}
                  onClick={(e) => setSortMenuEl(e.currentTarget)}
                  sx={{ textTransform: 'none' }}
                >
                  {SORT_OPTIONS.find(s => s.value === sortBy)?.label || 'Ordenar'}
                </Button>
                
                <Menu
                  anchorEl={sortMenuEl}
                  open={Boolean(sortMenuEl)}
                  onClose={() => setSortMenuEl(null)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <MenuItem 
                      key={option.value} 
                      selected={sortBy === option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setSortMenuEl(null);
                      }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Menu>
                
                <Box display="flex" border={1} borderColor="divider" borderRadius={1}>
                  <Tooltip title="Visualização em lista">
                    <IconButton 
                      size="small" 
                      onClick={() => setViewMode('list')}
                      color={viewMode === 'list' ? 'primary' : 'default'}
                      sx={{ 
                        borderRadius: 0,
                        borderTopLeftRadius: 4,
                        borderBottomLeftRadius: 4,
                      }}
                    >
                      <ViewListIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Divider orientation="vertical" flexItem />
                  
                  <Tooltip title="Visualização em grade">
                    <IconButton 
                      size="small" 
                      onClick={() => setViewMode('grid')}
                      color={viewMode === 'grid' ? 'primary' : 'default'}
                      sx={{ 
                        borderRadius: 0,
                        borderTopRightRadius: 4,
                        borderBottomRightRadius: 4,
                      }}
                    >
                      <ViewModuleIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTabs-flexContainer': {
              borderBottom: 'none',
            },
          }}
        >
          <Tab 
            label="Todas" 
            value="all" 
            sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }}
          />
          <Tab 
            label="Trabalhos" 
            value="assignment" 
            icon={<AssignmentIcon fontSize="small" sx={{ mb: 0, mr: 0.5 }} />}
            iconPosition="start"
            sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }}
          />
          <Tab 
            label="Questionários" 
            value="quiz" 
            icon={<QuizIcon fontSize="small" sx={{ mb: 0, mr: 0.5 }} />}
            iconPosition="start"
            sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }}
          />
          <Tab 
            label="Materiais" 
            value="material" 
            icon={<BookIcon fontSize="small" sx={{ mb: 0, mr: 0.5 }} />}
            iconPosition="start"
            sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }}
          />
          <Tab 
            label="Pendentes" 
            value="pending" 
            icon={<PendingIcon fontSize="small" sx={{ mb: 0, mr: 0.5 }} />}
            iconPosition="start"
            sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }}
          />
          <Tab 
            label="Atrasados" 
            value="overdue" 
            icon={<WarningIcon fontSize="small" color="error" sx={{ mb: 0, mr: 0.5 }} />}
            iconPosition="start"
            sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }}
          />
        </Tabs>
      </Card>
      
      {selectedItems.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: 'action.selected' }}>
          <CardContent sx={{ p: 1.5 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <Checkbox
                  checked={selectedItems.length === filteredActivities.length}
                  indeterminate={
                    selectedItems.length > 0 && selectedItems.length < filteredActivities.length
                  }
                  onChange={handleSelectAll}
                  inputProps={{ 'aria-label': 'selecionar todas as atividades' }}
                  sx={{ mr: 1 }}
                />
                <Typography variant="subtitle2">
                  {selectedItems.length} {selectedItems.length === 1 ? 'atividade selecionada' : 'atividades selecionadas'}
                </Typography>
              </Box>
              
              <Box>
                <Button 
                  size="small" 
                  startIcon={<DeleteIcon />}
                  onClick={() => handleBulkAction('delete')}
                  sx={{ mr: 1 }}
                >
                  Excluir
                </Button>
                <Button 
                  size="small" 
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleBulkAction('publish')}
                  sx={{ mr: 1 }}
                >
                  Publicar
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  startIcon={<CloseIcon />}
                  onClick={() => setSelectedItems([])}
                >
                  Cancelar
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : filteredActivities.length === 0 ? (
        <Box textAlign="center" py={6}>
          <DescriptionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma atividade encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {searchTerm || filter !== 'all' 
              ? 'Tente ajustar sua busca ou filtros.'
              : 'Comece criando uma nova atividade para esta turma.'}
          </Typography>
          {!searchTerm && filter === 'all' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/dashboard/classes/${classId}/activities/new`)}
              sx={{ mt: 2 }}
            >
              Criar Primeira Atividade
            </Button>
          )}
        </Box>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredActivities.map(activity => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={activity.id}>
              {renderActivityCard(activity)}
            </Grid>
          ))}
        </Grid>
      ) : (
        <List disablePadding>
          {filteredActivities.map(activity => renderActivityListItem(activity))}
        </List>
      )}
      
      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleMenuAction('view')}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Visualizar</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleMenuAction('grade')}>
          <ListItemIcon>
            <GradeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Avaliar</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => handleMenuAction('duplicate')}>
          <ListItemIcon>
            <FileCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicar</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => handleMenuAction('delete')}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ClassActivitiesPage;
