import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  MapPin,
  Filter
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

const StudentCalendarPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user, currentMonth]);

  useEffect(() => {
    applyFilter();
  }, [events, filter, selectedDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Buscar turmas do aluno
      const { data: classMemberships } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('user_id', user.id)
        .eq('role', 'student');

      const classIds = (classMemberships || []).map(cm => cm.class_id);

      if (classIds.length === 0) {
        setEvents([]);
        return;
      }

      // Buscar eventos das turmas
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
        .in('class_id', classIds)
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
    
    let filtered = events;

    switch (filter) {
      case 'today':
        filtered = events.filter(e => {
          const eventDate = new Date(e.start_time);
          return eventDate.toDateString() === today.toDateString();
        });
        break;
      case 'upcoming':
        filtered = events.filter(e => new Date(e.start_time) >= now);
        break;
      case 'week':
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        filtered = events.filter(e => {
          const eventDate = new Date(e.start_time);
          return eventDate >= today && eventDate <= weekEnd;
        });
        break;
      default:
        filtered = events;
    }

    setFilteredEvents(filtered.slice(0, 50));
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const targetDate = new Date(year, month, day);
    
    return events.filter(e => {
      const eventDate = new Date(e.start_time);
      return eventDate.toDateString() === targetDate.toDateString();
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getEventTypeColor = (type) => {
    const colors = {
      class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      meeting: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      exam: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      project: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      activity: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      class: BookOpen,
      meeting: Video,
      exam: AlertCircle,
      project: BookOpen,
      activity: BookOpen
    };
    return icons[type] || CalendarIcon;
  };
  const days = getDaysInMonth();
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 rounded-2xl text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Minha Agenda</h1>
          </div>
          <p className="text-slate-900 dark:text-white/90">Acompanhe seus próximos eventos e prazos</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <PremiumCard variant="elevated">
            <div className="p-6">
              {/* Header do calendário */}
              <div className="flex items-center justify-between mb-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={previousMonth}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <h3 className="text-xl font-bold">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Grid do calendário */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                {days.map((day, index) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  const isToday = day && 
                    new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                  const isSelected = day &&
                    selectedDate.toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                  
                  return (
                    <motion.div
                      key={index}
                      whileHover={day ? { scale: 1.05 } : {}}
                      whileTap={day ? { scale: 0.95 } : {}}
                      className={`relative aspect-square p-2 rounded-lg border-2 transition-all ${
                        !day ? 'border-transparent' :
                        isSelected ? 'border-primary bg-primary/20 ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-950' :
                        isToday ? 'border-primary bg-primary/10' :
                        dayEvents.length > 0 ? 'border-border bg-muted/50 hover:border-primary/50 cursor-pointer' :
                        'border-border hover:border-muted-foreground/30 cursor-pointer'
                      }`}
                      onClick={() => day && setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-semibold ${
                            isToday ? 'text-primary' : 'text-foreground'
                          }`}>
                            {day}
                          </div>
                          {dayEvents.length > 0 && (
                            <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 flex-wrap">
                              {dayEvents.slice(0, 3).map((e, i) => (
                                <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Lista de Eventos */}
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'today', label: 'Hoje' },
              { value: 'week', label: 'Semana' },
              { value: 'upcoming', label: 'Próximos' }
            ].map(f => (
              <motion.button
                key={f.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap inline-flex items-center gap-2 ${
                  filter === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white dark:bg-slate-900 text-foreground border border-border hover:bg-muted'
                }`}
              >
                <Filter className="w-3 h-3" />
                {f.label}
              </motion.button>
            ))}
          </div>

          {/* Eventos */}
          <PremiumCard variant="elevated" className="max-h-[600px] overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold">Eventos ({filteredEvents.length})</h3>
            </div>
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-700 scrollbar-track-transparent">
              {filteredEvents.length === 0 ? (
                <EmptyState 
                  icon={CalendarIcon} 
                  title="Nenhum evento" 
                  description={`Nenhum evento encontrado para "${filter === 'all' ? 'todos' : filter === 'today' ? 'hoje' : filter === 'week' ? 'esta semana' : 'próximos'}"`}
                />
              ) : (
                filteredEvents.map((event, index) => {
                  const Icon = getEventTypeIcon(event.type || event.event_type);
                  const startDate = new Date(event.start_time);
                  const endDate = new Date(event.end_time);
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getEventTypeColor(event.type || event.event_type)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold group-hover:text-primary transition-colors">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                          )}
                          {event.classes && (
                            <Badge variant="secondary" className="mt-2">
                              {event.classes.name}
                            </Badge>
                          )}
                          <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {startDate.toLocaleDateString('pt-BR')} {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
};

export default StudentCalendarPage;
