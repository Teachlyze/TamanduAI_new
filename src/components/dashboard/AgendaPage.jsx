import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import CalendarService from '@/services/calendarService';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AgendaPagePremium = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'class',
    date: format(selectedDate, 'yyyy-MM-dd'),
    start_time: '08:00',
    end_time: '09:00',
    location: '',
    description: ''
  });

  // Função para lidar com a criação de um novo evento
  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.type || !newEvent.start_time || !newEvent.end_time || !newEvent.date) {
      toast({
        title: "Erro!",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
        position: "top-right"
      });
      return;
    }

    try {
      // Usar a data do formulário em vez da data selecionada
      const start_time = `${newEvent.date}T${newEvent.start_time}:00`;
      const end_time = `${newEvent.date}T${newEvent.end_time}:00`;

      // Salvar no Supabase usando CalendarService
      await CalendarService.createEvent({
        class_id: null,
        title: newEvent.title,
        description: newEvent.description || null,
        start_time,
        end_time,
        type: newEvent.type,
        color: null,
        activity_id: null,
        metadata: { location: newEvent.location || null },
        participants: [],
      });

      toast({
        title: "Sucesso!",
        description: "Evento criado com sucesso!",
        variant: "success",
        position: "top-right"
      });

      // Resetar o formulário e fechar o modal
      setNewEvent({
        title: '',
        type: 'class',
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: '08:00',
        end_time: '09:00',
        location: '',
        description: ''
      });
      setShowCreateModal(false);

      // Recarregar eventos
      loadEvents();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: "Erro!",
        description: `Erro ao criar evento: ${error.message}`,
        variant: "destructive",
        position: "top-right"
      });
    }
  };

  // Função para carregar eventos
  const loadEvents = async () => {
    setLoading(true);
    try {
      // Intervalo do mês corrente
      const from = startOfMonth(currentMonth);
      const to = endOfMonth(currentMonth);
      // Buscar eventos do calendário
      const calendarEvents = await CalendarService.getUserCalendar({
        from,
        to,
        userId: user.id,
        userRole: 'teacher',
      });
      
      if (calendarEvents && calendarEvents.length > 0) {
        setEvents(calendarEvents);
      } else {
        // Se não houver eventos, manter o array vazio
        setEvents([]);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [currentMonth, user]);

  // const mockEvents = [ ... ];
  
  // Usar apenas os eventos reais
  const allEvents = events;

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Filtrar eventos do dia selecionado
  const selectedDayEvents = useMemo(() => {
    return allEvents.filter(event => {
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, selectedDate);
    });
  }, [allEvents, selectedDate]);

  // Filtrar eventos por tipo
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return selectedDayEvents;
    return selectedDayEvents.filter(event => event.event_type === filterType);
  }, [selectedDayEvents, filterType]);

  // Estatísticas para exibição
  const stats = [
    { name: 'Aulas', count: allEvents.filter(e => e.event_type === 'class').length, icon: <Calendar className="h-5 w-5" />, gradient: 'from-blue-500 to-indigo-500' },
    { name: 'Reuniões', count: allEvents.filter(e => e.event_type === 'meeting').length, icon: <Users className="h-5 w-5" />, gradient: 'from-purple-500 to-pink-500' },
    { name: 'Prazos', count: allEvents.filter(e => e.event_type === 'deadline').length, icon: <Clock className="h-5 w-5" />, gradient: 'from-amber-500 to-orange-500' },
    { name: 'Eventos', count: allEvents.filter(e => e.event_type === 'event').length, icon: <Calendar className="h-5 w-5" />, gradient: 'from-green-500 to-emerald-500' },
  ];

  // Função para obter ícone baseado no tipo de evento
  const getEventIcon = (type) => {
    switch (type) {
      case 'class': return <Calendar className="h-5 w-5" />;
      case 'meeting': return <Users className="h-5 w-5" />;
      case 'deadline': return <Clock className="h-5 w-5" />;
      case 'event': return <Calendar className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  // Função para obter cor baseada no tipo de evento
  const getEventColor = (type) => {
    switch (type) {
      case 'class': return 'from-blue-500 to-indigo-500';
      case 'meeting': return 'from-purple-500 to-pink-500';
      case 'deadline': return 'from-amber-500 to-orange-500';
      case 'event': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };
  
  // Função para lidar com a seleção de data
  const handleDateSelect = (day, event) => {
    // Prevenir o comportamento padrão que causa recarregamento
    event.preventDefault();
    setSelectedDate(day);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold">Agenda</h1>
              <p className="text-blue-100 mt-2">Gerencie seus eventos, aulas e compromissos</p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-indigo-600 hover:bg-blue-50 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10">
          <Calendar className="h-64 w-64" />
        </div>
      </motion.div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-br ${stat.gradient} text-white`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Layout principal - Grid para colocar o calendário e eventos lado a lado */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Calendário - Ocupa 8 colunas em telas grandes */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do calendário */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                // Verificar se há eventos neste dia
                const dayEvents = allEvents.filter(event => {
                  const eventDate = new Date(event.start_time);
                  return isSameDay(eventDate, day);
                });
                
                const hasEvents = dayEvents.length > 0;
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(event) => handleDateSelect(day, event)}
                    className={`
                      h-12 rounded-lg flex flex-col items-center justify-center relative
                      ${!isCurrentMonth ? 'text-gray-300' : ''}
                      ${isSelected ? 'bg-blue-100 text-blue-600 font-medium' : ''}
                      ${isCurrentDay && !isSelected ? 'text-blue-600 font-medium' : ''}
                      ${!isSelected && !isCurrentDay ? 'hover:bg-gray-50' : ''}
                    `}
                  >
                    <span>{format(day, 'd')}</span>
                    {hasEvents && (
                      <div className="flex gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div 
                            key={i}
                            className={`h-1 w-1 rounded-full bg-gradient-to-r ${getEventColor(event.event_type)}`}
                          />
                        ))}
                        {dayEvents.length > 3 && <div className="h-1 w-1 rounded-full bg-gray-300" />}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Eventos do dia selecionado - Ocupa 4 colunas em telas grandes */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Eventos do Dia</h3>
              <p className="text-sm text-gray-500">{format(selectedDate, 'dd/MM/yyyy')}</p>
            </div>
            
            <div className="mb-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="class">Aulas</SelectItem>
                  <SelectItem value="meeting">Reuniões</SelectItem>
                  <SelectItem value="deadline">Prazos</SelectItem>
                  <SelectItem value="event">Eventos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AnimatePresence>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="mb-3 last:mb-0"
                  >
                    <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full bg-gradient-to-r ${getEventColor(event.event_type)} text-white`}>
                          {getEventIcon(event.event_type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="text-sm text-gray-500 mt-1 space-y-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                              </span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.participants && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                <span>{event.participants}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8 text-center text-gray-500"
                >
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum evento para este dia</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>

      {/* Modal de criação de evento */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Evento</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do evento abaixo. Os campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Ex: Reunião de Equipe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={newEvent.type} 
                onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Aula</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="deadline">Prazo</SelectItem>
                  <SelectItem value="event">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_time">Hora de início *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_time">Hora de término *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Ex: Sala de Reuniões"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Detalhes adicionais sobre o evento"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateEvent}>Criar Evento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaPagePremium;

