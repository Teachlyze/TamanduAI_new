import React, { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton, SkeletonCard, SkeletonForm, SkeletonList } from '@/components/ui/skeleton';
import { useValidation } from '@/hooks/useValidation';
import HCaptchaWidget from '@/components/HCaptchaWidget';

// Regras de validação de exemplo
const validationRules = {
  name: [
    (value) => !value ? 'Nome é obrigatório' : true,
    (value) => value.length < 3 ? 'Nome deve ter pelo menos 3 caracteres' : true,
  ],
  email: [
    (value) => !value ? 'Email é obrigatório' : true,
    (value) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email inválido' : true,
  ],
  password: [
    (value) => !value ? 'Senha é obrigatória' : true,
    (value) => value.length < 8 ? 'Senha deve ter pelo menos 8 caracteres' : true,
  ],
};

const PerformanceDemo = React.memo(() => {

  // Usando o hook de validação otimizada
  const {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    resetAll,
    isValid,
    hasErrors,
  } = useValidation(validationRules, {
    validateOnChange: true,
    validateOnBlur: true,
    showSuccessState: true,
  });

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isValid && captchaRef?.getResponse()) {
      setLoading(true);
      // Simular envio de formulário
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLoading(false);
      alert('Formulário enviado com sucesso!');
      resetAll();
      setShowCaptcha(false);
    }
  }, [isValid, captchaRef, resetAll]);

  const simulateLoading = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  }, []);

  const toggleCaptcha = useCallback(() => {
    setShowCaptcha(prev => !prev);
  }, []);

  // Memoize the list items to prevent unnecessary re-renders
  const listItems = useMemo(() =>
    ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Demonstração de Performance
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Lazy Loading, Validações Otimizadas e Skeleton Loading
          </p>
        </motion.div>

        {/* Seção de Skeleton Loading */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Skeleton Loading
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Cards</h3>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 bg-card rounded-lg border">
                    <h4 className="font-semibold mb-2">Card 1</h4>
                    <p className="text-sm text-muted-foreground">Conteúdo carregado</p>
                  </div>
                  <div className="p-6 bg-card rounded-lg border">
                    <h4 className="font-semibold mb-2">Card 2</h4>
                    <p className="text-sm text-muted-foreground">Conteúdo carregado</p>
                  </div>
                  <div className="p-6 bg-card rounded-lg border">
                    <h4 className="font-semibold mb-2">Card 3</h4>
                    <p className="text-sm text-muted-foreground">Conteúdo carregado</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Lista</h3>
              {loading ? (
                <SkeletonList items={4} />
              ) : (
                <div className="space-y-3">
                  {listItems.map((item, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-slate-900 dark:text-white text-sm">
                        {i + 1}
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button onClick={simulateLoading} disabled={loading}>
                {loading ? 'Carregando...' : 'Simular Loading'}
              </Button>
              <Button variant="outline" onClick={() => setLoading(false)}>
                Parar Loading
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Seção de Validações Otimizadas */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Validações Otimizadas com Debounce
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={values.name || ''}
                  onChange={(e) => setValue('name', e.target.value)}
                  onBlur={() => setFieldTouched('name')}
                  className={errors.name && touched.name ? 'border-red-500' : ''}
                  placeholder="Digite seu nome"
                />
                {errors.name && touched.name && (
                  <p className="text-sm text-red-500">{errors.name[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={values.email || ''}
                  onChange={(e) => setValue('email', e.target.value)}
                  onBlur={() => setFieldTouched('email')}
                  className={errors.email && touched.email ? 'border-red-500' : ''}
                  placeholder="seu@email.com"
                />
                {errors.email && touched.email && (
                  <p className="text-sm text-red-500">{errors.email[0]}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={values.password || ''}
                onChange={(e) => setValue('password', e.target.value)}
                onBlur={() => setFieldTouched('password')}
                className={errors.password && touched.password ? 'border-red-500' : ''}
                placeholder="Digite sua senha"
              />
              {errors.password && touched.password && (
                <p className="text-sm text-red-500">{errors.password[0]}</p>
              )}
            </div>

            {/* hCaptcha com Lazy Loading */}
            {showCaptcha && (
              <div className="space-y-2">
                <Label>Verificação de Segurança</Label>
                <Suspense fallback={
                  <div className="flex items-center justify-center p-4 border rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Carregando captcha...</span>
                  </div>
                }>
                  <HCaptchaWidget
                    ref={setCaptchaRef}
                    onVerify={(token) => console.log('Captcha verificado:', token)}
                    onError={(error) => console.error('Erro no captcha:', error)}
                  />
                </Suspense>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={!isValid || !captchaRef?.getResponse()}>
                {loading ? 'Enviando...' : 'Enviar Formulário'}
              </Button>
              <Button type="button" variant="outline" onClick={resetAll}>
                Limpar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={toggleCaptcha}
              >
                {showCaptcha ? 'Ocultar' : 'Mostrar'} Captcha
              </Button>
            </div>
          </form>
        </motion.section>

        {/* Seção de hCaptcha Lazy Loading */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Lazy Loading do hCaptcha
          </h2>

          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              O componente hCaptcha agora utiliza lazy loading para melhorar o desempenho inicial da página.
              O captcha só é carregado quando necessário, reduzindo o tempo de carregamento inicial.
            </p>

            <div className="p-4 bg-blue-50 dark:bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Benefícios:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Melhora o tempo de carregamento inicial</li>
                <li>• Reduz o uso de recursos quando não necessário</li>
                <li>• Suspense fallback elegante durante o carregamento</li>
                <li>• Placeholder interativo para carregar manualmente</li>
              </ul>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
});

export default PerformanceDemo;

