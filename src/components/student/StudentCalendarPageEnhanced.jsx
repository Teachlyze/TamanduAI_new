import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, 
  Clock, 
  Calendar as CalendarIcon,
  MapPin,
  User,
  School,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const StudentCalendarPageEnhanced = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadTodayClasses();
    }
  }, [selectedDate, user]);

  const getDayOfWeek = (date) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  const loadTodayClasses = async () => {
    try {
      setLoading(true);
      const dayOfWeek = getDayOfWeek(selectedDate);
      const todayDateStr = selectedDate.toISOString().split('T')[0];

      // Query classes where student is member and class has online meetings on this day
      const { data, error } = await supabase
        .from('class_members')
        .select(`
          class_id,
          classes!inner (
            id,
            name,
            subject,
            color,
            is_online,
            meeting_link,
            meeting_days,
            meeting_start_time,
            meeting_end_time,
            room_number,
            vacation_start,
            vacation_end,
            cancelled_dates,
            profiles!classes_created_by_fkey (
              name
            ),
            schools (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('classes.is_online', true)
        .filter('classes.meeting_days', 'cs', `{${dayOfWeek}}`);

      if (error) throw error;

      // Filter out cancelled and vacation dates client-side
      const activeClasses = (data || []).filter(({ classes: cls }) => {
        // Check if in vacation period
        if (cls.vacation_start && cls.vacation_end) {
          const vacStart = new Date(cls.vacation_start);
          const vacEnd = new Date(cls.vacation_end);
          if (selectedDate >= vacStart && selectedDate <= vacEnd) {
            return false;
          }
        }

        // Check if in cancelled dates
        if (cls.cancelled_dates && cls.cancelled_dates.includes(todayDateStr)) {
          return false;
        }

        return true;
      });

      // Sort by start time
      const sorted = activeClasses.sort((a, b) => {
        const timeA = a.classes.meeting_start_time || '00:00';
        const timeB = b.classes.meeting_start_time || '00:00';
        return timeA.localeCompare(timeB);
      });

      setTodayClasses(sorted);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar aulas',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const isClassHappeningNow = (classData) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const today = now.toDateString();
    const selected = selectedDate.toDateString();
    
    // Only show "live" if it's today
    if (today !== selected) return false;
    
    return (
      currentTime >= classData.meeting_start_time &&
      currentTime <= classData.meeting_end_time
    );
  };

  const isClassUpcoming = (classData) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const today = now.toDateString();
    const selected = selectedDate.toDateString();
    
    if (today !== selected) return false;
    
    return currentTime < classData.meeting_start_time;
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5); // HH:MM
  };

  const getDayLabel = (day) => {
    const labels = {
      monday: 'Seg',
      tuesday: 'Ter',
      wednesday: 'Qua',
      thursday: 'Qui',
      friday: 'Sex',
      saturday: 'Sáb',
      sunday: 'Dom'
    };
    return labels[day] || day;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <CalendarIcon className="w-10 h-10" />
                  Agenda de Aulas
                </h1>
                <p className="text-blue-100 text-lg mt-2">
                  Suas aulas online programadas
                </p>
              </div>
              <Button
                onClick={goToToday}
                className="whitespace-nowrap inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-white/90 shadow-lg"
              >
                <Clock className="w-4 h-4" />
                <span>Hoje</span>
              </Button>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </motion.div>

        {/* Date Selector */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => changeDate(-1)}
                className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                  {formatDate(selectedDate)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {todayClasses.length} {todayClasses.length === 1 ? 'aula' : 'aulas'} programada{todayClasses.length !== 1 ? 's' : ''}
                </p>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => changeDate(1)}
                className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Classes List */}
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando aulas...</p>
            </CardContent>
          </Card>
        ) : todayClasses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Nenhuma aula programada
              </h3>
              <p className="text-muted-foreground mt-2">
                Você não tem aulas online neste dia.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {todayClasses.map(({ classes: cls }) => {
              const isLive = isClassHappeningNow(cls);
              const isUpcoming = isClassUpcoming(cls);
              
              return (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 ${isLive ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Class Info */}
                        <div className="flex items-start gap-4 flex-1">
                          {/* Color Indicator */}
                          <div 
                            className={`w-2 h-20 rounded-full bg-${cls.color}-500`}
                            style={{ backgroundColor: `var(--${cls.color}-500, #3b82f6)` }}
                          />
                          
                          <div className="flex-1">
                            {/* Class Name & Subject */}
                            <div className="flex items-start gap-3 mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                  {cls.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {cls.subject}
                                </p>
                              </div>
                              
                              {/* Live Badge */}
                              {isLive && (
                                <Badge 
                                  variant="destructive" 
                                  className="animate-pulse whitespace-nowrap inline-flex items-center gap-1"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>AO VIVO</span>
                                </Badge>
                              )}
                              
                              {/* Upcoming Badge */}
                              {isUpcoming && (
                                <Badge 
                                  variant="secondary"
                                  className="whitespace-nowrap inline-flex items-center gap-1 bg-blue-100 text-blue-700"
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>Em breve</span>
                                </Badge>
                              )}
                            </div>

                            {/* Class Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">
                                  {formatTime(cls.meeting_start_time)} - {formatTime(cls.meeting_end_time)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4 text-green-600" />
                                <span>{cls.profiles?.name || 'Professor'}</span>
                              </div>
                              
                              {cls.schools && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <School className="w-4 h-4 text-purple-600" />
                                  <span>{cls.schools.name}</span>
                                </div>
                              )}
                            </div>

                            {/* Meeting Days */}
                            <div className="flex items-center gap-2 mt-3">
                              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                              <div className="flex gap-1">
                                {cls.meeting_days?.map((day) => (
                                  <Badge key={day} variant="outline" className="text-xs">
                                    {getDayLabel(day)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Join Button */}
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => window.open(cls.meeting_link, '_blank')}
                            disabled={!isLive && !isUpcoming}
                            className={`whitespace-nowrap inline-flex items-center gap-2 ${
                              isLive 
                                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <Video className="w-4 h-4" />
                            <span>{isLive ? 'Entrar Agora' : 'Entrar na Aula'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                          
                          {!isLive && !isUpcoming && (
                            <p className="text-xs text-center text-muted-foreground">
                              Disponível no horário
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info Alert */}
        {todayClasses.length > 0 && (
          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <Video className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm">
              <span className="font-semibold">Dica:</span> O botão "Entrar na Aula" fica disponível apenas durante o horário da aula. 
              Você receberá uma notificação 15 minutos antes de cada aula começar.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default StudentCalendarPageEnhanced;
