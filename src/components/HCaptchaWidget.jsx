import React, { forwardRef, lazy, useCallback, useEffect, useRef } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import Button from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Lazy load do componente hCaptcha
  const LazyHCaptcha = React.lazy(() =>
  import('@hcaptcha/react-hcaptcha').then(module => ({
    default: module.default || module
  }))
);

// Componente wrapper para lazy loading
const HCaptchaWidget = forwardRef(({
  onVerify,
  onError,
  onExpire,
  size = 'normal',
  className = '',
  lazyLoad = true
}, ref) => {
  const captchaRef = useRef(null);
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
  const isLocalhost = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';

  // Expose methods via ref
  useEffect(() => {
    if (ref) {
      ref.current = {
        execute: () => {
          // console.log('[HCaptcha] Executing captcha');
          return captchaRef.current?.execute();
        },
        reset: () => {
          // console.log('[HCaptcha] Resetting captcha');
          captchaRef.current?.resetCaptcha();
          setIsVerified(false);
          setError(null);
        },
        getResponse: () => {
          const response = captchaRef.current?.getResponse();
          // console.log('[HCaptcha] Current response:', response);
          return response;
        },
      };
    }
  }, [ref]);

  const handleVerify = useCallback((token, ekey) => {
    // console.log('[HCaptcha] Token received:', token ? '***' + token.slice(-4) : 'undefined');
    // console.log('[HCaptcha] eKey received:', ekey);
    setIsVerified(true);
    setError(null);
    if (onVerify) onVerify(token);
  }, [onVerify]);

  const handleError = useCallback((error) => {
    const errorMessage = error?.message || 'Unknown hCaptcha error';
    console.error('[HCaptcha] Error:', errorMessage, error);
    setIsVerified(false);
    setError(errorMessage);
    if (onError) onError(error);
  }, [onError]);

  const handleExpire = useCallback(() => {
    // console.log('[HCaptcha] Token expired');
    setIsVerified(false);
    setError('A verificação de segurança expirou. Por favor, tente novamente.');
    if (onExpire) onExpire();
  }, [onExpire]);

  // Log the site key being used (masked for security)
  useEffect(() => {
    if (siteKey) {
      const maskedKey = siteKey.substring(0, 8) + '...' + siteKey.substring(siteKey.length - 4);
      // console.log(`[HCaptcha] Using site key: ${maskedKey} (${isLocalhost ? 'development' : 'production'})`);
    } else {
      console.error('[HCaptcha] Site key is not configured');
    }
  }, [siteKey, isLocalhost]);

  const handleLoadCaptcha = () => {
    setIsLoaded(true);
  };

  if (!siteKey) {
    const errorMsg = 'hCaptcha não configurado. Por favor, verifique as configurações.';
    console.error(errorMsg);
  return (
      <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
        {errorMsg}
      </div>
    );
  }

  // Se não estiver em desenvolvimento e lazy loading estiver habilitado
  if (!isLocalhost && lazyLoad && !isLoaded) {
  return (
      <div className={`hcaptcha-container ${className}`}>
        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="text-gray-700 dark:text-gray-400 text-sm mb-3">
            Verificação de segurança necessária
          </div>
          <Button
            onClick={handleLoadCaptcha}
            variant="outline"
            size="sm"
            className="bg-white dark:bg-slate-900 text-foreground border-border text-blue-600 hover:text-blue-700"
          >
            Carregar Verificação
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className={`hcaptcha-container ${className}`}>
      <Suspense fallback={
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-sm text-gray-800 dark:text-gray-300">Carregando verificação...</span>
        </div>
      }>
        <LazyHCaptcha
          ref={captchaRef}
          sitekey={siteKey}
          onVerify={handleVerify}
          onError={handleError}
          onExpire={handleExpire}
          size={size}
          theme="light"
          tabIndex={0} // Ensure it's focusable
        />
      </Suspense>
      {error && (
        <div className="text-red-500 text-xs mt-1">
          {error}
        </div>
      )}
      {isLocalhost && (
        <div className="text-xs text-yellow-600 mt-1">
          Modo desenvolvimento: hCaptcha ativo
        </div>
      )}
    </div>
  );
});

HCaptchaWidget.displayName = 'HCaptchaWidget';

export default HCaptchaWidget;
