import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Wifi, WifiOff, Sparkles, GraduationCap } from 'lucide-react';
import SkipLinks from '@/components/SkipLinks';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import HCaptchaWidget from '@/components/HCaptchaWidget';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation();
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const captchaRef = useRef(null);
  const { signIn, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
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

  useEffect(() => {
    console.log('[LoginPage] Auth state:', { user: !!user, authLoading, isCheckingAuth });
    if (user) {
      console.log('[LoginPage] User detected, navigating to dashboard...');
      navigate('/dashboard');
    } else if (!authLoading) {
      console.log('[LoginPage] No user, auth not loading, setting isCheckingAuth to false');
      setIsCheckingAuth(false);
    }
  }, [user, authLoading, navigate]);
  
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Verificando...</p>
        </div>
      </div>
    );
  }
  
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'O e-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Por favor, insira um e-mail válido';
        } else if (value.length > 254) {
          newErrors.email = 'O e-mail é muito longo';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'A senha é obrigatória';
        } else if (value.length < 6) {
          newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
        } else if (value.length > 128) {
          newErrors.password = 'A senha é muito longa';
        } else {
          delete newErrors.password;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateForm = () => {
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    return isEmailValid && isPasswordValid;
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleFailedAttempt = () => {
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);
    
    if (newAttemptCount >= 3) {
      setIsBlocked(true);
      setBlockTimeRemaining(300);
      
      const timer = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            setAttemptCount(0);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast({
        title: "Conta temporariamente bloqueada",
        description: `Aguarde ${formatTime(blockTimeRemaining)} antes de tentar novamente.`,
      });
      return;
    }
    
    if (loading) return;

    // Set loading state immediately for visual feedback
    setLoading(true);
    
    const isFormValid = validateForm();
    if (!isFormValid) {
      setLoading(false);
      toast({
        title: "Erro de validação",
        description: "Corrija os erros no formulário antes de continuar.",
        variant: "destructive"
      });
      return;
    }
    
    // Require captcha only in production
    if (!isLocalhost && !captchaToken) {
      setLoading(false); // Reset loading state if captcha is missing
      setCaptchaError('Complete a verificação de segurança');
      captchaRef.current?.execute();
      return;
    }
    
    try {
      console.log('[LoginPage] Calling signIn...');
      const result = await signIn(email, password, captchaToken);
      console.log('[LoginPage] signIn result:', { hasUser: !!result?.user, hasError: !!result?.error });
      
      if (result?.user) {
        console.log('[LoginPage] Login successful, user:', result.user.email);
        setAttemptCount(0);
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o painel...",
        });
        // Don't set loading to false here - let the navigation happen
        console.log('[LoginPage] Navigating to dashboard...');
        navigate('/dashboard');
      } else {
        setLoading(false); // Reset loading state on error
        handleFailedAttempt();
        captchaRef.current?.reset();
        setCaptchaToken('');
        
        const errorMessage = result?.error?.message || "Erro ao fazer login. Tente novamente.";
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
        
        if (errorMessage.includes('senha') || errorMessage.includes('Senha')) {
          setErrors(prev => ({ ...prev, password: 'Senha incorreta' }));
          setTouched(prev => ({ ...prev, password: true }));
        } else if (errorMessage.includes('e-mail') || errorMessage.includes('email')) {
          setErrors(prev => ({ ...prev, email: 'E-mail não encontrado' }));
          setTouched(prev => ({ ...prev, email: true }));
        }
      }
    } catch (error) {
      setLoading(false); // Reset loading state on error
      console.error('Login error:', error);
      handleFailedAttempt();
      captchaRef.current?.reset();
      setCaptchaToken('');
      
      const errorMessage = error.message || "Erro ao fazer login. Tente novamente.";
      toast({
        title: error.message?.includes('Tempo limite') ? "Tempo limite excedido" : "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      <SkipLinks />
      {/* Header */}
      <header className="sr-only">
        <h1>Página de Login - TamanduAI</h1>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 w-full flex flex-col lg:flex-row">
      {/* Left - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-indigo-500 rounded-full blur-xl"></div>
        </div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center space-y-4">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TamanduAI</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth.welcomeBack', 'Bem-vindo de volta')}</h1>
              <p className="text-muted-foreground">{t('auth.signInToContinue', 'Entre na sua conta para continuar')}</p>
            </div>
          </div>

          <AnimatePresence>
            {isBlocked && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Conta temporariamente bloqueada</p>
                    <p className="text-sm">Muitas tentativas. Tente em {formatTime(blockTimeRemaining)}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {attemptCount > 0 && attemptCount < 5 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
              <p className="text-amber-700 dark:text-amber-400 text-sm">Tentativa {attemptCount} de 5. {5 - attemptCount} restantes.</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                  {t('auth.emailLabel', 'Email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) validateField('email', e.target.value);
                    }}
                    onBlur={handleBlur}
                    disabled={isBlocked}
                    className={`w-full pl-12 pr-4 h-14 border-2 rounded-xl transition-all duration-200 bg-background text-foreground placeholder-muted-foreground ${
                      errors.email && touched.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : email && !errors.email && touched.email
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                        : touched.email
                        ? 'border-border focus:border-ring focus:ring-ring/20'
                        : 'border-border hover:border-border focus:border-ring focus:ring-ring/20'
                    }`}
                    required
                  />
                  {email && !errors.email && touched.email && (
                    <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {errors.email && touched.email && (
                  <div className="flex items-center space-x-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                {t('auth.passwordLabel', 'Senha')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) validateField('password', e.target.value);
                  }}
                  onBlur={handleBlur}
                  disabled={isBlocked}
                  className={`w-full pl-12 pr-16 h-14 border-2 rounded-xl transition-all duration-200 bg-background text-foreground placeholder-muted-foreground ${
                    errors.password && touched.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : password && !errors.password && touched.password
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                      : touched.password
                      ? 'border-border focus:border-ring focus:ring-ring/20'
                      : 'border-border hover:border-border focus:border-ring focus:ring-ring/20'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-8 bg-secondary hover:bg-accent rounded-lg flex items-center justify-center transition-colors"
                  disabled={isBlocked}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <div className="flex items-center space-x-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* HCaptcha Integration - Only in production */}
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
                  <div className="flex items-center space-x-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{captchaError}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-ring" disabled={isBlocked} />
                <span className="text-sm font-medium text-foreground">{t('auth.rememberMe', 'Lembrar de mim')}</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                {t('auth.forgotPassword', 'Esqueceu a senha?')}
              </Link>
            </div>

              <button
                type="submit"
                className={`w-full h-14 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                  loading
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 cursor-not-allowed'
                    : isBlocked
                    ? 'bg-gradient-to-r from-red-500 to-red-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
                }`}
                disabled={loading || Object.keys(errors).length > 0 || isBlocked}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Fazendo login...
                  </div>
                ) : (
                  <>
                    {isBlocked ? `Bloqueado (${formatTime(blockTimeRemaining)})` : t('auth.signIn', 'Entrar')}
                    {!isBlocked && <ArrowRight className="ml-2 w-5 h-5" />}
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground">
                {t('auth.dontHaveAccount', 'Não tem conta?')}{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  {t('auth.signUp', 'Cadastre-se')}
                </Link>
              </p>
            </div>
          </form>

          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            {navigator.onLine ? (
              <><Wifi className="w-3 h-3" /><span>Conectado</span></>
            ) : (
              <><WifiOff className="w-3 h-3" /><span>Sem conexão</span></>
            )}
          </div>
        </motion.div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-center text-white space-y-8 relative z-10">
          <div className="relative">
            <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="w-80 h-80 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <div className="space-y-6">
                  <div className="flex justify-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-white/30 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Acesse sua conta</h2>
            <p className="text-blue-100 text-lg leading-relaxed">Entre e continue sua jornada educacional</p>
          </div>
          <div className="flex justify-center space-x-8 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p>Seguro</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <p>Inteligente</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="w-6 h-6" />
              </div>
              <p>Educacional</p>
            </div>
          </div>
        </motion.div>
      </div>
      </main>
    </div>
  );
};

export default LoginPage;
