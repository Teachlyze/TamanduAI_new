import { Send, MessageSquare, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import schoolService from '@/services/schoolService';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const AnnouncementCard = ({ announcement }) => {
  const getAudienceText = () => {
    const audience = announcement.audience || {};
    if (audience.all) return 'Todos';
    if (audience.teachers) return 'Professores';
    if (audience.classes && audience.classes.length > 0) {
      return `${audience.classes.length} turma${audience.classes.length > 1 ? 's' : ''}`;
    }
    return 'Não especificado';
  };

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-semibold">{announcement.title}</div>
          <p className="mt-2 text-sm text-muted-foreground">
            {announcement.body}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {getAudienceText()}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(announcement.created_at).toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  );
};

const SchoolCommsPage = () => {
  const { user } = useAuth();
  const [school, setSchool] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audienceType, setAudienceType] = useState('all');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [publishAt, setPublishAt] = useState('');

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const schoolData = await schoolService.getUserSchool(user.id);
      setSchool(schoolData);

      if (schoolData?.id) {
        // Buscar comunicados
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('school_announcements')
          .select('*')
          .eq('school_id', schoolData.id)
          .order('created_at', { ascending: false });

        if (announcementsError) throw announcementsError;
        setAnnouncements(announcementsData || []);

        // Buscar turmas vinculadas
        const classesData = await schoolService.getClasses(schoolData.id);
        setClasses(classesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!school?.id || !title.trim() || !body.trim()) return;

    try {
      setSending(true);
      setError(null);
      setSuccess(null);

      // Preparar audience
      const audience = {};
      if (audienceType === 'all') {
        audience.all = true;
      } else if (audienceType === 'teachers') {
        audience.teachers = true;
      } else if (audienceType === 'classes') {
        audience.classes = selectedClasses;
      }

      // Inserir comunicado
      let insertError = null;
      const { error: insertErr1 } = await supabase
        .from('school_announcements')
        .insert({
          school_id: school.id,
          title: title.trim(),
          body: body.trim(),
          audience,
          created_by: user.id,
          publish_at: publishAt ? new Date(publishAt).toISOString() : null,
        });
      insertError = insertErr1;

      // Fallback: se a coluna publish_at não existir, tentar sem ela
      if (insertError && /publish_at/.test(insertError.message || '')) {
        const { error: insertErr2 } = await supabase
          .from('school_announcements')
          .insert({
            school_id: school.id,
            title: title.trim(),
            body: body.trim(),
            audience,
            created_by: user.id,
          });
        insertError = insertErr2;
      }

      if (insertError) throw insertError;

      setSuccess('Comunicado enviado com sucesso!');
      
      // Limpar form
      setTitle('');
      setBody('');
      setAudienceType('all');
      setSelectedClasses([]);
      setPublishAt('');

      // Recarregar lista
      await loadData();
    } catch (error) {
      setError(error.message || 'Erro ao enviar comunicado');
    } finally {
      setSending(false);
    }
  };

  const toggleClass = (classId) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!school) {
    return (
      <PremiumCard className="p-8 text-center">
        <p className="text-muted-foreground">Escola não encontrada.</p>
      </PremiumCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-2xl t text-white hover:opacity-90 whitespace-nowrap inline-flex items-center gap-2 min-w-fitext-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Comunicados</h1>
              <p className="text-white/90 mt-1">Envie comunicados para professores e turmas de {school.name}</p>
            </div>
          </div>
          <PremiumButton className="bg-white text-indigo-700 hover:bg-white/90 whitespace-nowrap">Novo Comunicado</PremiumButton>
        </div>
      </div>

      {/* Form para enviar comunicado */}
      <PremiumCard>
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Novo Comunicado</h3>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Título */}
            <div>
              <label className="mb-1 block text-sm font-medium">Título</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reunião de Pais"
                disabled={sending}
                required
                className="bg-white dark:bg-slate-900"
              />
            </div>

            {/* Mensagem */}
            <div>
              <label className="mb-1 block text-sm font-medium">Mensagem</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Digite a mensagem do comunicado..."
                rows={4}
                disabled={sending}
                required
                className="bg-white dark:bg-slate-900"
              />
            </div>

            {/* Data/hora de publicação */}
            <div>
              <label className="mb-1 block text-sm font-medium">Data e hora de publicação (opcional)</label>
              <Input
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                className="bg-white dark:bg-slate-900"
              />
            </div>

            {/* Destinatários */}
            <div>
              <label className="mb-3 block text-sm font-medium">Destinatários</label>
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-border">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-white dark:bg-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <input
                    type="radio"
                    name="audience"
                    value="all"
                    checked={audienceType === 'all'}
                    onChange={(e) => setAudienceType(e.target.value)}
                    disabled={sending}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium">Todos (professores e alunos)</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-white dark:bg-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <input
                    type="radio"
                    name="audience"
                    value="teachers"
                    checked={audienceType === 'teachers'}
                    onChange={(e) => setAudienceType(e.target.value)}
                    disabled={sending}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Apenas professores</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-white dark:bg-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <input
                    type="radio"
                    name="audience"
                    value="classes"
                    checked={audienceType === 'classes'}
                    onChange={(e) => setAudienceType(e.target.value)}
                    disabled={sending}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Turmas específicas</span>
                  </div>
                </label>
              </div>

              {/* Seleção de turmas */}
              {audienceType === 'classes' && (
                <div className="mt-4 space-y-2 rounded-lg border border-border p-4 bg-white dark:bg-slate-800">
                  <div className="text-sm font-semibold mb-3">Selecione as turmas:</div>
                  {classes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma turma vinculada.</p>
                  ) : (
                    <div className="space-y-2">
                      {classes.map(cls => (
                        <label key={cls.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedClasses.includes(cls.id)}
                            onChange={() => toggleClass(cls.id)}
                            disabled={sending}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span className="text-sm font-medium">{cls.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
                {success}
              </div>
            )}

            <PremiumButton
              type="submit"
              disabled={sending || !title.trim() || !body.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 t text-white hover:opacity-90 whitespace-nowrap inline-flex items-center gap-2 min-w-fitext-white"
              loading={sending}
            >
              {sending ? 'Enviando...' : 'Enviar Comunicado'}
            </PremiumButton>
          </form>
        </div>
      </PremiumCard>

      {/* Histórico de comunicados */}
      <PremiumCard>
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Histórico de Comunicados</h3>
          </div>

          {announcements.length === 0 ? (
            <div className="rounded-lg border border-border/50 bg-card p-8 text-center text-muted-foreground">
              Nenhum comunicado enviado ainda.
            </div>
          ) : (
            announcements.map(announcement => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))
          )}
        </div>
      </PremiumCard>
    </div>
  );
};

export default SchoolCommsPage;
