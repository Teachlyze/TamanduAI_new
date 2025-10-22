import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { PremiumButton } from "./ui/PremiumButton";
import { useState, useEffect } from "react";
/**
 * Onboarding Tour Component
 * Guided tour for first-time users
 */
export const OnboardingTour = ({ steps = [], onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem("onboarding-completed");
    if (!hasCompletedOnboarding && steps.length > 0) {
      setIsActive(true);
    }
  }, [steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding-completed", "true");
    setIsActive(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding-completed", "true");
    setIsActive(false);
    onSkip?.();
  };

  if (!isActive || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  /* if (loading) return <LoadingScreen />; */

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Spotlight on target element */}
          {currentStepData.target && (
            <div className="fixed inset-0 z-[101] pointer-events-none">
              <svg className="w-full h-full">
                <defs>
                  <mask id="spotlight-mask">
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    <rect
                      x={currentStepData.target.x || 0}
                      y={currentStepData.target.y || 0}
                      width={currentStepData.target.width || 0}
                      height={currentStepData.target.height || 0}
                      rx="12"
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="rgba(0, 0, 0, 0.7)"
                  mask="url(#spotlight-mask)"
                />
              </svg>
            </div>
          )}

          {/* Tour Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-[102]"
            style={{
              top: currentStepData.position?.top || "50%",
              left: currentStepData.position?.left || "50%",
              transform: currentStepData.position?.top
                ? "translateX(-50%)"
                : "translate(-50%, -50%)",
              maxWidth: "420px",
              width: "90%",
            }}
          >
            <div className="bg-card rounded-2xl shadow-themed-lg border border-border p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {currentStepData.icon && (
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-3">
                      <currentStepData.icon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {currentStepData.title}
                  </h3>
                </div>
                <button
                  onClick={handleSkip}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                {currentStepData.description}
              </p>

              {/* Progress Dots */}
              <div className="flex items-center gap-2 mb-6">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentStep
                        ? "w-8 bg-primary"
                        : index < currentStep
                          ? "w-1.5 bg-success"
                          : "w-1.5 bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {currentStep + 1} de {steps.length}
                </div>
                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      leftIcon={ArrowLeft}
                      onClick={handlePrevious}
                    >
                      Anterior
                    </PremiumButton>
                  )}
                  <PremiumButton
                    variant={isLastStep ? "gradient" : "primary"}
                    size="sm"
                    rightIcon={isLastStep ? Check : ArrowRight}
                    onClick={handleNext}
                  >
                    {isLastStep ? "Concluir" : "Próximo"}
                  </PremiumButton>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Hook to trigger onboarding
 */
export const useOnboarding = () => {
  const startOnboarding = () => {
    localStorage.removeItem("onboarding-completed");
    window.location.reload();
  };

  const resetOnboarding = () => {
    localStorage.removeItem("onboarding-completed");
  };

  const hasCompletedOnboarding = () => {
    return localStorage.getItem("onboarding-completed") === "true";
  };

  return {
    startOnboarding,
    resetOnboarding,
    hasCompletedOnboarding,
  };
};
