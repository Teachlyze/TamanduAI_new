import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from "@/hooks/useAuth";
import useUserRole from '@/hooks/useUserRole';
import Button from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Video, Plus, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useUserMeetings } from '../../hooks/useRedisCache';

export default function MeetingsPage() {
  const { user } = useAuth();
  const { isTeacher } = useUserRole();
  const navigate = useNavigate();

  // Use Redis cache for meetings data
  const { data: meetingsData, loading: meetingsLoading, error: meetingsError } = useUserMeetings(user?.id);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(meetingsLoading);
      setError(meetingsError);

      if (meetingsData) {
        // Transform cache data to component format
        const formattedMeetings = meetingsData.map((meeting) => ({
          id: meeting.id,
          title: meeting.title || 'Reunião',
          class_id: meeting.class_id,
          start_time: meeting.start_time,
          end_time: meeting.end_time,
          description: meeting.description,
          status: meeting.status,
          created_by: meeting.created_by,
        }));

        setMeetings(formattedMeetings);
      } else if (!meetingsLoading) {
        // Fallback to direct database query if no cache
        const { data, error } = await supabase
          .from('meetings')
          .select('id, title, class_id, start_time, end_time, description, status, created_by')
          .order('start_time', { ascending: false })
          .limit(50);

        if (error) throw error;
        setMeetings(data || []);
      }
    } catch (e) {
      setError(e.message || 'Falha ao carregar reuniões');
    }
  }, [meetingsData, meetingsLoading, meetingsError]);
  useEffect(() => {
    if (user?.id) {
      loadMeetings();
    }
  }, [user?.id, loadMeetings]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Salas vinculadas às suas turmas</p>
        </div>
        {isTeacher && (
          <Button onClick={() => navigate('/dashboard/calendar')}>
            <Plus className="w-4 h-4 mr-2" /> Agendar pela Agenda
          </Button>
        )}
      </div>

      {loading ? (
        <div>Carregando…</div>
      ) : error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : meetings.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="font-medium">Nenhuma reunião encontrada</p>
          <p className="text-sm text-muted-foreground">Use a Agenda para criar um novo evento de reunião</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((m) => (
            <Card key={m.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{m.title || 'Reunião'}</div>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-sm text-muted-foreground">
                {m.class_id ? `Turma: ${m.class_id.slice(0,8)}…` : 'Sem turma'}
              </div>
              <div className="text-xs text-muted-foreground">
                {m.start_time ? format(new Date(m.start_time), 'dd/MM/yyyy HH:mm') : '—'}
              </div>
              <div className="pt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate(`/meetings/${m.id}`)}>
                  <Video className="w-4 h-4 mr-1" /> Entrar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
