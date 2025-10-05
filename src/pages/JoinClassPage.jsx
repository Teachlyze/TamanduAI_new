import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import useClassInvites from '@/hooks/useClassInvites';

export default function JoinClassPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState('loading'); // loading, success, error, already_member
  const [error, setError] = useState('');
  const { useInvite } = useClassInvites();

  useEffect(() => {
    const joinClass = async () => {
      if (!token) {
        setStatus('error');
        setError('Token de convite inválido');
        return;
      }

      try {
        const result = await useInvite(token);
        
        if (result.success) {
          setStatus('success');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else if (result.alreadyEnrolled) {
          setStatus('already_member');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } catch (err) {
        console.error('Error joining class:', err);
        setStatus('error');
        setError(err.message || 'Ocorreu um erro ao tentar entrar na turma.');
      }
    };

    joinClass();
  }, [token, useInvite, navigate]);

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Processando seu convite...</p>
          </div>
        );
        
      case 'success':
        return (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="mt-4">Inscrição realizada com sucesso!</CardTitle>
              <CardDescription>
                Você foi adicionado à turma com sucesso. Redirecionando para o painel...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/dashboard')}>
                Ir para o painel agora
              </Button>
            </CardContent>
          </Card>
        );
        
      case 'already_member':
        return (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Check className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="mt-4">Você já está inscrito</CardTitle>
              <CardDescription>
                Você já é membro desta turma. Redirecionando para o painel...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/dashboard')}>
                Ir para o painel
              </Button>
            </CardContent>
          </Card>
        );
        
      case 'error':
        return (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="mt-4">Não foi possível processar o convite</CardTitle>
              <CardDescription className="text-red-600">
                {error || 'O link de convite é inválido ou expirou.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Verifique se o link está correto ou peça um novo convite ao professor.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Página inicial
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
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

  return (
    <div className="container max-w-4xl py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Entrar na Turma</h1>
        <p className="text-muted-foreground mt-2">
          {status === 'loading' 
            ? 'Processando seu convite...'
            : status === 'success'
            ? 'Você foi adicionado à turma com sucesso!'
            : status === 'already_member'
            ? 'Você já é membro desta turma.'
            : 'Ocorreu um erro ao processar seu convite.'}
        </p>
      </div>
      
      <div className="flex justify-center">
        {getStatusContent()}
      </div>
    </div>
  );
}
