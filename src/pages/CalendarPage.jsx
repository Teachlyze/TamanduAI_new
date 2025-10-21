import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import CalendarService from '@/services/calendarService';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  BookOpen,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  Edit,
  Trash2,
  MapPin,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

const CalendarPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filter, setFilter] = useState('all'); // all, today, upcoming, week
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [classes, setClasses] = useState([]);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'class',
    start_time: '',
    end_time: '',
    location: '',
    class_id: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    if (user) {
      loadClasses();
      loadEvents();
    }
  }, [user]);

  useEffect(() => {
    applyFilter();
  }, [events, filter, selectedDate]);

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, subject')
        .eq('created_by', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          classes:class_id (
            id,
            name,
            subject
          )
        `)
        .eq('created_by', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    let filtered = events;

    switch (filter) {
      case 'today':
        filtered = events.filter(e => {
          const eventDate = new Date(e.start_time);
          return eventDate.toDateString() === today.toDateString();
        });
        break;
      case 'upcoming':
        filtered = events.filter(e => {
          const eventDate = new Date(e.start_time);
          return eventDate > now && e.status === 'upcoming';
        });
        break;
      case 'week':
        filtered = events.filter(e => {
          const eventDate = new Date(e.start_time);
          return eventDate >= today && eventDate <= weekFromNow;
        });
        break;
      default:
        filtered = events;
    }

    setFilteredEvents(filtered);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!newEvent.class_id) {
      toast.error('Selecione uma turma para o evento');
      return;
    }

    try {
      const payload = {
        class_id: newEvent.class_id,
        title: newEvent.title,
        description: newEvent.description || null,
        start_time: newEvent.start_time,
        end_time: newEvent.end_time,
        type: newEvent.type
      };

      if (editingEvent) {
        // Update via service (maps UI type to DB enums)
        await CalendarService.updateEvent(editingEvent.id, payload);
        toast.success('Evento atualizado!');
      } else {
        // Create via service (maps UI type to DB enums)
        await CalendarService.createEvent(payload);
        toast.success('Evento criado!');
      }

      setShowEventModal(false);
      setEditingEvent(null);
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast.error('Erro ao salvar evento');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Evento excluído!');
      loadEvents();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast.error('Erro ao excluir evento');
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    // Map DB types to UI types for editing
    const mapDbToUi = (dbType, eventType) => {
      if (dbType === 'meeting') return 'meeting';
      if (eventType === 'class') return 'class';
      if (eventType === 'exam') return 'exam';
      if (eventType === 'assignment') return 'activity';
      return 'other';
    };
    const uiType = mapDbToUi(event.type, event.event_type);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      type: uiType,
      start_time: new Date(event.start_time).toISOString().slice(0, 16),
      end_time: new Date(event.end_time).toISOString().slice(0, 16),
      location: event.location || '',
      class_id: event.class_id || '',
      color: event.color || '#3B82F6'
    });
    setShowEventModal(true);
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      type: 'class',
      start_time: '',
      end_time: '',
      location: '',
      class_id: '',
      color: '#3B82F6'
    });
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'class': return BookOpen;
      case 'meeting': return Users;
      case 'exam': return BookOpen;
      case 'video': return Video;
      default: return CalendarIcon;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'class': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300';
      case 'meeting': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300';
      case 'exam': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300';
      case 'video': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-300';
    }
  };

  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.start_time);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.start_time);
    return eventDate > new Date() && e.status === 'upcoming';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <CalendarIcon className="w-8 h-8" />
              Agenda
            </h1>
            <p className="text-white/90">Gerencie sua agenda e compromissos</p>
          </div>
          
          <Button
            onClick={() => {
              setEditingEvent(null);
              resetForm();
              setShowEventModal(true);
            }}
            className="bg-white text-orange-600 hover:bg-white/90"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Evento
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eventos Hoje</p>
                <p className="text-2xl font-bold">{todayEvents.length}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próximos</p>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => e.status === 'completed').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrar:</span>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={filter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('today')}
            >
              Hoje
            </Button>
            <Button
              variant={filter === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('week')}
            >
              Esta Semana
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('upcoming')}
            >
              Próximos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {filter === 'all' && 'Todos os Eventos'}
          {filter === 'today' && 'Eventos de Hoje'}
          {filter === 'week' && 'Eventos desta Semana'}
          {filter === 'upcoming' && 'Próximos Eventos'}
        </h2>

        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarIcon className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
              <p className="text-muted-foreground">Nenhum evento encontrado</p>
              <Button
                onClick={() => {
                  setEditingEvent(null);
                  resetForm();
                  setShowEventModal(true);
                }}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Evento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map(event => {
              const uiType = event.event_type || event.type;
              const EventIcon = getEventIcon(uiType);
              const startDate = new Date(event.start_time);
              const endDate = new Date(event.end_time);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={`border-l-4 ${getEventColor(uiType)}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-3 rounded-lg ${getEventColor(event.type)}`}>
                            <EventIcon className="w-6 h-6" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <Badge variant="outline">
                                {uiType === 'class' && 'Aula'}
                                {uiType === 'meeting' && 'Reunião'}
                                {uiType === 'exam' && 'Prova'}
                                {uiType === 'video' && 'Vídeo'}
                                {uiType === 'activity' && 'Atividade'}
                                {uiType === 'other' && 'Outro'}
                              </Badge>
                              {event.status === 'completed' && (
                                <Badge className="bg-green-500">Concluído</Badge>
                              )}
                            </div>

                            {event.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {event.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {startDate.toLocaleDateString('pt-BR')} • {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </span>
                              )}

                              {event.classes && (
                                <Badge variant="secondary">
                                  {event.classes.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showEventModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => {
                setShowEventModal(false);
                setEditingEvent(null);
                resetForm();
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">
                      {editingEvent ? 'Editar Evento' : 'Novo Evento'}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowEventModal(false);
                        setEditingEvent(null);
                        resetForm();
                      }}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Ex: Aula de Matemática"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Detalhes do evento..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Tipo *</Label>
                        <select
                          id="type"
                          value={newEvent.type}
                          onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                        >
                          <option value="class">Aula</option>
                          <option value="meeting">Reunião</option>
                          <option value="exam">Prova</option>
                          <option value="video">Videoconferência</option>
                          <option value="other">Outro</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="class_id">Turma *</Label>
                        <select
                          id="class_id"
                          value={newEvent.class_id}
                          onChange={(e) => setNewEvent({ ...newEvent, class_id: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                        >
                          <option value="">Selecione uma turma</option>
                          {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name} - {cls.subject}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_time">Data/Hora Início *</Label>
                        <Input
                          id="start_time"
                          type="datetime-local"
                          value={newEvent.start_time}
                          onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="end_time">Data/Hora Fim *</Label>
                        <Input
                          id="end_time"
                          type="datetime-local"
                          value={newEvent.end_time}
                          onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Preview do Evento */}
                    {newEvent.start_time && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-600">Preview do Evento</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Data:</strong> {new Date(newEvent.start_time).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                          <p><strong>Horário:</strong> {new Date(newEvent.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} {newEvent.end_time && `- ${new Date(newEvent.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}</p>
                          {newEvent.class_id && (
                            <p><strong>Turma:</strong> {classes.find(c => c.id === newEvent.class_id)?.name}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="location">Local</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Ex: Sala 12, Online, etc."
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingEvent ? 'Atualizar Evento' : 'Criar Evento'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowEventModal(false);
                          setEditingEvent(null);
                          resetForm();
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarPage;
