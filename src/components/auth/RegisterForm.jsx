import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import HCaptchaWidget from '@/components/HCaptchaWidget';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const captchaRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const handleCaptchaVerify = useCallback((token) => {
    setCaptchaToken(token);
    setCaptchaError('');
  }, []);

  const handleCaptchaError = useCallback((error) => {
    console.error('hCaptcha Error:', error);
    setCaptchaToken('');
    setCaptchaError('Verificação de segurança falhou. Tente novamente.');
  }, []);

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaToken('');
    captchaRef.current?.execute();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('As senhas não coincidem');
    }

    if (!isLocalhost && !captchaToken) {
      setCaptchaError('Complete a verificação de segurança');
      captchaRef.current?.execute();
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name, captchaToken);
      // Email verification will be handled via Supabase
      navigate('/verify-email');
    } catch (err) {
      setError(err.message || 'Falha ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados abaixo para criar sua conta
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
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
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
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 8 caracteres, incluindo letras maiúsculas, minúsculas e números.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* HCaptcha Integration */}
            {!isLocalhost && (
              <div className="space-y-2">
                <HCaptchaWidget
                  ref={captchaRef}
                  onVerify={handleCaptchaVerify}
                  onError={handleCaptchaError}
                  onExpire={handleCaptchaExpire}
                  size="normal"
                  className="mx-auto"
                />
                {captchaError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {captchaError}
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta
            </Button>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou crie com
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="outline" type="button" disabled={isLoading}>
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.google className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
              <Button variant="outline" type="button" disabled={isLoading}>
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.gitHub className="mr-2 h-4 w-4" />
                )}
                GitHub
              </Button>
            </div>
            
            <p className="text-sm text-center text-muted-foreground">
              Já tem uma conta?{' '}
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
