import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { NotificationOrchestrator } from "@/services/notificationOrchestrator";

const InviteStudentByEmail = ({ classId, className }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [invitesSent, setInvitesSent] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);

  // Carregar convites pendentes ao montar
  React.useEffect(() => {
    loadPendingInvites();
  }, [classId]);

  const loadPendingInvites = async () => {
    try {
      const { data, error } = await supabase
        .from("class_invitations")
        .select("*")
        .eq("class_id", classId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingInvites(data || []);
    } catch (error) {
      console.error("Erro ao carregar convites:", error);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor, insira um email.",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
      });
      return;
    }

    setIsInviting(true);

    try {
      // 1. Verificar se usuário existe
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, role, full_name")
        .eq("email", email)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      // 2. Validações
      if (profile && profile.role !== "student") {
        toast({
          variant: "destructive",
          title: "Usuário não é aluno",
          description: "Este email pertence a um professor ou escola.",
        });
        setIsInviting(false);
        return;
      }

      if (profile) {
        // Verificar se já está na turma
        const { data: existing } = await supabase
          .from("class_members")
          .select("id")
          .eq("class_id", classId)
          .eq("user_id", profile.id)
          .maybeSingle();

        if (existing) {
          toast({
            variant: "destructive",
            title: "Aluno já está na turma",
            description: `${profile.full_name || email} já é membro desta turma.`,
          });
          setIsInviting(false);
          return;
        }
      }

      // Verificar se já tem convite pendente
      const { data: existingInvite } = await supabase
        .from("class_invitations")
        .select("id")
        .eq("class_id", classId)
        .eq("invitee_email", email)
        .eq("status", "pending")
        .maybeSingle();

      if (existingInvite) {
        toast({
          variant: "destructive",
          title: "Convite já enviado",
          description: "Este aluno já possui um convite pendente.",
        });
        setIsInviting(false);
        return;
      }

      // 3. Criar convite
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

      const { data: invitation, error: inviteError } = await supabase
        .from("class_invitations")
        .insert({
          class_id: classId,
          invitee_email: email,
          invitee_id: profile?.id || null,
          inviter_id: user.id,
          status: "pending",
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // 4. Enviar notificação por email
      if (profile) {
        try {
          await NotificationOrchestrator.send("classInviteSent", {
            userId: profile.id,
            variables: {
              className: className,
              acceptUrl: `${window.location.origin}/invitations/${invitation.id}`,
            },
          });
        } catch (notifError) {
          console.warn("Erro ao enviar notificação:", notifError);
        }
      } else {
        // Usuário não tem conta - enviar email de convite para criar conta
        // TODO: Implementar envio de email via serviço externo (SendGrid, etc)
        console.log("Enviar email de convite para:", email);
      }

      toast({
        title: "✅ Convite enviado!",
        description: `Convite enviado para ${email}`,
      });

      setInvitesSent([...invitesSent, { email, sentAt: new Date() }]);
      setEmail("");
      loadPendingInvites();
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar convite",
        description: error.message,
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvite = async (invitationId) => {
    try {
      const { error } = await supabase
        .from("class_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Convite cancelado",
        description: "O convite foi removido.",
      });

      loadPendingInvites();
    } catch (error) {
      console.error("Erro ao cancelar convite:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cancelar convite",
        description: error.message,
      });
    }
  };

  const handleResendInvite = async (invitation) => {
    try {
      if (invitation.invitee_id) {
        await NotificationOrchestrator.send("classInviteSent", {
          userId: invitation.invitee_id,
          variables: {
            className: className,
            acceptUrl: `${window.location.origin}/invitations/${invitation.id}`,
          },
        });

        toast({
          title: "✅ Convite reenviado!",
          description: `Convite reenviado para ${invitation.invitee_email}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Não é possível reenviar",
          description: "Usuário ainda não possui conta.",
        });
      }
    } catch (error) {
      console.error("Erro ao reenviar convite:", error);
      toast({
        variant: "destructive",
        title: "Erro ao reenviar convite",
        description: error.message,
      });
    }
  };

  /* if (loading) return <LoadingScreen />; */

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Convidar Aluno por Email
        </CardTitle>
        <CardDescription>
          Envie convites para alunos entrarem na turma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulário de Convite */}
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleInvite()}
            disabled={isInviting}
            className="flex-1"
          />
          <Button
            onClick={handleInvite}
            disabled={isInviting || !email.trim()}
            className="min-w-[120px]"
          >
            {isInviting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </>
            )}
          </Button>
        </div>

        {/* Convites Enviados Recentemente */}
        <AnimatePresence>
          {invitesSent.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className="text-sm font-medium text-gray-700">
                Enviados agora:
              </p>
              {invitesSent.map((invite, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{invite.email}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Convites Pendentes */}
        {pendingInvites.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <p className="text-sm font-medium text-gray-700">
              Convites Pendentes ({pendingInvites.length})
            </p>
            <div className="space-y-2">
              {pendingInvites.map((invite) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">
                        {invite.invitee_email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Enviado em{" "}
                        {new Date(invite.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResendInvite(invite)}
                    >
                      Reenviar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelInvite(invite.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InviteStudentByEmail;
