import React, { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Trash2, 
  Users, 
  Link as LinkIcon,
  Calendar,
  TrendingUp,
  Eye,
  Clock,
  Shield,
  Plus,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import useClassInvites from '@/hooks/useClassInvites';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClassInviteManagerPremium({ classId }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [expirationDays, setExpirationDays] = useState(7);
  const [maxUses, setMaxUses] = useState(50);
  const [copiedCode, setCopiedCode] = useState(null);
  const [role, setRole] = useState('student');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
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
        maxUses: parseInt(maxUses, 10) || 50,
        expiresInHours: (parseInt(expirationDays, 10) || 7) * 24,
        role,
      });
      setShowCreateForm(false);
      toast.success('Link de convite criado com sucesso!');
    } catch (error) {
      console.error('Error creating invite:', error);
      toast.error('Erro ao criar convite');
    }
  };

  const handleCopyLink = (code) => {
    const link = `${window.location.origin}/join-class/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success('Link copiado!');
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  const handleRevokeInvite = async (inviteId) => {
    if (window.confirm('Tem certeza que deseja revogar este convite?')) {
      await revokeInvite(inviteId);
    }
  };

  const formatExpiration = (dateString) => {
    if (!dateString) return 'Não expira';
    
    const date = new Date(dateString);
    const now = new Date();
    
    if (date < now) {
      return <Badge variant="destructive" className="text-xs">Expirado</Badge>;
    }
  return (
      <span className="text-xs text-muted-foreground">
        {formatDistanceToNow(date, { addSuffix: true, locale: ptBR })}
      </span>
    );
  };

  const getStatusBadge = (invite) => {
    if (invite.status !== 'active') {
      return <Badge variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs bg-red-100 text-red-700 dark:bg-red-900/20">Cancelado</Badge>;
    }
    if (new Date(invite.expires_at) < new Date()) {
      return <Badge variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/20">Expirado</Badge>;
    }
    if (invite.current_uses >= invite.max_uses) {
      return <Badge variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs bg-gray-100 text-gray-700 dark:bg-gray-900/20">Esgotado</Badge>;
    }
    return <Badge variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs bg-green-100 text-green-700 dark:bg-green-900/20">Ativo</Badge>;
  };

  const totalInvites = invites.length;
  const activeInvites = invites.filter(i => 
    i.status === 'active' && 
    new Date(i.expires_at) > new Date() &&
    i.current_uses < i.max_uses
  ).length;
  const totalUses = invites.reduce((sum, i) => sum + (i.current_uses || 0), 0);
  const maxPossibleUses = invites.reduce((sum, i) => sum + i.max_uses, 0);
  return (
    <div className="space-y-6">
      {/* Header com Gradiente */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 p-8 text-white hover:opacity-90"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold">Convites da Turma</h2>
              </div>
              <p className="text-white/90 text-lg">
                Gerencie links de convite para alunos e professores
              </p>
            </div>
            
            <PremiumButton
              leftIcon={Plus}
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-white text-cyan-600 hover:bg-white/90 shadow-lg whitespace-nowrap inline-flex items-center gap-2 min-w-fit font-semibold border-2 border-white/20 px-6 py-3"
            >
              {showCreateForm ? 'Cancelar' : 'Novo Convite'}
            </PremiumButton>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total de Links</p>
                  <p className="text-3xl font-bold">{totalInvites}</p>
                </div>
                <LinkIcon className="w-8 h-8 text-white/60" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Links Ativos</p>
                  <p className="text-3xl font-bold text-green-300">{activeInvites}</p>
                </div>
                <Shield className="w-8 h-8 text-white/60" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total de Usos</p>
                  <p className="text-3xl font-bold text-blue-300">{totalUses}</p>
                </div>
                <Users className="w-8 h-8 text-white/60" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <PremiumCard variant="elevated" className="p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Criar Novo Convite
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="expiration" className="text-sm font-medium">Dias até expirar</Label>
                  <Input
                    id="expiration"
                    type="number"
                    min="1"
                    max="365"
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value)}
                    className="bg-white dark:bg-slate-900 text-foreground border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Expira em: {format(new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxUses" className="text-sm font-medium">Número máximo de usos</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    max="1000"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="bg-white dark:bg-slate-900 text-foreground border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    {maxUses} pessoas poderão usar este link
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tipo de Acesso</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="bg-white dark:bg-slate-900 text-foreground border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">👨‍🎓 Aluno</SelectItem>
                      <SelectItem value="teacher">👨‍🏫 Professor</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Usuário será adicionado como {role === 'student' ? 'aluno' : 'professor'}
                  </p>
                </div>
              </div>
              
              <PremiumButton
                onClick={handleCreateInvite}
                disabled={isLoading}
                leftIcon={isLoading ? RefreshCw : Plus}
                className="w-full whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90"
              >
                {isLoading ? 'Gerando...' : 'Gerar Link de Convite'}
              </PremiumButton>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invites List */}
      {invites.length > 0 && (
        <PremiumCard variant="elevated" className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Links Criados ({invites.length})
            </h3>
            <PremiumButton
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={fetchInvites}
              className="bg-white dark:bg-slate-900 text-foreground border-border whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2"
            >
              Atualizar
            </PremiumButton>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {invites.map((invite, index) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="border border-border rounded-xl p-5 hover:shadow-lg transition-all bg-white dark:bg-slate-900">
                    {/* Header com Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xl font-bold tracking-wider">
                              {invite.invitation_code}
                            </span>
                            {getStatusBadge(invite)}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Criado {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true, locale: ptBR })}
                            </span>
                            {invite.role && (
                              <Badge variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs">
                                {invite.role === 'student' ? '👨‍🎓 Aluno' : '👨‍🏫 Professor'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <PremiumButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeInvite(invite.id)}
                        disabled={invite.status !== 'active'}
                        className="text-destructive hover:text-destructive whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-3 py-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </PremiumButton>
                    </div>

                    {/* Link */}
                    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Label className="text-xs text-muted-foreground mb-1 block">Link do Convite</Label>
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-mono text-sm flex-1 truncate">
                          {window.location.origin}/join-class/{invite.invitation_code}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Uso</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">{invite.current_uses}/{invite.max_uses}</span>
                            <span className="text-xs text-muted-foreground">
                              {Math.round((invite.current_uses / invite.max_uses) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(invite.current_uses / invite.max_uses) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Expira</p>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-orange-500" />
                          {formatExpiration(invite.expires_at)}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Visualizações</p>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span className="text-lg font-bold">{invite.views || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <PremiumButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCode(invite.invitation_code)}
                        className="flex-1 whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copiar Código</span>
                      </PremiumButton>

                      <PremiumButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(invite.invitation_code)}
                        className="flex-1 whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2"
                      >
                        {copiedCode === invite.invitation_code ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-4 h-4" />
                            <span>Copiar Link</span>
                          </>
                        )}
                      </PremiumButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </PremiumCard>
      )}

      {invites.length === 0 && !showCreateForm && (
        <PremiumCard variant="elevated" className="p-12 text-center rounded-2xl">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Nenhum convite criado</h3>
          <p className="text-muted-foreground mb-6">
            Crie seu primeiro link de convite para adicionar alunos à turma
          </p>
          <PremiumButton
            leftIcon={Plus}
            onClick={() => setShowCreateForm(true)}
            className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-6 py-3"
          >
            Criar Primeiro Convite
          </PremiumButton>
        </PremiumCard>
      )}
    </div>
  );
}
