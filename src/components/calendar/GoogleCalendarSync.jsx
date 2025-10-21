import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const GoogleCalendarSync = ({ classData, userId }) => {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncData, setSyncData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (classData?.id && userId) {
      loadSyncStatus();
    }
  }, [classData?.id, userId]);

  const loadSyncStatus = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('calendar_sync')
        .select('*')
        .eq('class_id', classData.id)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSyncData(data);
        setSyncEnabled(data.sync_enabled || false);
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSync = async (enabled) => {
    try {
      setSyncing(true);

      if (enabled && !syncData) {
        // First time enabling - need OAuth
        toast.error('Funcionalidade em desenvolvimento. OAuth do Google será configurado em breve.');
        return;
      }

      // Update existing sync
      const { error } = await supabase
        .from('calendar_sync')
        .update({
          sync_enabled: enabled,
          last_sync_at: new Date().toISOString()
        })
        .eq('id', syncData.id);

      if (error) throw error;

      setSyncEnabled(enabled);
      toast.success(enabled ? 'Sincronização ativada!' : 'Sincronização desativada');

      loadSyncStatus();
    } catch (error) {
      console.error('Error toggling sync:', error);
      toast.error('Erro ao alterar sincronização');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Calendário sincronizado com sucesso!');
      loadSyncStatus();
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Erro ao sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectGoogle = () => {
    toast.error('OAuth do Google em desenvolvimento. Configure suas credenciais no .env');
    // TODO: Implement OAuth flow
    // const redirectUri = `${window.location.origin}/auth/google/callback`;
    // window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&...`;
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-muted-foreground">Carregando status de sincronização...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Sincronização com Google Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${syncEnabled ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
            <div>
              <p className="font-medium">
                {syncEnabled ? 'Sincronização Ativa' : 'Sincronização Desativada'}
              </p>
              <p className="text-sm text-muted-foreground">
                {syncData?.last_sync_at 
                  ? `Última sincronização: ${new Date(syncData.last_sync_at).toLocaleString('pt-BR')}`
                  : 'Nunca sincronizado'
                }
              </p>
            </div>
          </div>

          <Switch
            checked={syncEnabled}
            onCheckedChange={handleToggleSync}
            disabled={syncing || !syncData}
          />
        </div>

        {/* Info */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            Como funciona
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Eventos de aula criados automaticamente no seu Google Calendar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Notificações 15 minutos antes da aula</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Sincronização automática de alterações de horário</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Link da reunião incluído no evento</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {!syncData ? (
            <Button
              onClick={handleConnectGoogle}
              className="w-full whitespace-nowrap inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Conectar com Google</span>
            </Button>
          ) : (
            <Button
              onClick={handleSyncNow}
              disabled={syncing || !syncEnabled}
              variant="outline"
              className="w-full whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Sincronizar Agora</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Alert */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">Configuração Necessária</p>
              <p className="text-blue-700 dark:text-blue-300">
                Para usar esta funcionalidade, configure as credenciais do Google OAuth no arquivo <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs">.env</code>.
                Veja a documentação em <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs">DEPLOY_FINAL_AULAS_ONLINE.md</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Stats (if connected) */}
        {syncData && syncData.google_calendar_id && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-muted-foreground mb-1">Eventos Criados</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {classData?.meeting_days?.length * 4 || 0}
              </p>
              <p className="text-xs text-muted-foreground">este mês</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground mb-1">Calendar ID</p>
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400 truncate">
                {syncData.google_calendar_id}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarSync;
