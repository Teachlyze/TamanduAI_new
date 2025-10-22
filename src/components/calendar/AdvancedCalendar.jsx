import React, { useCallback, useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval as eachDay, addDays, isToday, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Advanced calendar component with multiple views, events, and enhanced functionality
 * @param {Object} props
 * @param {string} props.mode - Calendar mode: 'month' | 'week' | 'day' | 'agenda'
 * @param {Date|Date[]} props.selected - Selected date(s)
 * @param {Function} props.onSelect - Date selection handler
 * @param {Array} props.events - Calendar events array
 * @param {Function} props.onEventClick - Event click handler
 * @param {Function} props.onEventCreate - Event creation handler
 * @param {Function} props.onEventUpdate - Event update handler
 * @param {Function} props.onEventDelete - Event deletion handler
 * @param {string} props.locale - Calendar locale (default: ptBR)
 * @param {boolean} props.showWeekends - Show weekend days
 * @param {boolean} props.showWeekNumbers - Show week numbers
 * @param {string} props.className - Additional CSS classes
 */
export const AdvancedCalendar = ({
  mode = 'month',
  selected,
  onSelect,
  events = [],
  onEventClick,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  locale = ptBR,
  showWeekends = true,
  showWeekNumbers = false,
  className = '',
  ...props
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(mode);
  const [draggedEvent, setDraggedEvent] = useState(null);

  // Generate calendar days based on view mode
  const calendarDays = useMemo(() => {
    switch (viewMode) {
      case 'month':
        return generateMonthView(currentDate);
      case 'week':
        return generateWeekView(currentDate);
      case 'day':
        return generateDayView(currentDate);
      case 'agenda':
        return generateAgendaView(currentDate);
      default:
        return generateMonthView(currentDate);
    }
  }, [currentDate, viewMode]);

  // Generate month view
  function generateMonthView(date) {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }

  // Generate week view
  function generateWeekView(date) {
    const startDate = startOfWeek(date, { weekStartsOn: 1 });
    const endDate = endOfWeek(date, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }

  // Generate day view (with time slots)
  function generateDayView(date) {
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const timeSlots = [];

    for (let hour = 0; hour < 24; hour++) {
      timeSlots.push(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour));
    }

    return timeSlots;
  }

  // Generate agenda view
  function generateAgendaView(date) {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }

  // Get events for a specific date
  const getEventsForDate = useCallback((date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  }, [events]);

  // Handle date selection
  const handleDateClick = useCallback((date) => {
    if (!date || isWeekend(date) && !showWeekends) return;

    onSelect?.(date);
  }, [onSelect, showWeekends]);

  // Handle event actions
  const handleEventClick = useCallback((event, date) => {
    onEventClick?.(event, date);
  }, [onEventClick]);

  const handleEventCreate = useCallback((date, time = '09:00') => {
    onEventCreate?.(date, time);
  }, [onEventCreate]);

  // Navigation handlers
  const navigatePrev = useCallback(() => {
    setCurrentDate(prev => {
      switch (viewMode) {
        case 'month':
          return subMonths(prev, 1);
        case 'week':
          return addDays(prev, -7);
        case 'day':
          return addDays(prev, -1);
        default:
          return subMonths(prev, 1);
      }
    });
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    setCurrentDate(prev => {
      switch (viewMode) {
        case 'month':
          return addMonths(prev, 1);
        case 'week':
          return addDays(prev, 7);
        case 'day':
          return addDays(prev, 1);
        default:
          return addMonths(prev, 1);
      }
    });
  }, [viewMode]);

  const navigateToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Render different view modes
  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Week days header */}
      {showWeekNumbers && <div className="p-2 text-center text-sm font-medium text-muted-foreground">Sem</div>}
      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {calendarDays.map((day, index) => {
        const dayEvents = getEventsForDate(day);
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isSelected = selected && isSameDay(day, selected);
        const isTodayDate = isToday(day);

        return (
          <div
            key={index}
            className={cn(
              "min-h-[100px] p-1 border rounded-lg cursor-pointer transition-colors",
              "hover:bg-muted/50",
              !isCurrentMonth && "text-muted-foreground bg-muted/20",
              isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
              isTodayDate && "bg-accent border-accent-foreground",
              !showWeekends && isWeekend(day) && "opacity-50"
            )}
            onClick={() => handleDateClick(day)}
          >
            {/* Day number */}
            <div className={cn(
              "text-sm font-medium mb-1",
              showWeekNumbers && index % 7 === 0 && "font-bold"
            )}>
              {format(day, 'd')}
            </div>

            {/* Events */}
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  className={cn(
                    "text-xs p-1 rounded text-white truncate cursor-pointer",
                    "hover:opacity-80"
                  )}
                  style={{ backgroundColor: event.color || '#3b82f6' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event, day);
                  }}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{dayEvents.length - 3} mais
                </div>
              )}
            </div>

            {/* Add event button */}
            {!isSelected && isCurrentMonth && (
              <button
                className="w-full mt-1 text-xs text-muted-foreground hover:text-foreground opacity-0 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventCreate(day);
                }}
              >
                <Plus className="w-3 h-3 mx-auto" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="space-y-2">
      {/* Time column */}
      <div className="flex">
        <div className="w-16"></div>
        {calendarDays.map(day => (
          <div key={day.toISOString()} className="flex-1 p-2 text-center text-sm font-medium border-b">
            <div>{format(day, 'EEE', { locale })}</div>
            <div>{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      {/* Time slots */}
      {Array.from({ length: 24 }, (_, hour) => (
        <div key={hour} className="flex border-b">
          <div className="w-16 p-2 text-xs text-muted-foreground border-r">
            {hour.toString().padStart(2, '0')}:00
          </div>
          {calendarDays.map(day => (
            <div key={day.toISOString()} className="flex-1 p-2 border-r min-h-[60px] relative">
              {getEventsForDateTime(day, hour).map((event, index) => (
                <div
                  key={index}
                  className="absolute inset-x-1 text-xs p-1 rounded text-white cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: event.color || '#3b82f6',
                    top: `${(event.startHour - hour) * 60}px`,
                    height: `${event.duration * 60}px`,
                  }}
                  onClick={() => handleEventClick(event, day)}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderDayView = () => (
    <div className="space-y-2">
      <div className="text-center p-4 border-b">
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'EEEE, d MMMM yyyy', { locale })}
        </h3>
      </div>

      <div className="space-y-1">
        {calendarDays.map((timeSlot, index) => {
          const hour = timeSlot.getHours();
          const events = getEventsForDateTime(currentDate, hour);

          return (
            <div key={index} className="flex border-b min-h-[60px]">
              <div className="w-20 p-2 text-sm text-muted-foreground border-r">
                {format(timeSlot, 'HH:mm')}
              </div>
              <div className="flex-1 p-2 relative">
                {events.map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className="absolute inset-x-2 text-sm p-2 rounded text-white cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: event.color || '#3b82f6',
                      top: `${(timeSlot.getMinutes())}px`,
                      height: `${event.duration * 60}px`,
                    }}
                    onClick={() => handleEventClick(event, currentDate)}
                  >
                    {event.title}
                  </div>
                ))}

                {!readOnly && (
                  <button
                    className="w-full h-full text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
                    onClick={() => handleEventCreate(currentDate, format(timeSlot, 'HH:mm'))}
                  >
                    <Plus className="w-4 h-4 mx-auto opacity-50" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAgendaView = () => (
    <div className="space-y-4">
      <div className="text-center p-4 border-b">
        <h3 className="text-lg font-semibold">
          Agenda - {format(currentDate, 'MMMM yyyy', { locale })}
        </h3>
      </div>

      <div className="space-y-2">
        {calendarDays.map(day => {
          const dayEvents = getEventsForDate(day);

          if (dayEvents.length === 0) return null;

          return (
            <Card key={day.toISOString()}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {format(day, 'EEEE, d MMMM', { locale })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {dayEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.color || '#3b82f6' }}
                        />
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {event.time && <Clock className="w-3 h-3 inline mr-1" />}
                            {event.time || 'Todo o dia'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEventClick(event, day)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEventDelete?.(event)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Helper function to get events for a specific date and time
  function getEventsForDateTime(date, hour) {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      if (!isSameDay(eventDate, date)) return false;

      if (event.time) {
        const eventHour = parseInt(event.time.split(':')[0]);
        return eventHour === hour;
      }

      return true; // All-day events
    });
  }

  return (
    <Card className={cn("advanced-calendar", className)} {...props}>
      {/* Header */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>
              {format(currentDate, 'MMMM yyyy', { locale })}
            </CardTitle>

            {/* View mode selector */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              {['month', 'week', 'day', 'agenda'].map((mode) => (
                <Button
                  key={mode}
                  size="sm"
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  onClick={() => setViewMode(mode)}
                  className="capitalize px-3"
                >
                  {mode === 'month' ? 'Mês' :
                   mode === 'week' ? 'Semana' :
                   mode === 'day' ? 'Dia' : 'Agenda'}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={navigateToday}>
              Hoje
            </Button>
            <Button size="sm" variant="outline" onClick={navigatePrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={navigateNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Calendar content */}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'agenda' && renderAgendaView()}
      </CardContent>
    </Card>
  );
};

export default AdvancedCalendar;
