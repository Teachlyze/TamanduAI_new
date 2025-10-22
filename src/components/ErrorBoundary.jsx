import React, { createElement } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiAlertTriangle, FiRefreshCw, FiHome, FiCopy, FiExternalLink } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const now = Date.now();
    console.error('Error caught by boundary:', error, errorInfo);

    this.setState(prevState => {
      const timeSinceLastError = prevState.lastErrorTime
        ? now - prevState.lastErrorTime
        : Infinity;

      // Reset error count if more than 30 seconds have passed
      const newErrorCount = timeSinceLastError > 30000
        ? 1
        : prevState.errorCount + 1;

      return {
        error,
        errorInfo,
        errorCount: newErrorCount,
        lastErrorTime: now,
      };
    });

    // Enhanced error logging and reporting
    this.logError(error, errorInfo);

    // Report to external services in production
    if (!import.meta.env.DEV) {
      this.reportError(error, errorInfo);
    }
  }

  logError = (error, errorInfo) => {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.group('🔴 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error Count:', this.state.errorCount + 1);
      console.groupEnd();
    }
  };

  reportError = (error, errorInfo) => {
    // Send to error tracking service (Sentry, LogRocket, etc.)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          errorBoundary: true,
          errorCount: this.state.errorCount,
        },
      });
    }

    // Send to custom logging service
    if (window.errorLogger) {
      window.errorLogger.log('error_boundary', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  copyErrorDetails = () => {
    const { error, errorInfo } = this.state;
    const errorDetails = {
      message: error?.toString() || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        // Show success toast if available
        if (window.toast) {
          window.toast.success('Detalhes copiados para a área de transferência');
        }
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = JSON.stringify(errorDetails, null, 2);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        if (window.toast) {
          window.toast.success('Detalhes copiados para a área de transferência');
        }
      });
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      const { error, errorInfo, errorCount } = this.state;

      // If too many errors in quick succession, suggest reload
      const shouldSuggestReload = errorCount > 3;
      const isCriticalError = errorCount > 5;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className={`max-w-2xl w-full ${isCriticalError ? 'border-red-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${isCriticalError ? 'bg-red-100 dark:bg-red-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                  <FiAlertTriangle className={`h-8 w-8 ${isCriticalError ? 'text-red-600' : 'text-red-600 dark:text-red-400'}`} />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {isCriticalError ? 'Erro Crítico' : 'Oops! Algo deu errado'}
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {isCriticalError
                      ? 'Ocorreram múltiplos erros críticos. A aplicação precisa ser recarregada.'
                      : 'Ocorreu um erro inesperado na aplicação'
                    }
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {shouldSuggestReload && (
                <div className={`p-4 rounded-lg border ${isCriticalError ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'}`}>
                  <p className={`text-sm ${isCriticalError ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
                    {isCriticalError ? (
                      <>
                        <strong>Muitos erros críticos detectados.</strong> A aplicação será recarregada automaticamente em 5 segundos.
                      </>
                    ) : (
                      <>
                        <strong>Múltiplos erros detectados.</strong> Recomendamos recarregar a página.
                      </>
                    )}
                  </p>
                  {isCriticalError && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      Recarregando em: <span id="countdown">5</span>s
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-surface rounded-lg border">
                <p className="text-sm font-medium mb-2">O que aconteceu?</p>
                <p className="text-sm text-muted-foreground">
                  A aplicação encontrou um problema e não pôde continuar. Nosso time foi notificado
                  automaticamente e estamos trabalhando na correção.
                </p>
              </div>

              {isDev && error && (
                <details className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-red-900 dark:text-red-200 mb-2">
                    Detalhes técnicos (modo desenvolvimento)
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-red-900 dark:text-red-200">Erro:</p>
                      <pre className="text-xs bg-red-100 dark:bg-red-900/20 p-2 rounded mt-1 overflow-auto max-h-32">
                        {error.toString()}
                      </pre>
                    </div>
                    {errorInfo && errorInfo.componentStack && (
                      <div>
                        <p className="text-xs font-medium text-red-900 dark:text-red-200">
                          Component Stack:
                        </p>
                        <pre className="text-xs bg-red-100 dark:bg-red-900/20 p-2 rounded mt-1 overflow-auto max-h-40">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={this.copyErrorDetails}
                      className="flex items-center gap-2"
                    >
                      <FiCopy className="w-3 h-3" />
                      Copiar detalhes
                    </Button>
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  variant="default"
                  disabled={isCriticalError}
                >
                  <FiRefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>

                {shouldSuggestReload ? (
                  <Button
                    onClick={this.handleReload}
                    className="flex-1"
                    variant="outline"
                  >
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    Recarregar Página
                  </Button>
                ) : (
                  <Button
                    onClick={this.handleGoHome}
                    className="flex-1"
                    variant="outline"
                  >
                    <FiHome className="mr-2 h-4 w-4" />
                    Ir para Início
                  </Button>
                )}

                <Button
                  onClick={() => window.open('mailto:suporte@tamanduai.com?subject=Erro na aplicação', '_blank')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FiExternalLink className="w-3 h-3" />
                  Reportar erro
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Se o problema persistir, entre em contato com{' '}
                  <a
                    href="mailto:suporte@tamanduai.com"
                    className="text-primary hover:underline"
                  >
                    suporte@tamanduai.com
                  </a>
                  {isDev && (
                    <>
                      {' '}ou abra um{' '}
                      <a
                        href="https://github.com/seu-repo/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        issue no GitHub
                      </a>
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Auto-reload for critical errors */}
          {isCriticalError && (
            <AutoReloadScript />
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Component to handle auto-reload for critical errors
class AutoReloadScript extends React.Component {
  componentDidMount() {
    let countdown = 5;
    const countdownElement = document.getElementById('countdown');

    const timer = setInterval(() => {
      countdown--;
      if (countdownElement) {
        countdownElement.textContent = countdown.toString();
      }

      if (countdown <= 0) {
        clearInterval(timer);
        window.location.reload();
      }
    }, 1000);
  }

  render() {
    return null;
  }
}

export default ErrorBoundary;
