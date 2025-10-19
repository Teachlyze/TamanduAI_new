import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Clock, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UpcomingClassesCard = ({ userRole = 'student' }) => {
  const { user } = useAuth();
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUpcomingClasses();
      
      // Refresh every minute to update "AO VIVO" badges
      const interval = setInterval(loadUpcomingClasses, 60000);
      return () => clearInterval(interval);
    }
  }, [user, userRole]);

  const getDayOfWeek = (date = new Date()) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  const loadUpcomingClasses = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const dayOfWeek = getDayOfWeek(now);
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayDateStr = now.toISOString().split('T')[0];

      let query;

      if (userRole === 'student') {
        // Student: get classes they're member of
        query = supabase
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
              vacation_start,
              vacation_end,
              cancelled_dates,
              profiles!classes_created_by_fkey (
                name
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('classes.is_online', true)
          .filter('classes.meeting_days', 'cs', `{${dayOfWeek}}`);
      } else {
        // Teacher: get classes they created
        query = supabase
          .from('classes')
          .select(`
            id,
            name,
            subject,
            color,
            is_online,
            meeting_link,
            meeting_days,
            meeting_start_time,
            meeting_end_time,
            vacation_start,
            vacation_end,
            cancelled_dates
          `)
          .eq('created_by', user.id)
          .eq('is_online', true)
          .filter('meeting_days', 'cs', `{${dayOfWeek}}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Extract classes and filter
      let classList = userRole === 'student' 
        ? (data || []).map(item => item.classes)
        : (data || []);

      // Filter out cancelled and vacation dates
      classList = classList.filter(cls => {
        // Check vacation
        if (cls.vacation_start && cls.vacation_end) {
          const vacStart = new Date(cls.vacation_start);
          const vacEnd = new Date(cls.vacation_end);
          if (now >= vacStart && now <= vacEnd) {
            return false;
          }
        }

        // Check cancelled dates
        if (cls.cancelled_dates && cls.cancelled_dates.includes(todayDateStr)) {
          return false;
        }

        // Only show upcoming classes (not past ones)
        return cls.meeting_end_time >= currentTime;
      });

      // Sort by start time
      classList.sort((a, b) => {
        const timeA = a.meeting_start_time || '00:00';
        const timeB = b.meeting_start_time || '00:00';
        return timeA.localeCompare(timeB);
      });

      // Limit to next 3 classes
      setUpcomingClasses(classList.slice(0, 3));
    } catch (error) {
      console.error('Error loading upcoming classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const isClassHappeningNow = (classData) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return (
      currentTime >= classData.meeting_start_time &&
      currentTime <= classData.meeting_end_time
    );
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const getTimeUntilClass = (startTime) => {
    const now = new Date();
    const [hours, minutes] = startTime.split(':');
    const classTime = new Date();
    classTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const diff = classTime - now;
    const minutesUntil = Math.floor(diff / 60000);
    
    if (minutesUntil < 0) return 'Agora';
    if (minutesUntil === 0) return 'Começando';
    if (minutesUntil < 60) return `em ${minutesUntil} min`;
    const hoursUntil = Math.floor(minutesUntil / 60);
    return `em ${hoursUntil}h${minutesUntil % 60}min`;
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            Próximas Aulas Online
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span>Próximas Aulas Online</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Hoje
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="popLayout">
          {upcomingClasses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhuma aula online programada para hoje
              </p>
            </motion.div>
          ) : (
            upcomingClasses.map((cls, index) => {
              const isLive = isClassHappeningNow(cls);
              
              return (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                    isLive 
                      ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className={`w-1 h-12 rounded-full bg-${cls.color}-500 flex-shrink-0`}
                      style={{ backgroundColor: `var(--${cls.color}-500, #3b82f6)` }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">
                          {cls.name}
                        </p>
                        {isLive && (
                          <Badge 
                            variant="destructive" 
                            className="animate-pulse text-xs whitespace-nowrap inline-flex items-center gap-1"
                          >
                            <Video className="w-2 h-2" />
                            <span>LIVE</span>
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(cls.meeting_start_time)}
                        </span>
                        {userRole === 'student' && cls.profiles?.name && (
                          <span className="truncate">
                            {cls.profiles.name}
                          </span>
                        )}
                        {!isLive && (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {getTimeUntilClass(cls.meeting_start_time)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => window.open(cls.meeting_link, '_blank')}
                    className={`whitespace-nowrap inline-flex items-center gap-2 flex-shrink-0 ${
                      isLive
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Video className="w-3 h-3" />
                    <span className="hidden sm:inline">
                      {isLive ? 'Entrar' : userRole === 'teacher' ? 'Iniciar' : 'Entrar'}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {upcomingClasses.length > 0 && (
          <Button
            variant="outline"
            className="w-full whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 mt-2"
            onClick={() => window.location.href = userRole === 'student' ? '/students/calendar' : '/dashboard/calendar'}
          >
            <Calendar className="w-4 h-4" />
            <span>Ver Agenda Completa</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingClassesCard;
