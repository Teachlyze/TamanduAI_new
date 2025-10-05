import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Falha ao enviar email de redefinição. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Icons.check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Verifique seu Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Enviamos um link de redefinição de senha para <span className="font-medium text-foreground">{email}</span>.
              Por favor, verifique sua caixa de entrada.
            </p>
            <p className="text-sm text-muted-foreground">
              Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={() => setSuccess(false)}
              className="w-full"
              variant="outline"
            >
              <Icons.arrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              Voltar para o login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Esqueceu sua senha?</CardTitle>
          <CardDescription className="text-center">
            Digite seu email e enviaremos um link para redefinir sua senha
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Link de Redefinição'
              )}
            </Button>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Lembrou sua senha?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Faça login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
