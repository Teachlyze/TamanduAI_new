import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Check,
  X,
  AlertCircle,
  UserPlus,
  GraduationCap,
  Users,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { navigateToHome } from "@/utils/roleNavigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ClassInviteService from "@/services/classInviteService";
import { supabase } from "@/lib/supabaseClient";

export default function JoinClassPage() {
  const [loading, setLoading] = useState(true);
  const { invitationCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [status, setStatus] = useState("loading"); // loading, preview, confirming, success, error, not_authenticated
  const [inviteDetails, setInviteDetails] = useState(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      // Store invitation code in localStorage for after login
      if (!currentUser && invitationCode) {
        localStorage.setItem("pendingInvitation", invitationCode);
      }
    };

    checkAuth();
  }, [invitationCode]);

  // Load invitation details
  useEffect(() => {
    const loadInviteDetails = async () => {
      if (!invitationCode) {
        setStatus("error");
        setError("Código de convite inválido");
        return;
      }

      try {
        setStatus("loading");
        const details =
          await ClassInviteService.getInviteDetails(invitationCode);
        setInviteDetails(details);

        // If user is authenticated, show preview
        // If not, show authentication required message
        if (user) {
          setStatus("preview");
        } else {
          setStatus("not_authenticated");
        }
      } catch (err) {
        console.error("Error loading invite details:", err);
        setStatus("error");
        setError(err.message || "Convite inválido ou expirado.");
      }
    };

    if (invitationCode) {
      loadInviteDetails();
    }
  }, [invitationCode, user]);

  // Handle accepting the invitation
  const handleAcceptInvite = async () => {
    if (!user) {
      // Redirect to login
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    setIsAccepting(true);
    setStatus("confirming");

    try {
      const result = await ClassInviteService.acceptInvite(
        invitationCode,
        user.id
      );

      if (result.success) {
        setStatus("success");

        // Clear pending invitation from localStorage
        localStorage.removeItem("pendingInvitation");

        toast({
          title: result.alreadyMember
            ? "Você já está na turma!"
            : "Inscrição realizada!",
          description: result.alreadyMember
            ? "Você já é membro desta turma."
            : "Você foi adicionado à turma com sucesso!",
        });

        // Redirect to class page or user home
        setTimeout(() => {
          if (result.classId) {
            navigate(`/classes/${result.classId}`);
          } else {
            const role = user.user_metadata?.role || "student";
            navigateToHome(navigate, role);
          }
        }, 2000);
      }
    } catch (err) {
      console.error("Error accepting invite:", err);
      setStatus("error");
      setError(err.message || "Não foi possível aceitar o convite.");

      toast({
        variant: "destructive",
        title: "Erro ao aceitar convite",
        description: err.message || "Ocorreu um erro. Tente novamente.",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  };

  const handleSignupRedirect = () => {
    navigate(`/register?redirect=${encodeURIComponent(location.pathname)}`);
  };

  const getStatusContent = () => {
    switch (status) {
      case "loading":
        /* if (loading) return <LoadingScreen />; */

        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Processando seu convite...</p>
          </div>
        );

      case "not_authenticated":
        /* if (loading) return <LoadingScreen />; */

        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">
                Você foi convidado para uma turma!
              </CardTitle>
              <CardDescription className="text-center">
                Para aceitar o convite, você precisa fazer login ou criar uma
                conta.
              </CardDescription>
            </CardHeader>

            {inviteDetails && (
              <CardContent className="space-y-4">
                <Alert>
                  <GraduationCap className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">
                        Turma: {inviteDetails.class?.name}
                      </p>
                      {inviteDetails.class?.description && (
                        <p className="text-sm text-muted-foreground">
                          {inviteDetails.class.description}
                        </p>
                      )}
                      <p className="text-sm">
                        Professor:{" "}
                        {inviteDetails.class?.teacher?.full_name || "Professor"}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}

            <CardFooter className="flex flex-col gap-3">
              <Button
                onClick={handleLoginRedirect}
                className="w-full"
                size="lg"
              >
                Fazer Login
              </Button>
              <Button
                onClick={handleSignupRedirect}
                variant="outline"
                className="bg-white dark:bg-slate-900 text-foreground border-border w-full"
                size="lg"
              >
                Criar Conta
              </Button>
            </CardFooter>
          </Card>
        );

      case "preview":
        /* if (loading) return <LoadingScreen />; */

        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Você foi convidado para esta turma
              </CardTitle>
              <CardDescription className="text-center">
                Revise as informações abaixo e confirme se deseja entrar
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Class Information */}
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xl font-semibold">
                      {inviteDetails?.class?.name}
                    </h3>
                    {inviteDetails?.class?.description && (
                      <p className="text-muted-foreground">
                        {inviteDetails.class.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Teacher Info */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Avatar>
                    <AvatarImage
                      src={inviteDetails?.class?.teacher?.avatar_url}
                    />
                    <AvatarFallback>
                      {inviteDetails?.class?.teacher?.full_name?.charAt(0) ||
                        "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Professor</p>
                    <p className="text-sm text-muted-foreground">
                      {inviteDetails?.class?.teacher?.full_name || "Professor"}
                    </p>
                  </div>
                </div>

                {/* Role Info */}
                <div className="flex items-center gap-2 pt-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Você entrará como:{" "}
                    <strong>
                      {inviteDetails?.role === "student"
                        ? "Aluno"
                        : "Professor"}
                    </strong>
                  </span>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ao confirmar, você será adicionado à turma e terá acesso a
                  todos os materiais e atividades.
                </AlertDescription>
              </Alert>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAcceptInvite}
                disabled={isAccepting}
                className="flex-1"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  "Confirmar e Entrar"
                )}
              </Button>
            </CardFooter>
          </Card>
        );

      case "confirming":
        /* if (loading) return <LoadingScreen />; */

        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Adicionando você à turma...</p>
          </div>
        );

      case "success":
        /* if (loading) return <LoadingScreen />; */

        return (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="mt-4">
                Inscrição realizada com sucesso!
              </CardTitle>
              <CardDescription>
                Você foi adicionado à turma. Redirecionando...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                onClick={() => {
                  const role = user?.user_metadata?.role || "student";
                  navigateToHome(navigate, role);
                }}
              >
                Ir para o painel agora
              </Button>
            </CardContent>
          </Card>
        );

      case "error":
        /* if (loading) return <LoadingScreen />; */

        return (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="mt-4">
                Não foi possível processar o convite
              </CardTitle>
              <CardDescription className="text-red-600">
                {error || "O link de convite é inválido ou expirou."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Verifique se o link está correto ou peça um novo convite ao
                professor.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Página inicial
                </Button>
                <Button
                  onClick={() => {
                    const role = user?.user_metadata?.role || "student";
                    navigateToHome(navigate, role);
                  }}
                >
                  Ir para o painel
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  /* if (loading) return <LoadingScreen />; */

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl py-12 px-4">
        <PremiumCard variant="elevated">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">
              Convite para Turma
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {status === "loading"
                ? "Carregando informações do convite..."
                : status === "not_authenticated"
                  ? "Faça login para aceitar o convite"
                  : status === "preview"
                    ? "Revise as informações da turma"
                    : status === "confirming"
                      ? "Processando sua inscrição..."
                      : status === "success"
                        ? "Você foi adicionado à turma com sucesso!"
                        : "Não foi possível processar o convite"}
            </p>
          </div>

          <div className="flex justify-center">{getStatusContent()}</div>
        </PremiumCard>
      </div>
    </div>
  );
}
