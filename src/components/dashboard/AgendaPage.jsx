// src/components/dashboard/AgendaPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import CalendarService from '@/services/calendarService';
import { supabase } from '@/lib/supabaseClient';
import { AttachmentService } from '@/services/attachmentService';
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, AlertTriangle, Bell, Users, Paperclip } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import MeetingAttachmentUploader from '@/components/uploads/MeetingAttachmentUploader';
import EventAttachmentUploader from '@/components/uploads/EventAttachmentUploader';

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

const AgendaPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTeacher, setIsTeacher] = useState(true); // default to teacher if role lookup fails
  const [attachmentsByEvent, setAttachmentsByEvent] = useState({});

  const from = useMemo(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), []);
  const to = useMemo(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), []);

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await CalendarService.getUserCalendar({ from, to });
      setEvents(res);
      // Load attachments in background (non-blocking) to avoid UI stalls
      (async () => {
        try {
          const mapEntries = await Promise.allSettled(
            (res || []).slice(0, 50).map(async (e) => {
              try {
                if (e.meeting_id) {
                  const list = await AttachmentService.getMeetingAttachments(e.meeting_id);
                  return [`meeting:${e.meeting_id}`, list];
                } else {
                  const list = await AttachmentService.getEventAttachments(e.id);
                  return [`event:${e.id}`, list];
                }
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
        } catch {}
      })();
    } catch (e) {
      const msg = e?.message || 'Falha ao carregar agenda';
      setError(msg);
      toast({ title: 'Erro ao carregar Agenda', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    if (!user?.id) return;
    // Determine role once; if query fails, default remains 'teacher'
    (async () => {
      try {
        // Get role from user metadata first
        if (user.user_metadata?.role) {
          setIsTeacher(user.user_metadata.role === 'teacher');
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        if (!error) setIsTeacher((data?.role || 'teacher') === 'teacher');
      } catch {
        setIsTeacher(true);
      }
    })();
    const unsubscribe = CalendarService.subscribeUserCalendar(user.id, () => {
      refresh();
    });
    return unsubscribe;
  }, [user?.id, user?.user_metadata?.role]);

  const conflicts = useMemo(() => CalendarService.detectConflicts(events), [events]);

  const grouped = useMemo(() => groupByDay(events), [events]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" /> Agenda
        </h1>
        <button
          onClick={refresh}
          className="px-3 py-2 text-sm rounded-md bg-primary text-white hover:opacity-90"
        >
          Atualizar
        </button>
      </div>

      {loading && <div>Carregando...</div>}
      {error && <div className="text-red-500">{error}</div>}

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
                      {e.meeting_id && <span>Reunião</span>}
                      {e.activity_id && <span>Prazo de Atividade</span>}
                    </div>
                    {/* Attachments indicator + preview (lazy, best-effort) */}
                    <div className="mt-2 text-xs">
                      {(() => {
                        const key = e.meeting_id ? `meeting:${e.meeting_id}` : `event:${e.id}`;
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
                        e.meeting_id ? (
                          <div className="ml-2">
                            <MeetingAttachmentUploader meetingId={e.meeting_id} userId={user?.id} onUploaded={() => refresh()} />
                          </div>
                        ) : (
                          <div className="ml-2">
                            <EventAttachmentUploader eventId={e.id} userId={user?.id} onUploaded={() => refresh()} />
                          </div>
                        )
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

export default AgendaPage;
