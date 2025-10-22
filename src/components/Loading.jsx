import { LoadingScreen } from "@/components/ui/LoadingScreen";
import {
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  Zap,
  Activity,
  Clock,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect, useCallback, useMemo } from "react";

import {
  LOADING_TYPES,
  PROGRESS_VARIANTS,
  SKELETON_VARIANTS,
} from "@/constants/loading";

// Color classes for animations
const colorClasses = {
  blue: "text-blue-500",
  green: "text-green-500",
  red: "text-red-500",
  yellow: "text-yellow-500",
  purple: "text-purple-500",
  gray: "text-gray-500",
};

export default function Loading({
  timeout = 15000,
  onTimeout,
  onRetry,
  message = "Carregando...",
  showRetryButton = true,
  showReloadButton = true,
  type = LOADING_TYPES.SPINNER,
  progress = null,
  size = "md",
  color = "blue",
  skeletonVariant = SKELETON_VARIANTS.TEXT,
  skeletonLines = 3,
  showProgressText = false,
  retryAttempts = 3,
  autoRetry = false,
}) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Animation phases for different loading types
  useEffect(() => {
    if (type === LOADING_TYPES.DOTS) {
      const interval = setInterval(() => {
        setAnimationPhase((prev) => (prev + 1) % 3);
      }, 300);
      /* if (loading) return <LoadingScreen />; */

      return () => clearInterval(interval);
    }
  }, [type]);

  // Progress animation for progress type
  useEffect(() => {
    if (type === LOADING_TYPES.PROGRESS && progress === null) {
      const interval = setInterval(() => {
        setCurrentProgress((prev) => {
          if (prev >= 90) return 0; // Reset for indeterminate effect
          return prev + Math.random() * 10;
        }, []);
      }, 200);
      /* if (loading) return <LoadingScreen />; */

      return () => clearInterval(interval);
    }
  }, [type, progress]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    /* if (loading) return <LoadingScreen />; */

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Timeout logic
  useEffect(() => {
    if (timeout > 0 && !hasTimedOut) {
      const timer = setTimeout(() => {
        setHasTimedOut(true);
        if (onTimeout) {
          onTimeout();
        }
      }, timeout);

      /* if (loading) return <LoadingScreen />; */

      return () => clearTimeout(timer);
    }
  }, [timeout, onTimeout, hasTimedOut]);

  // Retry handler must be defined before effects that depend on it
  const handleRetry = useCallback(async () => {
    if (isRetrying || retryCount >= retryAttempts) return;

    setIsRetrying(true);
    setHasTimedOut(false);
    setRetryCount((prev) => prev + 1);

    try {
      if (onRetry) {
        await onRetry();
      } else {
        // Default retry logic - reload page
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro no retry:", error);
      setHasTimedOut(true);
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, retryCount, retryAttempts, onRetry]);

  // Auto retry logic
  useEffect(() => {
    if (autoRetry && hasTimedOut && retryCount < retryAttempts) {
      const retryTimer = setTimeout(
        () => {
          handleRetry();
        },
        2000 + retryCount * 1000
      ); // Increasing delay

      /* if (loading) return <LoadingScreen />; */

      return () => clearTimeout(retryTimer);
    }
  }, [hasTimedOut, retryCount, autoRetry, retryAttempts, handleRetry]);

  // Memoized loading component based on type
  const LoadingComponent = useMemo(() => {
    const sizeClasses = {
      xs: "w-4 h-4",
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-12 h-12",
      xl: "w-16 h-16",
    };

    const colorClasses = {
      blue: "text-blue-500",
      green: "text-green-500",
      red: "text-red-500",
      yellow: "text-yellow-500",
      purple: "text-purple-500",
      gray: "text-gray-500",
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const colorClass = colorClasses[color] || colorClasses.blue;

    switch (type) {
      case LOADING_TYPES.SPINNER: {
        /* if (loading) return <LoadingScreen />; */

        return (
          <div
            className={`relative flex items-center justify-center ${sizeClass}`}
          >
            <Loader2
              className={`animate-spin ${colorClass}`}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        );
      }

      case LOADING_TYPES.DOTS: {
        /* if (loading) return <LoadingScreen />; */

        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full bg-current ${colorClass} transition-opacity duration-300 ${
                  animationPhase === i ? "opacity-100" : "opacity-30"
                }`}
              />
            ))}
          </div>
        );
      }

      case LOADING_TYPES.BARS: {
        /* if (loading) return <LoadingScreen />; */

        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1 bg-current ${colorClass} animate-pulse`}
                style={{
                  height: `${20 + i * 10}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );
      }

      case LOADING_TYPES.PROGRESS: {
        const displayProgress = progress ?? currentProgress;
        /* if (loading) return <LoadingScreen />; */

        return (
          <div className="w-full max-w-xs">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${colorClass.replace("text-", "bg-")}`}
                style={{ width: `${Math.min(displayProgress, 100)}%` }}
              />
            </div>
            {showProgressText && (
              <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                {Math.round(displayProgress)}%
              </div>
            )}
          </div>
        );
      }

      case LOADING_TYPES.CIRCLE: {
        /* if (loading) return <LoadingScreen />; */

        return (
          <div className={`relative ${sizeClass}`}>
            <svg className={`w-full h-full ${colorClass}`} viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
                className="animate-spin"
                style={{
                  animation:
                    "spin 1s linear infinite, dash 2s ease-in-out infinite",
                }}
              />
            </svg>
          </div>
        );
      }

      case LOADING_TYPES.PULSE: {
        /* if (loading) return <LoadingScreen />; */

        return (
          <div className={`${sizeClass} ${colorClass}`}>
            <Activity className="w-full h-full animate-pulse" />
          </div>
        );
      }

      case LOADING_TYPES.SKELETON: {
        return (
          <SkeletonLoader variant={skeletonVariant} lines={skeletonLines} />
        );
      }

      default: {
        return (
          <Loader2 className={`${sizeClass} animate-spin ${colorClass}`} />
        );
      }
    }
  }, [
    type,
    size,
    color,
    animationPhase,
    currentProgress,
    progress,
    showProgressText,
    skeletonVariant,
    skeletonLines,
  ]);

  if (hasTimedOut) {
    /* if (loading) return <LoadingScreen />; */

    return (
      <div className="flex flex-col justify-center items-center h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            {isOnline ? (
              <AlertCircle className="w-16 h-16 text-red-500" />
            ) : (
              <WifiOff className="w-16 h-16 text-orange-500" />
            )}
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {isOnline ? "Tempo limite excedido" : "Sem conexão com a internet"}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isOnline
              ? `Tentativa ${retryCount + 1} de ${retryAttempts}. A operação está demorando mais do que o esperado.`
              : "Verifique sua conexão com a internet e tente novamente."}
          </p>

          {retryCount > 0 && (
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 inline mr-1" />
              Tentativas realizadas: {retryCount}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showRetryButton && retryCount < retryAttempts && (
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex items-center gap-2"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Tentando novamente...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Tentar novamente
                  </>
                )}
              </Button>
            )}

            {showReloadButton && (
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar página
              </Button>
            )}
          </div>

          {/* Network status indicator */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span>Conectado</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-orange-500" />
                <span>Sem conexão</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* if (loading) return <LoadingScreen />; */

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-6">
        {/* Main loading component */}
        <div className="relative">
          {LoadingComponent}

          {/* Overlay effects for certain types */}
          {type === LOADING_TYPES.SPINNER && (
            <div
              className={`absolute inset-0 ${size === "xl" ? "w-16 h-16" : size === "lg" ? "w-12 h-12" : "w-8 h-8"} rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 animate-pulse`}
            ></div>
          )}
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            {message}
          </p>

          {/* Animated dots for text */}
          <div className="flex items-center justify-center space-x-1 mt-2">
            <div
              className={`w-1 h-1 bg-current ${colorClasses[color] || "text-blue-500"} rounded-full animate-bounce`}
            ></div>
            <div
              className={`w-1 h-1 bg-current ${colorClasses[color] || "text-blue-500"} rounded-full animate-bounce`}
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className={`w-1 h-1 bg-current ${colorClasses[color] || "text-blue-500"} rounded-full animate-bounce`}
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>

        {/* Progress indicator for long operations */}
        {timeout > 5000 && (
          <div className="w-full max-w-xs">
            <div className="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(((Date.now() % timeout) / timeout) * 100, 95)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton loader component
function SkeletonLoader({ variant, lines }) {
  const baseClasses = "bg-gray-200 dark:bg-gray-700 animate-pulse";

  switch (variant) {
    case SKELETON_VARIANTS.TEXT:
      /* if (loading) return <LoadingScreen />; */

      return (
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={`${baseClasses} h-4 rounded`}
              style={{ width: `${Math.random() * 40 + 60}%` }}
            />
          ))}
        </div>
      );

    case SKELETON_VARIANTS.RECTANGLE:
      /* if (loading) return <LoadingScreen />; */

      return (
        <div className={`${baseClasses} h-32 w-full max-w-md rounded-lg`} />
      );

    case SKELETON_VARIANTS.CIRCLE:
      /* if (loading) return <LoadingScreen />; */

      return <div className={`${baseClasses} h-16 w-16 rounded-full`} />;

    case SKELETON_VARIANTS.CARD:
      /* if (loading) return <LoadingScreen />; */

      return (
        <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className={`${baseClasses} h-6 w-3/4 rounded`} />
          <div className={`${baseClasses} h-4 w-full rounded`} />
          <div className={`${baseClasses} h-4 w-2/3 rounded`} />
          <div className={`${baseClasses} h-8 w-1/3 rounded`} />
        </div>
      );
    default:
      return <div className={`${baseClasses} h-4 w-full rounded`} />;
  }
}
