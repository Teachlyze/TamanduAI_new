import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Shield, Zap, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import HCaptchaWidget from '@/components/HCaptchaWidget';
import { useTranslation } from 'react-i18next';

const RegisterPage = () => {
  const { t } = useTranslation();
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const [formData, setFormData] = useState({ name: '', email: '', cpf: '', password: '', confirmPassword: '', role: 'student', termsAccepted: false });
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const captchaRef = useRef(null);
  const { signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    } else if (!authLoading) {
      setIsCheckingAuth(false);
    }
  }, [user, authLoading, navigate]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 5);
  };

  // CPF validator (checks verifying digits)
  const isValidCPF = (cpfRaw) => {
    const cpf = cpfRaw.replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // repeated digits
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    return rev === parseInt(cpf.charAt(10));
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) newErrors.name = 'Nome obrigatório';
        else if (value.length < 2) newErrors.name = 'Nome muito curto';
        else delete newErrors.name;
        break;

      case 'email':
        if (!value) newErrors.email = 'E-mail obrigatório';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = 'E-mail inválido';
        else delete newErrors.email;
        break;

      case 'cpf': {
        const cleaned = value.replace(/\D/g, '');
        if (!cleaned) newErrors.cpf = 'CPF obrigatório';
        else if (!isValidCPF(cleaned)) newErrors.cpf = 'CPF inválido';
        else delete newErrors.cpf;
        break;
      }

      case 'password':
        if (!value) newErrors.password = 'Senha obrigatória';
        else if (value.length < 8) newErrors.password = 'Mínimo 8 caracteres';
        else delete newErrors.password;
        setPasswordStrength(calculatePasswordStrength(value));
        break;

      case 'confirmPassword':
        if (value !== formData.password) newErrors.confirmPassword = 'As senhas não coincidem';
        else delete newErrors.confirmPassword;
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simple CPF mask: 000.000.000-00
  const maskCPF = (v) => {
    const s = v.replace(/\D/g, '').slice(0, 11);
    const parts = [];
    if (s.length > 0) parts.push(s.slice(0, 3));
    if (s.length > 3) parts.push(s.slice(3, 6));
    if (s.length > 6) parts.push(s.slice(6, 9));
    let masked = parts.join('.');
    if (s.length > 9) masked += '-' + s.slice(9, 11);
    return masked;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const raw = type === 'checkbox' ? checked : value;
    const newValue = name === 'cpf' ? maskCPF(raw) : raw;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (touched[name]) validateField(name, newValue);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

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
    if (loading) return;

    setTouched({ name: true, email: true, cpf: true, password: true, confirmPassword: true });
    
    const isFormValid = validateField('name', formData.name) &&
      validateField('email', formData.email) &&
      validateField('cpf', formData.cpf) &&
      validateField('password', formData.password) &&
      validateField('confirmPassword', formData.confirmPassword);

    if (!isFormValid) {
      toast({ title: "Erro de validação", description: "Corrija os erros no formulário.", variant: "destructive" });
      return;
    }

    if (!formData.termsAccepted) {
      toast({ title: "Termos não aceitos", description: "Você deve aceitar os termos de uso.", variant: "destructive" });
      return;
    }

    if (!isLocalhost && !captchaToken) {
      setCaptchaError('Complete a verificação de segurança');
      captchaRef.current?.execute();
      return;
    }

    setLoading(true);

    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        cpf: formData.cpf.replace(/\D/g, ''),
        role: formData.role
      }, captchaToken);

      if (result?.success) {
        toast({ title: "Cadastro realizado!", description: "Enviamos um e-mail de confirmação. Verifique sua caixa de entrada.", });
        navigate('/login');
      } else {
        captchaRef.current?.reset();
        setCaptchaToken('');
        toast({ title: "Erro no cadastro", description: result?.error?.message || "Tente novamente.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Register error:', error);
      captchaRef.current?.reset();
      setCaptchaToken('');
      toast({ title: "Erro no cadastro", description: error.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const strengthLabels = ['Muito Fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row-reverse bg-background">
      {/* Left - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-700 items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-white/10 dark:bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-60 h-60 bg-white/5 dark:bg-white/3 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-center text-white space-y-8 relative z-10">
          <div className="relative">
            <motion.div animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="w-80 h-80 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 dark:from-white/10 dark:to-white/3 rounded-3xl backdrop-blur-sm border border-white/20 dark:border-white/10 flex items-center justify-center">
                <div className="space-y-6">
                  <div className="flex justify-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 dark:bg-white/10 rounded-2xl flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div className="w-16 h-16 bg-white/20 dark:bg-white/10 rounded-2xl flex items-center justify-center">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-white/30 dark:bg-white/20 rounded-2xl flex items-center justify-center">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <div className="w-3 h-3 bg-white/60 dark:bg-white/40 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/40 dark:bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/60 dark:bg-white/40 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Junte-se à revolução educacional</h2>
            <p className="text-purple-100 text-lg leading-relaxed">Crie sua conta e comece a transformar a educação com IA</p>
          </div>
          <div className="flex justify-center space-x-8 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p>Grátis</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <p>Completo</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6" />
              </div>
              <p>Seguro</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500 dark:bg-purple-400 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-pink-500 dark:bg-pink-400 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-indigo-500 dark:bg-indigo-400 rounded-full blur-xl"></div>
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center space-y-4">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">TamanduAI</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth.createAccount', 'Crie sua conta')}</h1>
              <p className="text-muted-foreground">{t('auth.startJourney', 'Comece sua jornada educacional')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-foreground">
                  {t('auth.nameLabel', 'Nome completo')}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="name"
                    name="name"
                    placeholder="Seu nome completo"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-4 h-14 border-2 rounded-xl transition-all duration-200 bg-background text-foreground placeholder-muted-foreground ${
                      errors.name && touched.name
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : formData.name && !errors.name && touched.name
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                        : touched.name
                        ? 'border-border focus:border-ring focus:ring-ring/20'
                        : 'border-border hover:border-border focus:border-ring focus:ring-ring/20'
                    }`}
                    required
                  />
                  {formData.name && !errors.name && touched.name && (
                    <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {errors.name && touched.name && (
                  <div className="flex items-center space-x-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

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
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-4 h-14 border-2 rounded-xl transition-all duration-200 bg-background text-foreground placeholder-muted-foreground ${
                      errors.email && touched.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : formData.email && !errors.email && touched.email
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                        : touched.email
                        ? 'border-border focus:border-ring focus:ring-ring/20'
                        : 'border-border hover:border-border focus:border-ring focus:ring-ring/20'
                    }`}
                    required
                  />
                  {formData.email && !errors.email && touched.email && (
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
                <label htmlFor="cpf" className="block text-sm font-semibold text-foreground">
                  CPF
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="cpf"
                    name="cpf"
                    placeholder="000.000.000-00"
                    autoComplete="off"
                    value={formData.cpf}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-4 h-14 border-2 rounded-xl transition-all duration-200 bg-background text-foreground placeholder-muted-foreground ${
                      errors.cpf && touched.cpf
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : formData.cpf && !errors.cpf && touched.cpf
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                        : touched.cpf
                        ? 'border-border focus:border-ring focus:ring-ring/20'
                        : 'border-border hover:border-border focus:border-ring focus:ring-ring/20'
                    }`}
                    required
                  />
                  {formData.cpf && !errors.cpf && touched.cpf && (
                    <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {errors.cpf && touched.cpf && (
                  <div className="flex items-center space-x-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.cpf}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-semibold text-foreground">
                  {t('auth.accountType', 'Tipo de conta')}
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full h-14 px-4 border-2 rounded-xl transition-all duration-200 bg-background text-foreground ${
                    formData.role
                      ? 'border-ring focus:border-ring focus:ring-ring/20'
                      : 'border-border hover:border-border focus:border-ring focus:ring-ring/20'
                  }`}
                >
                  <option value="student">Aluno</option>
                  <option value="teacher">Professor</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Você pode alterar o tipo de conta depois nas configurações do perfil.
                </p>
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
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-16 h-14 border-2 rounded-xl transition-all duration-200 bg-background text-foreground placeholder-muted-foreground ${
                      errors.password && touched.password
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : formData.password && !errors.password && touched.password
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
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200 dark:bg-gray-600'}`}></div>
                      ))}
                    </div>
                    <p className={`text-xs ${passwordStrength >= 4 ? 'text-green-600' : passwordStrength >= 3 ? 'text-lime-600' : passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                      Força: {strengthLabels[passwordStrength - 1] || strengthLabels[0]}
                    </p>
                  </div>
                )}
                {errors.password && touched.password && (
                  <div className="flex items-center space-x-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground">
                  {t('auth.confirmPasswordLabel', 'Confirmar senha')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-16 h-14 border-2 rounded-xl transition-all duration-200 bg-background text-foreground placeholder-muted-foreground ${
                      errors.confirmPassword && touched.confirmPassword
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : formData.confirmPassword && !errors.confirmPassword && touched.confirmPassword
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                        : touched.confirmPassword
                        ? 'border-border focus:border-ring focus:ring-ring/20'
                        : 'border-border hover:border-border focus:border-ring focus:ring-ring/20'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="flex items-center space-x-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="w-4 h-4 mt-1 rounded border-border text-primary focus:ring-ring"
                  required
                />
                <label htmlFor="termsAccepted" className="text-sm text-foreground leading-relaxed">
                  Aceito os{' '}
                  <Link to="/terms" className="font-semibold text-primary hover:underline">
                    Termos de Uso
                  </Link>
                  {' '}e{' '}
                  <Link to="/privacy" className="font-semibold text-primary hover:underline">
                    Política de Privacidade
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || Object.keys(errors).length > 0}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Criando conta...
                  </div>
                ) : (
                  <>
                    Criar conta <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground">
                {t('auth.alreadyHaveAccount', 'Já tem uma conta?')}{' '}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  {t('auth.signIn', 'Entrar')}
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
