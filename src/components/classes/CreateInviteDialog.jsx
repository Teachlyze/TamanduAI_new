// src/components/classes/CreateInviteDialog.jsx
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  Mail,
  Link2,
  Copy,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CreateInviteDialog = ({ classId, className, onInviteCreated }) => {
  const [open, setOpen] = useState(false);
  const [inviteType, setInviteType] = useState('link');
  const [email, setEmail] = useState('');
  const [expiresIn, setExpiresIn] = useState(7);
  const [loading, setLoading] = useState(false);
  const [inviteData, setInviteData] = useState(null);

  const handleCreateInvite = async () => {
    if (inviteType === 'email' && !email) {
      toast({
        title: 'Email obrigatório',
        description: 'Por favor, insira o email do aluno.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/classes/${classId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteType,
          email: inviteType === 'email' ? email : null,
          expiresIn: parseInt(expiresIn)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteData(data.invite);
        toast({
          title: 'Convite criado!',
          description: inviteType === 'link'
            ? 'Link de convite gerado com sucesso.'
            : 'Email enviado com sucesso.',
        });

        if (onInviteCreated) {
          onInviteCreated(data.invite);
        }
      } else {
        throw new Error(data.message || 'Erro ao criar convite');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Link copiado para a área de transferência.',
    });
  };

  const resetDialog = () => {
    setInviteType('link');
    setEmail('');
    setExpiresIn(7);
    setInviteData(null);
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetDialog();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Users className="w-4 h-4 mr-2" />
          Convidar Alunos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Convidar para {className}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!inviteData ? (
            <>
              {/* Invite Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Tipo de Convite</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      inviteType === 'link'
                        ? 'border-blue-500 bg-blue-50 dark:bg-muted/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setInviteType('link')}
                  >
                    <div className="flex items-center gap-3">
                      <Link2 className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Link</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Compartilhar link
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      inviteType === 'email'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setInviteType('email')}
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enviar por email
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Input (only for email invites) */}
              {inviteType === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email do Aluno</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="aluno@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              {/* Expiration Settings */}
              <div className="space-y-2">
                <Label>Expira em</Label>
                <Select value={expiresIn.toString()} onValueChange={setExpiresIn}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 dia</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateInvite}
                disabled={loading || (inviteType === 'email' && !email)}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {inviteType === 'link' ? 'Gerar Link' : 'Enviar Convite'}
              </Button>
            </>
          ) : (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Convite Criado!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {inviteType === 'link'
                    ? 'Link de convite gerado com sucesso.'
                    : 'Email enviado com sucesso.'}
                </p>
              </div>

              {inviteData.inviteUrl && (
                <div className="space-y-2">
                  <Label>Link do Convite</Label>
                  <div className="flex gap-2">
                    <Input
                      value={inviteData.inviteUrl}
                      readOnly
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(inviteData.inviteUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Expira em: {new Date(inviteData.expiresAt).toLocaleDateString('pt-BR')}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={resetDialog}
                  className="flex-1"
                >
                  Criar Outro
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInviteDialog;

