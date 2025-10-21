import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Today as TodayIcon,
  ChevronLeft,
  ChevronRight,
  FilterList as FilterListIcon,
  ViewWeek as ViewWeekIcon,
  ViewDay as ViewDayIcon,
  ViewAgenda as ViewAgendaIcon,
} from '@mui/icons-material';
import { format, addDays, startOfWeek, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/PageHeader';

// Mock data - replace with API calls
const mockClasses = [
  { id: 'class-1', name: 'Matemática Avançada', color: '#3f51b5' },
  { id: 'class-2', name: 'Português', color: '#f44336' },
  { id: 'class-3', name: 'História', color: '#4caf50' },
  { id: 'class-4', name: 'Geografia', color: '#ff9800' },
  { id: 'class-5', name: 'Ciências', color: '#9c27b0' },
];

const mockSchedule = [
  {
    id: 'sched-1',
    classId: 'class-1',
    dayOfWeek: 1, // Monday
    startTime: '08:00',
    endTime: '09:30',
    room: 'Sala 101',
    teacher: 'Prof. Silva',
  },
  {
    id: 'sched-2',
    classId: 'class-2',
    dayOfWeek: 1,
    startTime: '10:00',
    endTime: '11:30',
    room: 'Sala 102',
    teacher: 'Prof. Oliveira',
  },
  // Add more mock data as needed
];

const timeSlots = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

daysOfWeek.map(day => ({
  day,
  date: addDays(startDate, day.index),
  name: format(addDays(startDate, day.index), 'EEEE', { locale: ptBR }),
  shortName: format(addDays(startDate, day.index), 'EEE', { locale: ptBR }),
  dayNumber: format(addDays(startDate, day.index), 'd'),
  month: format(addDays(startDate, day.index), 'MMM', { locale: ptBR }),
}));

const ClassSchedulePage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser } = useAuth();
  
  // State
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('week'); // 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { locale: ptBR }));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({
    classId: '',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:00',
    room: '',
    teacher: '',
  });
  
  // Fetch schedule data
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/classes/${classId}/schedule`);
        // const data = await response.json();
        // setSchedule(data);
        
        // Mock data for now
        setSchedule(mockSchedule);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setError('Erro ao carregar a grade horária');
        setLoading(false);
      }
    };
    
    fetchSchedule();
  }, [classId]);
  
  // Handle dialog open/close
  const handleOpenDialog = (scheduleItem = null) => {
    if (scheduleItem) {
      setFormData({
        ...scheduleItem,
        dayOfWeek: scheduleItem.dayOfWeek || 1,
      });
      setSelectedClass(scheduleItem.classId);
    } else {
      setFormData({
        classId: '',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
        room: '',
        teacher: '',
      });
      setSelectedClass('');
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass('');
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual API call
      console.log('Submitting schedule:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state (replace with actual API response)
      if (formData.id) {
        // Update existing
        setSchedule(prev => 
          prev.map(item => 
            item.id === formData.id ? { ...formData } : item
          )
        );
      } else {
        // Add new
        const newSchedule = {
          ...formData,
          id: `sched-${Date.now()}`,
          classId: selectedClass,
        };
        setSchedule(prev => [...prev, newSchedule]);
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving schedule:', err);
      setError('Erro ao salvar o horário');
    }
  };
  
  // Handle delete schedule
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este horário?')) {
      try {
        // TODO: Replace with actual API call
        console.log('Deleting schedule:', id);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update local state
        setSchedule(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error('Error deleting schedule:', err);
        setError('Erro ao excluir o horário');
      }
    }
  };
  
  // Navigation
  const handlePrevWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7));
  };
  
  const handleNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };
  
  const handleToday = () => {
    setCurrentWeek(startOfWeek(new Date(), { locale: ptBR }));
    setSelectedDate(new Date());
  };
  
  // Get class by ID
  const getClassById = (id) => {
    return mockClasses.find(c => c.id === id) || { name: 'Desconhecida', color: '#999' };
  };
  
  // Get schedule for a specific day and time
  const getScheduleForDayAndTime = (dayIndex, time) => {
    return schedule.filter(item => {
      return item.dayOfWeek === dayIndex && item.startTime <= time && item.endTime > time;
    })[0]; // Return first matching schedule item or undefined
  };
  
  // Render week view
  const renderWeekView = () => {
    const days = [];
    
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const currentDay = addDays(currentWeek, i);
      const daySchedule = schedule.filter(item => item.dayOfWeek === i + 1);
      
      days.push(
        <Grid item xs={12} key={`day-${i}`}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                {format(currentDay, 'EEEE', { locale: ptBR })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                {format(currentDay, 'dd/MM', { locale: ptBR })}
              </Typography>
              <Box flexGrow={1} />
              <Tooltip title="Adicionar horário">
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog({ dayOfWeek: i + 1 })}
                  color="primary"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {daySchedule.length === 0 ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  py: 4,
                  border: `1px dashed ${theme.palette.divider}`,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Nenhuma aula agendada
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog({ dayOfWeek: i + 1 })}
                >
                  Adicionar Aula
                </Button>
              </Box>
            ) : (
              <Grid container spacing={1}>
                {daySchedule.map((item) => {
                  const classInfo = getClassById(item.classId);
                  return (
                    <Grid item xs={12} key={item.id}>
                      <Card 
                        variant="outlined"
                        sx={{
                          borderLeft: `4px solid ${classInfo.color}`,
                          '&:hover': {
                            boxShadow: theme.shadows[2],
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease-in-out',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box display="flex" alignItems="flex-start">
                            <Box flexGrow={1}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                                {classInfo.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.startTime} - {item.endTime}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.room} • {item.teacher}
                              </Typography>
                            </Box>
                            <Box>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDialog(item);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>
        </Grid>
      );
    }
    
    return (
      <Grid container spacing={2}>
        {days}
      </Grid>
    );
  };
  
  // Render day view
  const renderDayView = () => {
    const daySchedule = schedule.filter(item => 
      item.dayOfWeek === selectedDate.getDay() || 
      (selectedDate.getDay() === 0 && item.dayOfWeek === 7)
    );
    
    return (
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
            {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: ptBR })}
          </Typography>
          <Box flexGrow={1} />
          <Tooltip title="Adicionar horário">
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog({ 
                dayOfWeek: selectedDate.getDay() === 0 ? 7 : selectedDate.getDay() 
              })}
            >
              Adicionar Aula
            </Button>
          </Tooltip>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {daySchedule.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              py: 8,
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 1,
            }}
          >
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Nenhuma aula agendada para hoje
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog({ 
                dayOfWeek: selectedDate.getDay() === 0 ? 7 : selectedDate.getDay() 
              })}
              sx={{ mt: 2 }}
            >
              Adicionar Aula
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {daySchedule.map((item) => {
              const classInfo = getClassById(item.classId);
              return (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card 
                    variant="outlined"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderLeft: `4px solid ${classInfo.color}`,
                      '&:hover': {
                        boxShadow: theme.shadows[2],
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Box display="flex" alignItems="flex-start">
                        <Box flexGrow={1}>
                          <Chip 
                            label={classInfo.name}
                            size="small"
                            sx={{
                              mb: 1,
                              bgcolor: `${classInfo.color}20`,
                              color: classInfo.color,
                              fontWeight: 'medium',
                            }}
                          />
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {classInfo.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: 'primary.main',
                                mr: 1,
                              }} 
                            />
                            <Typography variant="body2" color="text.secondary">
                              {item.startTime} - {item.endTime}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: 'secondary.main',
                                mr: 1,
                                opacity: 0,
                              }} 
                            />
                            <Typography variant="body2" color="text.secondary">
                              {item.room}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: 'success.main',
                                mr: 1,
                                opacity: 0,
                              }} 
                            />
                            <Typography variant="body2" color="text.secondary">
                              {item.teacher}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(item);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>
    );
  };
  
  // Render timetable view
  const renderTimetableView = () => {
    const days = [
      { id: 1, name: 'Segunda' },
      { id: 2, name: 'Terça' },
      { id: 3, name: 'Quarta' },
      { id: 4, name: 'Quinta' },
      { id: 5, name: 'Sexta' },
    ];
    
    return (
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <TableContainer component={Paper} elevation={0}>
          <Table size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 100 }}>Horário</TableCell>
                {days.map(day => (
                  <TableCell key={day.id} align="center">
                    {day.name}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {format(addDays(currentWeek, day.id - 1), 'dd/MM')}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {timeSlots.map((time, timeIndex) => {
                // Skip the last time slot since we're checking the next one
                if (timeIndex === timeSlots.length - 1) return null;
                
                const nextTime = timeSlots[timeIndex + 1];
                
                return (
                  <TableRow key={time}>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2">
                        {time} - {nextTime}
                      </Typography>
                    </TableCell>
                    
                    {days.map(day => {
                      const scheduleItem = schedule.find(item => 
                        item.dayOfWeek === day.id && 
                        item.startTime <= time && 
                        item.endTime > time
                      );
                      
                      if (scheduleItem) {
                        const classInfo = getClassById(scheduleItem.classId);
                        const rowSpan = Math.ceil(
                          (new Date(`2000-01-01T${scheduleItem.endTime}`) - 
                           new Date(`2000-01-01T${scheduleItem.startTime}`)) / 
                          (60 * 60 * 1000)
                        ) || 1;
                        
                        // Skip if this cell is part of a multi-row span
                        if (time !== scheduleItem.startTime) return null;
                        
                        return (
                          <TableCell 
                            key={`${day.id}-${time}`}
                            rowSpan={rowSpan}
                            sx={{
                              borderLeft: `4px solid ${classInfo.color}`,
                              bgcolor: `${classInfo.color}08`,
                              position: 'relative',
                              '&:hover': {
                                bgcolor: `${classInfo.color}12`,
                              },
                            }}
                          >
                            <Box p={1}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                                {classInfo.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {scheduleItem.room}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {scheduleItem.teacher}
                              </Typography>
                              <Box sx={{ 
                                position: 'absolute', 
                                top: 4, 
                                right: 4,
                                display: 'flex',
                                gap: 0.5,
                              }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDialog(scheduleItem);
                                  }}
                                  sx={{ 
                                    p: 0.5,
                                    '&:hover': {
                                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(scheduleItem.id);
                                  }}
                                  sx={{ 
                                    p: 0.5,
                                    '&:hover': {
                                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </TableCell>
                        );
                      }
                      
                      return <TableCell key={`${day.id}-${time}`} sx={{ border: '1px solid', borderColor: 'divider' }} />;
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader 
        title="Grade Horária" 
        subtitle="Visualize e gerencie os horários das aulas"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Novo Horário
          </Button>
        }
      />
      
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" flexWrap="wrap">
            <Box display="flex" alignItems="center" mr={2} mb={{ xs: 1, sm: 0 }}>
              <IconButton 
                size="small" 
                onClick={handlePrevWeek}
                disabled={loading}
              >
                <ChevronLeft />
              </IconButton>
              
              <Button
                variant="outlined"
                startIcon={<TodayIcon />}
                onClick={handleToday}
                disabled={loading}
                sx={{ mx: 1 }}
              >
                Hoje
              </Button>
              
              <IconButton 
                size="small" 
                onClick={handleNextWeek}
                disabled={loading}
              >
                <ChevronRight />
              </IconButton>
              
              <Typography variant="subtitle1" sx={{ ml: 2, minWidth: 200 }}>
                {format(currentWeek, 'MMMM yyyy', { locale: ptBR })}
              </Typography>
            </Box>
            
            <Box display="flex" ml="auto">
              <Tabs
                value={view}
                onChange={(e, newValue) => setView(newValue)}
                sx={{
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                  '& .MuiTab-root': {
                    minWidth: 'auto',
                    px: 2,
                    py: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: 1,
                    },
                  },
                }}
              >
                <Tab 
                  value="day" 
                  label="Dia" 
                  icon={<ViewDayIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  value="week" 
                  label="Semana" 
                  icon={<ViewWeekIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  value="timetable" 
                  label="Grade" 
                  icon={<ViewAgendaIcon />} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : view === 'day' ? (
        renderDayView()
      ) : view === 'timetable' ? (
        renderTimetableView()
      ) : (
        renderWeekView()
      )}
      
      {/* Add/Edit Schedule Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {formData.id ? 'Editar Horário' : 'Adicionar Novo Horário'}
          </DialogTitle>
          
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" margin="normal" required>
                  <InputLabel id="class-select-label">Matéria</InputLabel>
                  <Select
                    labelId="class-select-label"
                    id="classId"
                    name="classId"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    label="Matéria"
                    required
                  >
                    {mockClasses.map((classItem) => (
                      <MenuItem key={classItem.id} value={classItem.id}>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              bgcolor: classItem.color,
                              mr: 1.5,
                            }}
                          />
                          {classItem.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" margin="normal" required>
                  <InputLabel id="day-select-label">Dia da Semana</InputLabel>
                  <Select
                    labelId="day-select-label"
                    id="dayOfWeek"
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleInputChange}
                    label="Dia da Semana"
                    required
                  >
                    <MenuItem value={1}>Segunda-feira</MenuItem>
                    <MenuItem value={2}>Terça-feira</MenuItem>
                    <MenuItem value={3}>Quarta-feira</MenuItem>
                    <MenuItem value={4}>Quinta-feira</MenuItem>
                    <MenuItem value={5}>Sexta-feira</MenuItem>
                    <MenuItem value={6}>Sábado</MenuItem>
                    <MenuItem value={7}>Domingo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  id="room"
                  name="room"
                  label="Sala"
                  value={formData.room}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  id="startTime"
                  name="startTime"
                  label="Hora de Início"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  id="endTime"
                  name="endTime"
                  label="Hora de Término"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  id="teacher"
                  name="teacher"
                  label="Professor"
                  value={formData.teacher}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={!selectedClass}
            >
              {formData.id ? 'Salvar Alterações' : 'Adicionar Horário'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ClassSchedulePage;
