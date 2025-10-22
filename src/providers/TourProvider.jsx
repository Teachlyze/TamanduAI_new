import Joyride, { STATUS, ACTIONS, EVENTS } from "react-joyride";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
const TourContext = createContext({ startTour: (role) => {} });

export const useTour = () => useContext(TourContext);

// Lazy import steps per role
const loadStepsForRole = async (role) => {
  switch (role) {
    case "teacher":
      return (await import("@/tours/steps.teacher")).default;
    case "student":
      return (await import("@/tours/steps.student")).default;
    case "school":
      return (await import("@/tours/steps.school")).default;
    default:
      return [];
  }
};

const TourProvider = ({ children }) => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState([]);
  const [role, setRole] = useState(null);

  const onboardingCompleted =
    user?.user_metadata?.onboarding_completed === true;
  const userRole = user?.user_metadata?.role || "student";

  const startTour = useCallback(
    async (r) => {
      const effectiveRole = r || userRole;
      try {
        // Skip if already seen for this role (persisted locally)
        const seenKey = `tamanduai_tour_seen_${effectiveRole}`;
        const alreadySeen = localStorage.getItem(seenKey) === "1";
        if (alreadySeen) return;

        // Give the UI a moment to mount navigations before querying targets
        await new Promise((res) => setTimeout(res, 300));

        const loaded = await loadStepsForRole(effectiveRole);

        // Keep only steps whose targets exist in the current DOM (or are 'body')
        const available = (loaded || []).filter((s) => {
          if (!s?.target || s.target === "body") return true;
          try {
            return !!document.querySelector(s.target);
          } catch {
            return false;
          }
        });

        if (available.length < 2) {
          console.warn(
            "[Tour] Not enough targets found for role",
            effectiveRole,
            available
          );
          return; // avoid awkward jump welcome -> end
        }

        setRole(effectiveRole);
        setSteps(available);
        setRun(true);
      } catch (e) {
        console.error("[Tour] Failed to load steps for role", effectiveRole, e);
      }
    },
    [userRole]
  );

  useEffect(() => {
    if (!user || onboardingCompleted) return;
    // start tour automatically after login for first-time users
    startTour(userRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleJoyrideCallback = useCallback(
    async (data) => {
      const { status, action, type } = data;

      const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
      if (
        type === EVENTS.TOUR_END ||
        (type === EVENTS.TARGET_NOT_FOUND && action === ACTIONS.CLOSE)
      ) {
        setRun(false);
      }

      if (finishedStatuses.includes(status)) {
        setRun(false);
        // mark onboarding_completed for first-time
        try {
          if (user && !onboardingCompleted) {
            await supabase.auth.updateUser({
              data: {
                onboarding_completed: true,
                onboarding_completed_at: new Date().toISOString(),
              },
            });
          }
          // persist per-role completion to avoid re-showing locally
          if (role) {
            localStorage.setItem(`tamanduai_tour_seen_${role}`, "1");
          }
        } catch (e) {
          console.warn("[Tour] Failed to update onboarding_completed flag", e);
        }
      }
    },
    [user, onboardingCompleted, role]
  );

  const value = useMemo(() => ({ startTour }), [startTour]);

  return (
    <TourContext.Provider value={value}>
      {children}
      <Joyride
        run={run}
        steps={steps}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        disableOverlayClose
        styles={{
          options: {
            primaryColor: "#6d28d9",
            zIndex: 10000,
            arrowColor: "#111827",
            backgroundColor: "#111827",
            textColor: "#e5e7eb",
            overlayColor: "rgba(17, 24, 39, 0.6)",
            spotlightShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
          },
          tooltip: {
            borderRadius: "14px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            padding: "18px 20px",
          },
          buttonNext: {
            backgroundImage: "linear-gradient(90deg, #7c3aed, #2563eb)",
            borderRadius: "10px",
          },
          buttonBack: {
            color: "#9CA3AF",
          },
          buttonSkip: {
            color: "#9CA3AF",
          },
        }}
        locale={{
          back: "Voltar",
          close: "Fechar",
          last: "Concluir",
          next: "Próximo",
          skip: "Pular",
        }}
        callback={handleJoyrideCallback}
      />
    </TourContext.Provider>
  );
};

export default TourProvider;
