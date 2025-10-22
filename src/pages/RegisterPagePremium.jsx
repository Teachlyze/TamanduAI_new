import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Mail,
  Lock,
  User,
  ArrowRight,
  Shield,
  Zap,
  Check,
  Sparkles,
  Building2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { navigateToHome } from "@/utils/roleNavigation";
import toast from "react-hot-toast";
import { PremiumInput } from "@/components/ui/PremiumInput";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const RegisterPagePremium = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    age: "",
    role: "student",
    termsAccepted: false,
    privacyAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Get user role and navigate to appropriate home
      const role = user.user_metadata?.role || "student";
      navigateToHome(navigate, role);
    } else if (!authLoading) {
      setIsCheckingAuth(false);
    }
  }, [user, authLoading, navigate]);

  if (isCheckingAuth) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 5);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Nome é obrigatório";
        } else if (value.length < 2) {
          newErrors.name = "Nome muito curto";
        } else {
          delete newErrors.name;
        }
        break;

      case "email":
        if (!value) {
          newErrors.email = "E-mail é obrigatório";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "E-mail inválido";
        } else {
          delete newErrors.email;
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Senha é obrigatória";
        } else if (value.length < 8) {
          newErrors.password = "Mínimo 8 caracteres";
        } else {
          delete newErrors.password;
        }
        setPasswordStrength(calculatePasswordStrength(value));
        break;

      case "confirmPassword":
        if (value !== formData.password) {
          newErrors.confirmPassword = "As senhas não coincidem";
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case "cpf":
        // Remove non-digits
        const cleanCpf = value.replace(/\D/g, "");
        if (!cleanCpf) {
          newErrors.cpf = "CPF é obrigatório";
        } else if (cleanCpf.length !== 11) {
          newErrors.cpf = "CPF deve ter 11 dígitos";
        } else {
          delete newErrors.cpf;
        }
        break;

      case "age":
        const ageNum = parseInt(value);
        if (!value) {
          newErrors.age = "Idade é obrigatória";
        } else if (ageNum < 14 || ageNum > 120) {
          newErrors.age = "Idade inválida";
        } else {
          delete newErrors.age;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      cpf: true,
      age: true,
    });

    // Validate all
    const allErrors = {
      ...validateField("name", formData.name),
      ...validateField("email", formData.email),
      ...validateField("password", formData.password),
      ...validateField("confirmPassword", formData.confirmPassword),
      ...validateField("cpf", formData.cpf),
      ...validateField("age", formData.age),
    };

    if (Object.keys(allErrors).length > 0) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    if (!formData.termsAccepted) {
      toast.error("Você deve aceitar os termos de uso");
      return;
    }

    if (!formData.privacyAccepted) {
      toast.error("Você deve aceitar a política de privacidade");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        cpf: formData.cpf.replace(/\D/g, ""),
        age: parseInt(formData.age),
      });

      if (result.error) {
        throw result.error;
      }

      toast.success(
        "Conta criada com sucesso! Verifique seu email para confirmar."
      );
      navigate("/verify-email");
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-destructive";
    if (passwordStrength <= 3) return "bg-warning";
    return "bg-success";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Fraca";
    if (passwordStrength <= 3) return "Média";
    return "Forte";
  };

  const benefits = [
    "Chatbot IA personalizado para suas turmas",
    "Gestão completa de alunos e atividades",
    "Relatórios detalhados de desempenho",
    "Videoconferências integradas",
    "Suporte premium 24/7",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-themed-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="ml-3 text-3xl font-bold text-gradient-primary">
              TamanduAI
            </h1>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Crie sua conta
            </h2>
            <p className="text-muted-foreground">
              Comece a transformar a educação hoje mesmo!
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <PremiumInput
              label="Nome completo"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              leftIcon={User}
              error={touched.name && errors.name}
              success={touched.name && !errors.name && formData.name}
              clearable
              required
              placeholder="Seu nome"
            />

            <PremiumInput
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              leftIcon={Mail}
              error={touched.email && errors.email}
              success={touched.email && !errors.email && formData.email}
              clearable
              required
              placeholder="seu@email.com"
            />

            <div className="space-y-2">
              <PremiumInput
                label="Senha"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                leftIcon={Lock}
                error={touched.password && errors.password}
                success={
                  touched.password && !errors.password && formData.password
                }
                required
                placeholder="••••••••"
              />

              {/* Password Strength Indicator */}
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Força da senha
                    </span>
                    <span
                      className={`font-medium ${passwordStrength > 3 ? "text-success" : passwordStrength > 1 ? "text-warning" : "text-destructive"}`}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                      className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <PremiumInput
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              leftIcon={Lock}
              error={touched.confirmPassword && errors.confirmPassword}
              success={
                touched.confirmPassword &&
                !errors.confirmPassword &&
                formData.confirmPassword
              }
              required
              placeholder="••••••••"
            />

            <div className="grid grid-cols-2 gap-4">
              <PremiumInput
                label="CPF"
                type="text"
                value={formData.cpf}
                onChange={(e) => {
                  // Format CPF: 000.000.000-00
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 11) {
                    value = value.replace(/(\d{3})(\d)/, "$1.$2");
                    value = value.replace(/(\d{3})(\d)/, "$1.$2");
                    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                    handleChange("cpf", value);
                  }
                }}
                onBlur={() => handleBlur("cpf")}
                error={touched.cpf && errors.cpf}
                success={touched.cpf && !errors.cpf && formData.cpf}
                required
                placeholder="000.000.000-00"
                maxLength={14}
              />

              <PremiumInput
                label="Idade"
                type="number"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                onBlur={() => handleBlur("age")}
                error={touched.age && errors.age}
                success={touched.age && !errors.age && formData.age}
                required
                placeholder="18"
                min={10}
                max={120}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Você é:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "teacher", label: "Professor", icon: Shield },
                  { value: "student", label: "Aluno", icon: Sparkles },
                  { value: "school", label: "Escola", icon: Building2 },
                ].map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleChange("role", role.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.role === role.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <role.icon
                      className={`w-6 h-6 mx-auto mb-2 ${
                        formData.role === role.value
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        formData.role === role.value
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {role.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms & Privacy */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) =>
                    handleChange("termsAccepted", e.target.checked)
                  }
                  className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary mt-0.5"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Aceito os{" "}
                  <Link
                    to="/terms-of-use"
                    className="text-primary hover:underline font-medium"
                  >
                    Termos de Uso
                  </Link>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.privacyAccepted}
                  onChange={(e) =>
                    handleChange("privacyAccepted", e.target.checked)
                  }
                  className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary mt-0.5"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Aceito a{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-primary hover:underline font-medium"
                  >
                    Política de Privacidade
                  </Link>
                </span>
              </label>
            </div>

            <PremiumButton
              type="submit"
              variant="gradient"
              size="lg"
              fullWidth
              loading={loading}
              rightIcon={ArrowRight}
            >
              Criar Conta Grátis
            </PremiumButton>
          </motion.form>

          {/* Sign In Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center text-muted-foreground"
          >
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Faça login
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Zap className="w-16 h-16 mb-6" />
            <h2 className="text-4xl font-bold mb-6">
              Junte-se a milhares
              <br />
              de educadores
            </h2>
            <p className="text-xl text-white/90 mb-12">
              Plataforma completa com IA para revolucionar
              <br />
              sua forma de ensinar e aprender.
            </p>

            {/* Benefits List */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-lg">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="mt-12 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-white/30 border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <div className="font-bold">10.000+ professores</div>
                  <div className="text-sm text-white/80">já estão usando</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-yellow-300 text-xl">
                    ★
                  </span>
                ))}
                <span className="ml-2 text-sm">4.9/5.0 de satisfação</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPagePremium;
