import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, PremiumButton, LoadingScreen } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Send, CheckCircle2, UserPlus, AlertCircle, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InviteTeacherPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    teacherName: '',
    message: '',
  });

  const handleSendInvite = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.teacherName) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email inválido.');
      return;
    }

    setSending(true);

    try {
      // Buscar dados da escola (pegar id e name do school onde o usuário é owner)
      const { data: schoolsData, error: schoolError } = await supabase
        .from('schools')
        .select('id, name, owner_id')
        .eq('owner_id', user.id);

      if (schoolError || !schoolsData || schoolsData.length === 0) {
        throw new Error('Escola não encontrada. Certifique-se de que você é o dono de uma escola.');
      }

      const schoolData = schoolsData[0];

      // Gerar token de convite
      const inviteToken = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const inviteLink = `${window.location.origin}/register/teacher?invite=${inviteToken}&school=${schoolData.name}`;

      // Salvar convite no banco com o school_id correto
      const { error: inviteError } = await supabase.from('teacher_invites').insert({
        school_id: schoolData.id,
        email: formData.email,
        teacher_name: formData.teacherName,
        invite_token: inviteToken,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      });

      if (inviteError) throw inviteError;

      // Chamar edge function para enviar email via Resend
      const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-email-v2', {
        body: {
          to: formData.email,
          subject: `Convite para ser Professor na ${schoolData.name} - TamanduAI`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Convite para Professor</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎓 TamanduAI</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Plataforma de Educação Inteligente</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Olá, ${formData.teacherName}! 👋</h2>
                  
                  <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                    Você foi convidado(a) para fazer parte do corpo docente da <strong style="color: #667eea;">${schoolData.name}</strong> na plataforma TamanduAI!
                  </p>
                  
                  ${
                    formData.message
                      ? `
                  <div style="background: #f3f4f6; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px;">
                    <p style="color: #374151; margin: 0; font-style: italic; line-height: 1.6;">
                      "${formData.message}"
                    </p>
                  </div>
                  `
                      : ''
                  }
                  
                  <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 12px; padding: 25px; margin: 30px 0;">
                    <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">O que você pode fazer na TamanduAI:</h3>
                    <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Criar e gerenciar turmas</li>
                      <li>Publicar atividades e quizzes interativos</li>
                      <li>Acompanhar o desempenho dos alunos com analytics avançado</li>
                      <li>Sistema de gamificação e missões</li>
                      <li>Chatbot IA para suporte aos alunos</li>
                      <li>E muito mais!</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                      Aceitar Convite
                    </a>
                  </div>
                  
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 30px;">
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                      <strong>⏰ Importante:</strong> Este convite expira em 7 dias.
                    </p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                    Se você não reconhece este convite ou não deseja aceitar, pode ignorar este email.
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                    © 2025 TamanduAI - Plataforma de Educação Inteligente
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                    Link do convite: <span style="color: #667eea;">${inviteLink}</span>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        },
      });

      if (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Mesmo se falhar, o convite foi salvo no banco
        toast.success(`Convite salvo no sistema!`);
      } else {
        toast.success(`✅ Convite enviado para ${formData.email}`);

        // Adicionar à lista de emails enviados
        setSentEmails((prev) => [
          ...prev,
          {
            email: formData.email,
            name: formData.teacherName,
            sentAt: new Date(),
            link: inviteLink,
          },
        ]);
      }

      // Mostrar popup com link
      setInviteLink(inviteLink);
      setShowLinkDialog(true);
      setLinkCopied(false);

      // Limpar formulário
      setFormData({
        email: '',
        teacherName: '',
        message: '',
      });
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      toast.error('Não foi possível enviar o convite. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    toast.success('Link copiado para área de transferência!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-2xl text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Convidar Professores</h1>
            <p className="text-white/90 mt-1">Envie convites por email para novos professores</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Novo Convite</h2>
                <p className="text-sm text-muted-foreground">Preencha os dados do professor</p>
              </div>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email do Professor *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="professor@exemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nome do Professor *</label>
                <Input
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  placeholder="João Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mensagem Personalizada (opcional)</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Adicione uma mensagem de boas-vindas..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Como funciona:</strong> O professor receberá um email com link de cadastro. O convite expira em 7 dias.
                  </div>
                </div>
              </div>

              <PremiumButton
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white whitespace-nowrap inline-flex items-center justify-center gap-2"
                loading={sending}
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Enviando...' : 'Enviar Convite'}</span>
              </PremiumButton>
            </form>
          </div>
        </PremiumCard>

        {/* Sent Emails List */}
        <PremiumCard variant="elevated">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Convites Enviados</h2>
                <p className="text-sm text-muted-foreground">{sentEmails.length} nesta sessão</p>
              </div>
            </div>

            {sentEmails.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Nenhum convite enviado ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {sentEmails.map((sent, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">{sent.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{sent.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enviado às {sent.sentAt.toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-white dark:bg-black/20 rounded text-xs font-mono break-all">
                        {sent.link}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </PremiumCard>
      </div>

      {/* Info Card */}
      <PremiumCard variant="elevated">
        <div className="p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
          <h3 className="text-lg font-bold mb-4">📧 Como funciona o sistema de convites?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <span className="font-semibold">Envie o Convite</span>
              </div>
              <p className="text-sm text-muted-foreground">Preencha o email e nome do professor. Uma mensagem será enviada automaticamente via Resend.</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span className="font-semibold">Professor Recebe</span>
              </div>
              <p className="text-sm text-muted-foreground">O professor recebe um email com link exclusivo para se cadastrar na plataforma vinculado à sua escola.</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span className="font-semibold">Cadastro Completo</span>
              </div>
              <p className="text-sm text-muted-foreground">Após o cadastro, o professor já pode criar turmas e começar a usar a plataforma!</p>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Dialog de Confirmação com Link */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Convite Enviado com Sucesso!
            </DialogTitle>
            <DialogDescription>
              O email foi enviado para {formData.email}. Você também pode copiar o link abaixo para compartilhar diretamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
              <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <code className="text-sm flex-1 overflow-x-auto">{inviteLink}</code>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCopyLink}
                className="flex-1 whitespace-nowrap inline-flex items-center gap-2"
                variant={linkCopied ? "default" : "outline"}
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Link
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowLinkDialog(false)}
                variant="ghost"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InviteTeacherPage;
