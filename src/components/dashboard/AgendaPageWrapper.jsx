// src/components/dashboard/AgendaPageWrapper.jsx
import React, { useMemo, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/lib/supabaseClient';
import { AttachmentService } from '@/services/attachmentService';
import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, AlertTriangle, Bell, Users, Paperclip } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import MeetingAttachmentUploader from '@/components/uploads/MeetingAttachmentUploader';
import EventAttachmentUploader from '@/components/uploads/EventAttachmentUploader';
import AgendaSkeleton from '@/components/ui/agenda-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const groupByDay = (events) => {
  const groups = {};
  events.forEach((e) => {
    const d = format(parseISO(e.start_time), 'yyyy-MM-dd');
    if (!groups[d]) groups[d] = [];
    groups[d].push(e);
  });
  return Object.entries(groups)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([day, list]) => ({ day, list: list.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)) }));
};

const AgendaPageWrapper = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTeacher, setIsTeacher] = useState(true);
  const [attachmentsByEvent, setAttachmentsByEvent] = useState({});

  const from = useMemo(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), []);
  const to = useMemo(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), []);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simular delay para mostrar skeleton
      await new Promise(resolve => setTimeout(resolve, 100));

      // Carregar dados em segundo plano
      const loadData = async () => {
        try {
          // Carregar eventos
          const { data: eventsData, error: eventsError } = await supabase
            .from('calendar_events')
            .select('*')
            .gte('start_time', from.toISOString())
            .lte('start_time', to.toISOString())
            .order('start_time', { ascending: true });

          if (eventsError) throw eventsError;

          setEvents(eventsData || []);

          // Carregar anexos em paralelo (não bloqueante)
          if (eventsData && eventsData.length > 0) {
            const loadAttachments = async () => {
              try {
                const mapEntries = await Promise.allSettled(
                  eventsData.slice(0, 50).map(async (e) => {
                    try {
                      // meeting_id não existe em calendar_events - sempre usar event_id
                      const list = await AttachmentService.getEventAttachments(e.id);
                      return [`event:${e.id}`, list];
                    } catch {
                      return null;
                    }
                  })
                );

                const map = {};
                for (const r of mapEntries) {
                  if (r.status === 'fulfilled' && r.value && Array.isArray(r.value)) {
                    const [k, v] = r.value;
                    map[k] = v;
                  }
                }
                setAttachmentsByEvent(map);
              } catch (err) {
                console.warn('Erro ao carregar anexos:', err);
              }
            };

            loadAttachments();
          }

          // Verificar papel do usuário
          if (user?.id) {
            try {
              const { data: roleData, error: roleError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

              if (!roleError) {
                setIsTeacher(roleData?.role === 'teacher');
              }
            } catch {
              setIsTeacher(true); // Default para teacher se falhar
            }
          }

        } catch (err) {
          throw new Error(err?.message || 'Falha ao carregar agenda');
        }
      };

      await loadData();

    } catch (err) {
      setError(err.message);
      toast({
        title: 'Erro ao carregar Agenda',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return <AgendaSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" /> Agenda
          </h1>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Success state - renderizar o componente real
  return <AgendaPageContent
    events={events}
    attachmentsByEvent={attachmentsByEvent}
    isTeacher={isTeacher}
    user={user}
    onRefresh={refresh}
  />;
};

// Componente interno que recebe os dados já carregados
const AgendaPageContent = ({ events, attachmentsByEvent, isTeacher, user, onRefresh }) => {
  const { toast } = useToast();
  const conflicts = useMemo(() => {
    const eventsWithConflicts = [];
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const a = events[i];
        const b = events[j];
        if (a.start_time < b.end_time && a.end_time > b.start_time) {
          eventsWithConflicts.push([a, b]);
        }
      }
    }
    return eventsWithConflicts;
  }, [events]);

  const grouped = useMemo(() => groupByDay(events), [events]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" /> Agenda
        </h1>
        <button
          onClick={onRefresh}
          className="px-3 py-2 text-sm rounded-md bg-primary text-slate-900 dark:text-white hover:opacity-90"
        >
          Atualizar
        </button>
      </div>

      {/* Alertas de Conflito */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          <div>
            <div className="font-semibold">Conflitos detectados</div>
            <ul className="list-disc ml-5 mt-1 space-y-1 text-sm">
              {conflicts.map(([a, b], idx) => (
                <li key={idx}>
                  {format(parseISO(a.start_time), 'dd/MM HH:mm', { locale: ptBR })} - {a.title} entra em conflito com {b.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Lista por dia */}
      <div className="space-y-6">
        {grouped.map(({ day, list }) => (
          <div key={day} className="border rounded-xl p-4">
            <div className="text-lg font-semibold mb-3">
              {format(new Date(day), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </div>
            <div className="space-y-3">
              {list.map((e) => (
                <div key={e.id} className="flex items-start justify-between bg-card border rounded-lg p-3">
                  <div>
                    <div className="font-medium">
                      {format(parseISO(e.start_time), 'HH:mm')} - {format(parseISO(e.end_time), 'HH:mm')} • {e.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {e.description || 'Sem descrição'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                      {e.class_id && <span>Turma: {e.class_id.slice(0, 8)}…</span>}
                      {e.activity_id && <span>Prazo de Atividade</span>}
                    </div>
                    {/* Attachments indicator + preview (lazy, best-effort) */}
                    <div className="mt-2 text-xs">
                      {(() => {
                        const key = `event:${e.id}`;
                        const list = attachmentsByEvent[key] || [];
                        if (!list.length) return null;
                        return (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Anexos ({list.length}):</span>
                            <div className="flex flex-wrap gap-1">
                              {list.slice(0, 3).map((a) => (
                                <span key={a.id} className={`px-2 py-0.5 rounded-full border text-[11px] ${a.status === 'approved' ? 'border-green-300 text-green-700' : 'border-yellow-300 text-yellow-700'}`}>
                                  {a.original_name}
                                </span>
                              ))}
                              {list.length > 3 && <span className="text-muted-foreground">+{list.length - 3} mais</span>}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-md border hover:bg-muted">
                      <Bell className="w-4 h-4" /> Lembretes
                    </button>
                    <button className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-md border hover:bg-muted">
                      <Users className="w-4 h-4" /> Participantes
                    </button>
                    {/* Upload anexos (somente professor; se role lookup falhar, mantemos visível para não bloquear fluxo) */}
                    <div className="inline-flex items-center">
                      {isTeacher && (
                        <div className="ml-2">
                          <EventAttachmentUploader eventId={e.id} userId={user?.id} onUploaded={() => onRefresh()} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgendaPageWrapper;
