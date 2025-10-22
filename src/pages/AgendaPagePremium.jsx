import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import CalendarService from '@/services/calendarService';
import {
  PremiumCard,
  StatsCard,
  PremiumButton,
  LoadingScreen,
  EmptyState,
  toast
} from '@/components/ui';
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
  AlertCircle
} from 'lucide-react';

export default function AgendaPagePremium() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('day'); // day, week, month
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    type: 'class', 
    start: '', 
    end: '', 
    location: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Carregar eventos reais do mês corrente (evita recarregar ao clicar na data)
  useEffect(() => {
    if (!user) return;
    loadEventsForMonth(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Realtime: quando houver mudanças nos eventos, refetch o mês atual
  useEffect(() => {
    if (!user) return;
    const unsubscribe = CalendarService.subscribeUserCalendar(user.id, () => {
      loadEventsForMonth(selectedDate, []); // TODO: Add dependencies
    }, []); // TODO: Add dependencies
    return () => {
      try { unsubscribe?.(); } catch (e) { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedDate]);

  const loadEventsForMonth = async (anchorDate) => {
    setLoading(true);
    try {
      const year = anchorDate.getFullYear();
      const month = anchorDate.getMonth();
      const from = new Date(year, month, 1);
      const to = new Date(year, month + 1, 0, 23, 59, 59);
      const data = await CalendarService.getUserCalendar({ from, to, userId: user.id, userRole: 'teacher' });
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayEvents = events.filter(e => {
    const d = new Date(e.start_time);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const upcomingEvents = events.filter(e => new Date(e.start_time) > new Date());

  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.status === 'completed').length;

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
      case 'class': return 'bg-blue-100 dark:bg-muted/50 text-blue-700 dark:text-blue-300';
      case 'meeting': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'exam': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'video': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando agenda..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 p-8 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8" />
            Agenda
          </h1>
          <p className="text-slate-900 dark:text-white/90">Gerencie sua agenda e compromissos</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stagger-children grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Eventos Hoje"
          value={todayEvents.length.toString()}
          icon={CalendarIcon}
        />
        <StatsCard
          title="Próximos Eventos"
          value={upcomingEvents.length.toString()}
          icon={Clock}
        />
        <StatsCard
          title="Total de Eventos"
          value={totalEvents.toString()}
          icon={BookOpen}
        />
        <StatsCard
          title="Concluídos"
          value={completedEvents.toString()}
          icon={CheckCircle2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <PremiumCard variant="elevated">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  {selectedDate.toLocaleDateString('pt-BR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h3>
                <div className="flex gap-2">
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedDate(newDate);
                      loadEventsForMonth(newDate);
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </PremiumButton>
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Hoje
                  </PremiumButton>
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedDate(newDate);
                      loadEventsForMonth(newDate);
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </PremiumButton>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="mb-6">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const year = selectedDate.getFullYear();
                    const month = selectedDate.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const today = new Date();
                    const days = [];

                    // Empty cells before first day
                    for (let i = 0; i < firstDay; i++) {
                      days.push(<div key={`empty-${i}`} className="aspect-square" />);
                    }

                    // Days of month
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day);
                      const isToday = date.toDateString() === today.toDateString();
                      const hasEvents = events.some(e => {
                        const d = new Date(e.start_time);
                        return d.toDateString() === date.toDateString();
                      });

                      days.push(
                        <button
                          key={day}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedDate(date);
                          }}
                          className={`aspect-square p-2 rounded-lg text-sm font-medium transition-colors relative ${
                            isToday
                              ? 'bg-primary text-primary-foreground'
                              : hasEvents
                              ? 'bg-muted hover:bg-muted/80'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          {day}
                          {hasEvents && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                          )}
                        </button>
                      );
                    }

                    return days;
                  })()}
                </div>
              </div>

              {/* Lista inferior de eventos do dia removida (será movida para a lateral) */}
              <div className="border-t border-border pt-4 hidden">
                <h4 className="font-semibold mb-3">Eventos - {selectedDate.toLocaleDateString('pt-BR')}</h4>
                <div className="space-y-3">
                  {todayEvents.length === 0 ? (
                    <EmptyState
                      icon={CalendarIcon}
                      title="Nenhum evento neste dia"
                      description="Clique em '+' para adicionar um evento"
                    />
                  ) : (
                    todayEvents.map(event => {
                      const Icon = getEventIcon(event.type);
                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className={`p-3 rounded-lg ${getEventColor(event.type)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.start} - {event.end}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {event.students} alunos
                              </span>
                            </div>
                          </div>
                          {event.status === 'upcoming' && (
                            <AlertCircle className="w-5 h-5 text-warning" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Sidebar com mais conteúdo */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <PremiumCard variant="elevated">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Próximos Eventos</h3>
                <PremiumButton
                  variant="gradient"
                  size="sm"
                  leftIcon={Plus}
                  onClick={() => setShowEventModal(true)}
                >
                  Novo Evento
                </PremiumButton>
              </div>

              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map(event => {
                  const Icon = getEventIcon(event.type);
                  return (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded ${getEventColor(event.type)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">{event.title}</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.date).toLocaleDateString('pt-BR')} às {event.start}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </PremiumCard>

          {/* Resumo do Mês */}
          <PremiumCard variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Resumo do Mês</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium">Aulas</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">12</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium">Reuniões</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">5</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium">Concluídos</span>
                  </div>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">15</span>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Eventos do Dia (lateral) */}
          <PremiumCard variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Eventos do dia</h3>
              {events.filter(e => new Date(e.start_time).toDateString() === selectedDate.toDateString()).length === 0 ? (
                <div className="text-sm text-muted-foreground">Nenhum evento para {selectedDate.toLocaleDateString('pt-BR')}</div>
              ) : (
                <div className="space-y-3">
                  {events.filter(e => new Date(e.start_time).toDateString() === selectedDate.toDateString()).map(event => {
                    const Icon = getEventIcon(event.type);
                    const start = new Date(event.start_time);
                    const end = new Date(event.end_time);
                    return (
                      <div key={event.id} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded ${getEventColor(event.type)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm truncate">{event.title}</h5>
                            <p className="text-xs text-muted-foreground mt-1">
                              {start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </PremiumCard>
        </div>
      </div>

      {/* Event Creation Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEventModal(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Novo Evento</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Título</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do evento"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Data</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Tipo</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="class">Aula</option>
                  <option value="meeting">Reunião</option>
                  <option value="exam">Prova</option>
                  <option value="video">Videoconferência</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Início</label>
                  <input
                    type="time"
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Fim</label>
                  <input
                    type="time"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Local</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Sala 12"
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setNewEvent({ 
                      title: '', 
                      type: 'class', 
                      start: '', 
                      end: '', 
                      location: '',
                      date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (!user) return toast.error('Usuário não autenticado');
                    if (newEvent.title && newEvent.start && newEvent.end && newEvent.date) {
                      try {
                        const start_time = new Date(`${newEvent.date}T${newEvent.start}`);
                        const end_time = new Date(`${newEvent.date}T${newEvent.end}`);
                        await CalendarService.createEvent({
                          class_id: null,
                          title: newEvent.title,
                          description: null,
                          start_time,
                          end_time,
                          type: newEvent.type,
                          color: null,
                          meeting_id: null,
                          activity_id: null,
                          metadata: { location: newEvent.location, teacher_id: user.id },
                        });
                        setShowEventModal(false);
                        setNewEvent({ 
                          title: '', 
                          type: 'class', 
                          start: '', 
                          end: '', 
                          location: '',
                          date: new Date().toISOString().split('T')[0]
                        });
                        await loadEventsForMonth(selectedDate);
                        toast.success('Evento criado com sucesso!');
                      } catch (err) {
                        console.error('Erro ao criar evento:', err);
                        toast.error('Erro ao criar evento');
                      }
                    } else {
                      toast.error('Preencha todos os campos obrigatórios');
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity font-medium"
                >
                  Criar Evento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
