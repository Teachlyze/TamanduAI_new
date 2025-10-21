import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Copy, RefreshCw, Trash2, Check, Clock, Users, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useClassInvites from '@/hooks/useClassInvites';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

  const ClassInviteManager = ({ classId, className }) => {
  const { toast } = useToast();
  const [expirationDays, setExpirationDays] = useState(7);
  const [maxUses, setMaxUses] = useState(10);
  const [copiedInviteId, setCopiedInviteId] = useState(null);
  const [role, setRole] = useState('student');
  
  const { 
    invites, 
    isLoading, 
    createInvite, 
    revokeInvite,
    fetchInvites 
  } = useClassInvites(classId);

  useEffect(() => {
    if (classId) {
      fetchInvites();
    }
  }, [classId, fetchInvites]);

  const handleCreateInvite = async () => {
    try {
      await createInvite({
        maxUses: parseInt(maxUses, 10) || 10,
        expiresInHours: (parseInt(expirationDays, 10) || 7) * 24,
        role,
      });
    } catch (error) {
      console.error('Error creating invite:', error);
    }
  };

  const handleCopyInviteLink = (invitationCode) => {
    const inviteLink = `${window.location.origin}/join/${invitationCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInviteId(invitationCode);
    setTimeout(() => setCopiedInviteId(null), 2000);
    
    toast({
      title: 'Link copiado!',
      description: 'O link de convite foi copiado para a área de transferência.',
    });
  };

  const handleCopyInviteCode = (invitationCode) => {
    navigator.clipboard.writeText(invitationCode);
    toast({
      title: 'Código copiado!',
      description: 'O código de convite foi copiado para a área de transferência.',
    });
  };

  const handleRevokeInvite = async (inviteId) => {
    if (window.confirm('Tem certeza que deseja revogar este convite? Esta ação não pode ser desfeita.')) {
      await revokeInvite(inviteId);
    }
  };

  const formatExpiration = (dateString) => {
    if (!dateString) return 'Não expira';
    
    const date = new Date(dateString);
    const now = new Date();
    
    if (date < now) {
      return 'Expirado';
    }
    
    return `Expira em ${format(date, 'dd/MM/yyyy HH:mm')} (${formatDistanceToNow(date, { 
      addSuffix: true,
      locale: ptBR 
    })})`;
  };

  if (loading) return <LoadingScreen />;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Convites para a turma</CardTitle>
        <CardDescription>
          Crie links de convite para que alunos possam se juntar a esta turma sem necessidade de aprovação.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Criar novo convite</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiration">Dias até expirar</Label>
                <Input
                  id="expiration"
                  type="number"
                  min="1"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(e.target.value)}
                  className="max-w-[200px] bg-white dark:bg-slate-900 text-foreground border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxUses">Número máximo de usos</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="max-w-[200px] bg-white dark:bg-slate-900 text-foreground border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="max-w-[220px] bg-white dark:bg-slate-900 text-foreground border-border">
                    <SelectValue placeholder="Selecione o papel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleCreateInvite}
              disabled={isLoading}
              className="mt-2 whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-6 py-2.5 bg-white dark:bg-slate-900 text-foreground border-border"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Criando...</span>
                </>
              ) : (
                <span>Gerar link de convite</span>
              )}
            </Button>
          </div>
          
          {invites.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Links ativos</h3>
              <div className="space-y-3">
                {invites.map((invite) => (
                  <div 
                    key={invite.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Invitation Code */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Código do convite</Label>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-lg font-bold tracking-wider">
                              {invite.invitation_code}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyInviteCode(invite.invitation_code)}
                              className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-2 py-1"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Invitation Link */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Link do convite</Label>
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-mono text-sm truncate text-muted-foreground">
                              {`${window.location.origin}/join/${invite.invitation_code}`}
                            </span>
                          </div>
                        </div>
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatExpiration(invite.expires_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{invite.current_uses || 0} de {invite.max_uses} usos</span>
                          </div>
                          {invite.role && (
                            <div className="flex items-center gap-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">
                                {invite.role === 'student' ? 'Aluno' : 'Professor'}
                              </span>
                            </div>
                          )}
                          {invite.status && invite.status !== 'active' && (
                            <div className="flex items-center gap-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs">
                                {invite.status === 'cancelled' ? 'Cancelado' : 
                                 invite.status === 'expired' ? 'Expirado' : 
                                 invite.status === 'depleted' ? 'Esgotado' : invite.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyInviteLink(invite.invitation_code)}
                          disabled={copiedInviteId === invite.invitation_code}
                          className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2 bg-white dark:bg-slate-900 text-foreground border-border"
                        >
                          {copiedInviteId === invite.invitation_code ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              <span>Copiar Link</span>
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-3 py-2"
                          onClick={() => handleRevokeInvite(invite.id)}
                          disabled={isLoading || invite.status !== 'active'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassInviteManager;
