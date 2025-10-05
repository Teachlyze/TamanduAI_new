import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  Typography,
  Avatar,
  LinearProgress,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  BarChart as BarChartIcon,
  Assessment as AssessmentIcon,
  Chat as ChatIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/PageHeader';

// Componentes de gráficos (serão implementados posteriormente)
const PerformanceChart = () => (
  <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
    <BarChartIcon sx={{ fontSize: 40, mb: 1 }} />
    <Typography variant="body2">Gráfico de desempenho da turma</Typography>
  </Box>
);

const AttendanceChart = () => (
  <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
    <AssessmentIcon sx={{ fontSize: 40, mb: 1 }} />
    <Typography variant="body2">Gráfico de frequência</Typography>
  </Box>
);

// Mock data - substituir por chamadas à API
const mockClassData = {
  id: 'class-1',
  name: 'Matemática Avançada',
  code: 'MAT-2023-01',
  description: 'Aulas de matemática avançada para o ensino médio',
  teacher: 'Prof. Carlos Silva',
  startDate: '2023-02-01',
  endDate: '2023-11-30',
  schedule: [
    { day: 'Segunda', time: '08:00 - 09:30' },
    { day: 'Quarta', time: '10:00 - 11:30' },
    { day: 'Sexta', time: '14:00 - 15:30' },
  ],
  students: Array(15).fill().map((_, i) => ({
    id: `student-${i + 1}`,
    name: `Aluno ${i + 1}`,
    email: `aluno${i + 1}@escola.com`,
    avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
    status: ['Ativo', 'Inativo', 'Pendente'][i % 3],
    lastAccess: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  })),
  recentActivities: [
    {
      id: 'act-1',
      type: 'assignment',
      title: 'Trabalho de Álgebra Linear',
      date: '2023-09-15T14:30:00',
      dueDate: '2023-09-30T23:59:59',
      status: 'pending',
    },
    {
      id: 'act-2',
      type: 'quiz',
      title: 'Prova de Trigonometria',
      date: '2023-09-10T10:00:00',
      score: 8.5,
      total: 10,
    },
    {
      id: 'act-3',
      type: 'material',
      title: 'Apostila de Cálculo I',
      date: '2023-09-05T08:15:00',
    },
  ],
  stats: {
    totalStudents: 25,
    activeStudents: 20,
    averageGrade: 7.8,
    attendanceRate: 92.5,
  },
};

const ClassDetailsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser } = useAuth();
  
  // State
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState('overview');
  const [anchorEl, setAnchorEl] = useState(null);
  const [studentsPage, setStudentsPage] = useState(0);
  const [activitiesPage, setActivitiesPage] = useState(0);
  const rowsPerPage = 5;
  
  // Menu actions
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleMenuAction = (action) => {
    handleMenuClose();
    switch (action) {
      case 'edit':
        navigate(`/dashboard/classes/${classId}/edit`);
        break;
      case 'delete':
        if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
          // TODO: Handle delete class
          console.log('Deleting class:', classId);
          navigate('/dashboard/classes');
        }
        break;
      case 'archive':
        // TODO: Handle archive class
        console.log('Archiving class:', classId);
        break;
      default:
        break;
    }
  };
  
  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Fetch class data
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/classes/${classId}`);
        // const data = await response.json();
        // setClassData(data);
        
        // Mock data for now
        await new Promise(resolve => setTimeout(resolve, 800));
        setClassData(mockClassData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching class data:', err);
        setError('Erro ao carregar os dados da turma');
        setLoading(false);
      }
    };
    
    fetchClassData();
  }, [classId]);
  
  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error || !classData) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error" gutterBottom>{error || 'Turma não encontrada'}</Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Voltar
        </Button>
      </Box>
    );
  }
  
  // Format date
  const formatDate = (dateString) => {
    return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo':
        return 'success';
      case 'Inativo':
        return 'error';
      case 'Pendente':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Render tab content
  const renderTabContent = () => {
    switch (tabValue) {
      case 'students':
        return (
          <Card>
            <CardHeader 
              title="Alunos Matriculados"
              action={
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/dashboard/classes/${classId}/enroll`)}
                >
                  Matricular Alunos
                </Button>
              }
            />
            <Divider />
            <List>
              {classData.students
                .slice(studentsPage * rowsPerPage, studentsPage * rowsPerPage + rowsPerPage)
                .map((student) => (
                  <ListItem key={student.id} button>
                    <ListItemAvatar>
                      <Avatar src={student.avatar} alt={student.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={student.name}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            display="block"
                          >
                            {student.email}
                          </Typography>
                          <Box display="flex" alignItems="center" mt={0.5}>
                            <Chip
                              label={student.status}
                              size="small"
                              color={getStatusColor(student.status)}
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Último acesso: {format(parseISO(student.lastAccess), 'dd/MM/yyyy')}
                            </Typography>
                          </Box>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="enviar mensagem">
                        <EmailIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
            </List>
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Mostrando {Math.min((studentsPage * rowsPerPage) + 1, classData.students.length)}-{
                  Math.min((studentsPage + 1) * rowsPerPage, classData.students.length)
                } de {classData.students.length} alunos
              </Typography>
              <Box>
                <Button
                  size="small"
                  onClick={() => setStudentsPage(p => Math.max(0, p - 1))}
                  disabled={studentsPage === 0}
                >
                  Anterior
                </Button>
                <Button
                  size="small"
                  onClick={() => setStudentsPage(p => p + 1)}
                  disabled={(studentsPage + 1) * rowsPerPage >= classData.students.length}
                  sx={{ ml: 1 }}
                >
                  Próximo
                </Button>
              </Box>
            </Box>
          </Card>
        );
        
      case 'activities':
        return (
          <Card>
            <CardHeader 
              title="Atividades Recentes"
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
            <Divider />
            <List>
              {classData.recentActivities.map((activity) => (
                <ListItem 
                  key={activity.id} 
                  button
                  onClick={() => {
                    // Navigate to activity details
                    console.log('View activity:', activity.id);
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {activity.type === 'assignment' ? (
                        <AssignmentIcon />
                      ) : activity.type === 'quiz' ? (
                        <SchoolIcon />
                      ) : (
                        <InfoIcon />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.title}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          display="block"
                        >
                          {activity.type === 'assignment' && 'Trabalho'}
                          {activity.type === 'quiz' && 'Prova'}
                          {activity.type === 'material' && 'Material de Estudo'}
                          {activity.dueDate && (
                            <Chip
                              label={`Entrega: ${format(parseISO(activity.dueDate), 'dd/MM/yyyy')}`}
                              size="small"
                              color={activity.status === 'pending' ? 'warning' : 'default'}
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                          {activity.score !== undefined && (
                            <Chip
                              label={`${activity.score}/${activity.total} pontos`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Postado em: {format(parseISO(activity.date), 'dd/MM/yyyy HH:mm')}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="mais opções">
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Box p={2} textAlign="center">
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate(`/dashboard/classes/${classId}/activities`)}
              >
                Ver todas as atividades
              </Button>
            </Box>
          </Card>
        );
        
      case 'analytics':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Desempenho da Turma" />
                <Divider />
                <CardContent>
                  <PerformanceChart />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Frequência" />
                <Divider />
                <CardContent>
                  <AttendanceChart />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Estatísticas" />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {classData.stats.totalStudents}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Alunos Matriculados
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {classData.stats.activeStudents}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Alunos Ativos
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary">
                          {classData.stats.averageGrade.toFixed(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Média da Turma
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">
                          {classData.stats.attendanceRate}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Taxa de Frequência
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
        
      case 'settings':
        return (
          <Card>
            <CardHeader title="Configurações da Turma" />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Informações Básicas</Typography>
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary">Código da Turma</Typography>
                    <Typography variant="body1" gutterBottom>{classData.code}</Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Professor</Typography>
                    <Typography variant="body1" gutterBottom>{classData.teacher}</Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Período</Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(classData.startDate)} - {formatDate(classData.endDate)}
                    </Typography>
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/dashboard/classes/${classId}/edit`)}
                  >
                    Editar Informações
                  </Button>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Horário das Aulas</Typography>
                  <List>
                    {classData.schedule.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={`${item.day} - ${item.time}`}
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button 
                    variant="outlined" 
                    startIcon={<EventIcon />}
                    onClick={() => navigate(`/dashboard/classes/${classId}/schedule`)}
                  >
                    Gerenciar Horários
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" color="error" gutterBottom>Zona de Perigo</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Ações nesta seção não podem ser desfeitas. Tenha certeza do que está fazendo.
                  </Typography>
                  
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir permanentemente esta turma? Esta ação não pode ser desfeita.')) {
                          // TODO: Handle delete class
                          console.log('Deleting class:', classId);
                          navigate('/dashboard/classes');
                        }
                      }}
                      sx={{ mr: 2 }}
                    >
                      Excluir Turma
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<GroupIcon />}
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja remover todos os alunos desta turma?')) {
                          // TODO: Handle remove all students
                          console.log('Removing all students from class:', classId);
                        }
                      }}
                    >
                      Remover Todos os Alunos
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
        
      default: // overview
        return (
          <Grid container spacing={3}>
            {/* Class Information Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Informações da Turma"
                  action={
                    <IconButton onClick={handleMenuOpen}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                />
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => handleMenuAction('edit')}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Editar Turma
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuAction('archive')}>
                    <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
                    Arquivar Turma
                  </MenuItem>
                  <Divider />
                  <MenuItem 
                    onClick={() => handleMenuAction('delete')}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Excluir Turma
                  </MenuItem>
                </Menu>
                <Divider />
                <CardContent>
                  <Typography variant="h5" gutterBottom>{classData.name}</Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {classData.description || 'Nenhuma descrição fornecida.'}
                  </Typography>
                  
                  <Box mt={3}>
                    <Box display="flex" alignItems="center" mb={1.5}>
                      <SchoolIcon color="action" sx={{ mr: 1.5 }} />
                      <div>
                        <Typography variant="subtitle2">Professor</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {classData.teacher}
                        </Typography>
                      </div>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={1.5}>
                      <EventIcon color="action" sx={{ mr: 1.5 }} />
                      <div>
                        <Typography variant="subtitle2">Período</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(classData.startDate)} - {formatDate(classData.endDate)}
                        </Typography>
                      </div>
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <PeopleIcon color="action" sx={{ mr: 1.5 }} />
                      <div>
                        <Typography variant="subtitle2">Alunos</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {classData.stats.totalStudents} alunos matriculados
                        </Typography>
                      </div>
                    </Box>
                  </Box>
                  
                  <Box mt={3}>
                    <Typography variant="subtitle2" gutterBottom>Próximas Aulas</Typography>
                    {classData.schedule.length > 0 ? (
                      <List dense>
                        {classData.schedule.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText 
                              primary={`${item.day} - ${item.time}`}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nenhum horário de aula definido.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Quick Stats */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                {/* Students Card */}
                <Grid item xs={12} sm={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.light', 
                          color: 'primary.contrastText',
                          width: 56, 
                          height: 56,
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <PeopleIcon />
                      </Avatar>
                      <Typography variant="h4" gutterBottom>
                        {classData.stats.totalStudents}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Alunos Matriculados
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        sx={{ mt: 1 }}
                        onClick={() => setTabValue('students')}
                      >
                        Gerenciar Alunos
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Activities Card */}
                <Grid item xs={12} sm={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'secondary.light', 
                          color: 'secondary.contrastText',
                          width: 56, 
                          height: 56,
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <AssignmentIcon />
                      </Avatar>
                      <Typography variant="h4" gutterBottom>
                        {classData.recentActivities.length}+
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Atividades Recentes
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="secondary"
                        sx={{ mt: 1 }}
                        onClick={() => setTabValue('activities')}
                      >
                        Ver Atividades
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Performance Card */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <BarChartIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="h6">Desempenho da Turma</Typography>
                      </Box>
                      
                      <Box mb={3}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            Média Geral
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {classData.stats.averageGrade.toFixed(1)} / 10.0
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={classData.stats.averageGrade * 10} 
                          color="primary"
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            Frequência
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {classData.stats.attendanceRate}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={classData.stats.attendanceRate} 
                          color="success"
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      
                      <Box mt={2} textAlign="center">
                        <Button 
                          variant="text" 
                          size="small"
                          onClick={() => setTabValue('analytics')}
                        >
                          Ver Análises Detalhadas
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Quick Actions */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>Ações Rápidas</Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6} sm={4}>
                          <Button 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => navigate(`/dashboard/classes/${classId}/activities/new`)}
                          >
                            Atividade
                          </Button>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Button 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            startIcon={<PeopleIcon />}
                            onClick={() => navigate(`/dashboard/classes/${classId}/enroll`)}
                          >
                            Matricular
                          </Button>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Button 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            startIcon={<EmailIcon />}
                            onClick={() => console.log('Enviar mensagem para turma')}
                          >
                            Mensagem
                          </Button>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Button 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            startIcon={<NotificationsIcon />}
                            onClick={() => console.log('Enviar notificação')}
                          >
                            Notificação
                          </Button>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Button 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            startIcon={<ChatIcon />}
                            onClick={() => console.log('Abrir chat da turma')}
                          >
                            Chat
                          </Button>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Button 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            startIcon={<EventIcon />}
                            onClick={() => navigate(`/dashboard/classes/${classId}/schedule`)}
                          >
                            Horários
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Recent Activities */}
            <Grid item xs={12}>
              <Card>
                <CardHeader 
                  title="Atividades Recentes"
                  action={
                    <Button 
                      size="small" 
                      onClick={() => setTabValue('activities')}
                    >
                      Ver Todas
                    </Button>
                  }
                />
                <Divider />
                <List>
                  {classData.recentActivities.length > 0 ? (
                    classData.recentActivities.slice(0, 3).map((activity) => (
                      <React.Fragment key={activity.id}>
                        <ListItem button>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'action.hover' }}>
                              {activity.type === 'assignment' ? (
                                <AssignmentIcon color="primary" />
                              ) : activity.type === 'quiz' ? (
                                <SchoolIcon color="secondary" />
                              ) : (
                                <InfoIcon color="disabled" />
                              )}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={activity.title}
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                  display="block"
                                >
                                  {activity.type === 'assignment' && 'Trabalho'}
                                  {activity.type === 'quiz' && 'Prova'}
                                  {activity.type === 'material' && 'Material de Estudo'}
                                  {activity.dueDate && (
                                    <Chip
                                      label={`Entrega: ${format(parseISO(activity.dueDate), 'dd/MM/yyyy')}`}
                                      size="small"
                                      color={activity.status === 'pending' ? 'warning' : 'default'}
                                      variant="outlined"
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {format(parseISO(activity.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))
                  ) : (
                    <Box p={3} textAlign="center">
                      <Typography color="text.secondary">
                        Nenhuma atividade recente
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/dashboard/classes/${classId}/activities/new`)}
                      >
                        Criar Primeira Atividade
                      </Button>
                    </Box>
                  )}
                </List>
              </Card>
            </Grid>
          </Grid>
        );
    }
  };
  
  return (
    <Box>
      <PageHeader 
        title={classData.name}
        subtitle={`Código: ${classData.code}`}
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Turmas', href: '/dashboard/classes' },
          { title: classData.name }
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
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="aba de detalhes da turma"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<InfoIcon />} 
            iconPosition="start" 
            label="Visão Geral" 
            value="overview" 
          />
          <Tab 
            icon={<PeopleIcon />} 
            iconPosition="start" 
            label={`Alunos (${classData.stats.totalStudents})`} 
            value="students" 
          />
          <Tab 
            icon={<AssignmentIcon />} 
            iconPosition="start" 
            label="Atividades" 
            value="activities" 
          />
          <Tab 
            icon={<BarChartIcon />} 
            iconPosition="start" 
            label="Estatísticas" 
            value="analytics" 
          />
          <Tab 
            icon={<SettingsIcon />} 
            iconPosition="start" 
            label="Configurações" 
            value="settings" 
          />
        </Tabs>
      </Box>
      
      {renderTabContent()}
      
      {/* Footer with class code for easy sharing */}
      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Código da turma: <strong>{classData.code}</strong> • Compartilhe este código para que os alunos possam se juntar
        </Typography>
      </Box>
    </Box>
  );
};

export default ClassDetailsPage;
