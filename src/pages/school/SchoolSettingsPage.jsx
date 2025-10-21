import { Settings, Image, Calendar, Award, Users, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import schoolService from '@/services/schoolService';
import { supabase } from '@/lib/supabaseClient';

const SchoolSettingsPage = () => {
  const { user } = useAuth();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [settings, setSettings] = useState({
    grading_scale: {
      excellent: 9.0,
      good: 7.0,
      passing: 5.0,
    },
    academic_periods: {
      bimester: true,
      trimester: false,
      semester: false,
    },
    features: {
      social_feed_enabled: true,
      gamification_enabled: true,
      allow_late_submissions: true,
    },
    notifications: {
      email_announcements: true,
      email_reports: true,
    },
  });

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
        // Buscar dados da escola
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .eq('id', schoolData.id)
          .single();

        if (error) throw error;

        if (data) {
          setName(data.name || '');
          // prefer logo stored inside settings to avoid schema mismatch
          const mergedSettings = { ...settings, ...(data.settings || {}) };
          setSettings(mergedSettings);
          setLogoUrl(mergedSettings?.branding?.logo_url || mergedSettings?.logo_url || '');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!school?.id) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const { error: updateError } = await supabase
        .from('schools')
        .update({
          name: name.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', school.id);

      if (updateError) throw updateError;

      setSuccess('Configurações salvas com sucesso!');
      
      // Recarregar dados
      await loadData();
    } catch (error) {
      setError(error.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
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
      <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
        <p className="text-muted-foreground">Escola não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações da Escola</h2>
        <p className="text-sm text-muted-foreground">
          Configure as preferências e padrões de {school.name}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Informações Básicas */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome da Escola</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2 bg-white dark:bg-slate-900 text-foreground"
                disabled={saving}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                <Image className="mr-1 inline h-4 w-4" />
                URL do Logo
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://exemplo.com/logo.png"
                className="w-full rounded-lg border border-border px-4 py-2 bg-white dark:bg-slate-900 text-foreground"
                disabled={saving}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                URL pública da imagem do logo da escola
              </p>
            </div>
          </div>
        </div>

        {/* Escala de Notas */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Escala de Notas</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Excelente (≥)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={settings.grading_scale.excellent}
                onChange={(e) => updateSetting('grading_scale', 'excellent', parseFloat(e.target.value))}
                className="w-full rounded-lg border border-border px-4 py-2 bg-white dark:bg-slate-900 text-foreground"
                disabled={saving}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Bom (≥)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={settings.grading_scale.good}
                onChange={(e) => updateSetting('grading_scale', 'good', parseFloat(e.target.value))}
                className="w-full rounded-lg border border-border px-4 py-2 bg-white dark:bg-slate-900 text-foreground"
                disabled={saving}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Aprovado (≥)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={settings.grading_scale.passing}
                onChange={(e) => updateSetting('grading_scale', 'passing', parseFloat(e.target.value))}
                className="w-full rounded-lg border border-border px-4 py-2 bg-white dark:bg-slate-900 text-foreground"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Períodos Acadêmicos */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Períodos Acadêmicos</h3>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.academic_periods.bimester}
                onChange={(e) => updateSetting('academic_periods', 'bimester', e.target.checked)}
                disabled={saving}
              />
              <span className="text-sm">Bimestral (4 períodos por ano)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.academic_periods.trimester}
                onChange={(e) => updateSetting('academic_periods', 'trimester', e.target.checked)}
                disabled={saving}
              />
              <span className="text-sm">Trimestral (3 períodos por ano)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.academic_periods.semester}
                onChange={(e) => updateSetting('academic_periods', 'semester', e.target.checked)}
                disabled={saving}
              />
              <span className="text-sm">Semestral (2 períodos por ano)</span>
            </label>
          </div>
        </div>

        {/* Funcionalidades */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Funcionalidades</h3>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.features.social_feed_enabled}
                onChange={(e) => updateSetting('features', 'social_feed_enabled', e.target.checked)}
                disabled={saving}
              />
              <span className="text-sm">Habilitar feed social de conquistas</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.features.gamification_enabled}
                onChange={(e) => updateSetting('features', 'gamification_enabled', e.target.checked)}
                disabled={saving}
              />
              <span className="text-sm">Habilitar sistema de gamificação</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.features.allow_late_submissions}
                onChange={(e) => updateSetting('features', 'allow_late_submissions', e.target.checked)}
                disabled={saving}
              />
              <span className="text-sm">Permitir entregas atrasadas</span>
            </label>
          </div>
        </div>

        {/* Notificações */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Notificações</h3>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.notifications.email_announcements}
                onChange={(e) => updateSetting('notifications', 'email_announcements', e.target.checked)}
                disabled={saving}
              />
              <span className="text-sm">Enviar comunicados por email</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.notifications.email_reports}
                onChange={(e) => updateSetting('notifications', 'email_reports', e.target.checked)}
                disabled={saving}
              />
              <span className="text-sm">Enviar relatórios semanais por email</span>
            </label>
          </div>
        </div>

        {/* Messages */}
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

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-3 font-semibold t text-white hover:opacity-90 whitespace-nowrap inline-flex min-w-fitext-white shadow-lg hover:from-slate-700 hover:to-slate-800 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
        </button>
      </form>
    </div>
  );
};

export default SchoolSettingsPage;
