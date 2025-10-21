import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { 
  Shield, 
  User, 
  Bell, 
  Lock, 
  Download, 
  Settings as SettingsIcon,
  Palette,
  Globe,
  Database,
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  Mail,
  Eye,
  UserCheck,
  Accessibility
} from 'lucide-react';
import AccessibilitySettings from '@/components/ui/AccessibilitySettings';

  const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      desktop: false,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: false,
      analytics: true,
      cookies: true,
    },
    account: {
      email: '',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      theme: 'system',
    },
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('tamanduai-settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async (section) => {
    try {
      // Save to localStorage
      localStorage.setItem('tamanduai-settings', JSON.stringify(settings));

      // Show success message
      toast({
        title: 'Configurações salvas',
        description: 'Suas configurações foram atualizadas com sucesso!',
      });

      // Here you could also save to backend if needed
      // await saveSettingsToBackend(settings);

    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar suas configurações. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: 'Exportação iniciada',
      description: 'Seus dados serão enviados por email em até 24 horas.',
    });
  };

  const handleDeleteAccount = () => {
    toast({
      variant: "destructive",
      title: 'Ação não permitida',
      description: 'Entre em contato com o suporte para excluir sua conta.',
    });
  };

  // Apply theme changes
  useEffect(() => {
    if (!isLoading && settings.account.theme) {
      const root = window.document.documentElement;

      if (settings.account.theme === 'dark') {
        root.classList.add('dark');
      } else if (settings.account.theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System theme - check system preference
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }
  }, [settings.account.theme, isLoading]);

  // Show loading state while settings are being loaded
  if (isLoading) {
    if (loading) return <LoadingScreen />;

  return (
      <div className="w-full space-y-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded-lg w-48 mb-4"></div>
            <div className="h-4 bg-white/20 rounded-lg w-96"></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="w-full space-y-8">
      {/* Header Section with Gradient Background */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                ⚙️ Configurações
              </h1>
              <p className="text-purple-100 text-lg max-w-2xl">
                Gerencie suas preferências de conta, notificações e privacidade para uma experiência personalizada.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <SettingsIcon className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl"></div>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-100 dark:bg-gray-800 rounded-2xl p-2 h-auto gap-2">
            <TabsTrigger 
              value="account"
              className="flex items-center gap-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all py-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white hover:opacity-90">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Conta</span>
            </TabsTrigger>
            <TabsTrigger 
              value="accessibility"
              className="flex items-center gap-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all py-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white hover:opacity-90">
                <Accessibility className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Acessibilidade</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications"
              className="flex items-center gap-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all py-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white hover:opacity-90">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Notificações</span>
            </TabsTrigger>
            <TabsTrigger 
              value="privacy"
              className="flex items-center gap-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all py-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white hover:opacity-90">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Privacidade</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accessibility">
            <AccessibilitySettings />
          </TabsContent>

          <TabsContent value="account">
            <div className="grid gap-6">
              <Card className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white hover:opacity-90">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    Informações da Conta
                  </CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais e preferências de idioma.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        E-mail
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={settings.account.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          account: { ...settings.account, email: e.target.value }
                        })}
                        placeholder="seu@email.com"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Idioma
                      </Label>
                      <Select
                        value={settings.account.language}
                        onValueChange={(value) => setSettings({
                          ...settings,
                          account: { ...settings.account, language: value }
                        })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Selecione um idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">🇧🇷 Português (Brasil)</SelectItem>
                          <SelectItem value="en-US">🇺🇸 English (US)</SelectItem>
                          <SelectItem value="es-ES">🇪🇸 Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Fuso Horário
                      </Label>
                      <Select
                        value={settings.account.timezone}
                        onValueChange={(value) => setSettings({
                          ...settings,
                          account: { ...settings.account, timezone: value }
                        })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Selecione o fuso horário" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                          <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                          <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="theme" className="flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Tema
                      </Label>
                      <Select
                        value={settings.account.theme}
                        onValueChange={(value) => setSettings({
                          ...settings,
                          account: { ...settings.account, theme: value }
                        })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Selecione o tema" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">☀️ Claro</SelectItem>
                          <SelectItem value="dark">🌙 Escuro</SelectItem>
                          <SelectItem value="system">💻 Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleSaveSettings('account')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl text-white hover:opacity-90"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Salvar alterações
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white hover:opacity-90">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  Preferências de Notificação
                </CardTitle>
                <CardDescription>
                  Escolha como e quando você gostaria de receber notificações.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications" className="text-base font-medium">Notificações por e-mail</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba atualizações importantes sobre atividades e turmas.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, email: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications" className="text-base font-medium">Notificações no navegador</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações em tempo real no seu navegador.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, push: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="desktop-notifications" className="text-base font-medium">Notificações desktop</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações na área de trabalho do seu computador.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="desktop-notifications"
                      checked={settings.notifications.desktop}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, desktop: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing-notifications" className="text-base font-medium">E-mails promocionais</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba novidades, dicas e ofertas especiais.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="marketing-notifications"
                      checked={settings.notifications.marketing}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, marketing: checked }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSaveSettings('notifications')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white hover:opacity-90"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Salvar preferências
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <div className="space-y-6">
              <Card className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white hover:opacity-90">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    Privacidade e Dados
                  </CardTitle>
                  <CardDescription>
                    Gerencie suas preferências de privacidade e controle de dados pessoais.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <Label htmlFor="profile-visibility" className="text-base font-medium">Visibilidade do Perfil</Label>
                          <p className="text-sm text-muted-foreground">
                            Controle quem pode ver seu perfil e atividades.
                          </p>
                        </div>
                      </div>
                      <Select
                        value={settings.privacy.profileVisibility}
                        onValueChange={(value) => setSettings({
                          ...settings,
                          privacy: { ...settings.privacy, profileVisibility: value }
                        })}
                      >
                        <SelectTrigger className="w-40 rounded-xl">
                          <SelectValue placeholder="Visibilidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">🌍 Público</SelectItem>
                          <SelectItem value="connections">👥 Conexões</SelectItem>
                          <SelectItem value="private">🔒 Privado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="space-y-0.5">
                          <Label htmlFor="data-sharing" className="text-base font-medium">Compartilhamento de Dados</Label>
                          <p className="text-sm text-muted-foreground">
                            Permitir uso anônimo de dados para melhorias do produto.
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="data-sharing"
                        checked={settings.privacy.dataSharing}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          privacy: { ...settings.privacy, dataSharing: checked }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="space-y-0.5">
                          <Label htmlFor="analytics" className="text-base font-medium">Analytics e Métricas</Label>
                          <p className="text-sm text-muted-foreground">
                            Permitir coleta de dados de uso para analytics.
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="analytics"
                        checked={settings.privacy.analytics}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          privacy: { ...settings.privacy, analytics: checked }
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Export Section */}
              <Card className="rounded-2xl border border-blue-200 dark:border-blue-800 shadow-lg bg-blue-50/50 dark:bg-blue-900/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-blue-900 dark:text-blue-100">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white hover:opacity-90">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    Exportar Dados Pessoais
                  </CardTitle>
                  <CardDescription>
                    Baixe uma cópia completa dos seus dados pessoais conforme a LGPD.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    Você receberá um arquivo ZIP com todos os seus dados em até 24 horas no seu e-mail cadastrado.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    className="bg-white dark:bg-slate-900 text-foreground border-border border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-muted/30 rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Solicitar exportação
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="rounded-2xl border border-red-200 dark:border-red-800 shadow-lg bg-red-50/50 dark:bg-red-900/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-red-900 dark:text-red-100">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white hover:opacity-90">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    Zona de Perigo
                  </CardTitle>
                  <CardDescription>
                    Ações irreversíveis que afetam permanentemente sua conta.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                      <h4 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Excluir Conta Permanentemente
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        Esta ação não pode ser desfeita. Todos os seus dados, turmas, atividades e configurações serão removidos permanentemente.
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700 rounded-xl"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Excluir minha conta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default SettingsPage;

