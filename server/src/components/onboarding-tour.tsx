import { useState, useEffect, useRef, useCallback } from "react";
import Joyride, { type Step, type CallBackProps, STATUS } from "react-joyride";
import { useCompleteOnboarding } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

interface OnboardingTourProps {
  run: boolean;
  onComplete: () => void;
}

const BASE = import.meta.env.BASE_URL || "/";

const STEPS: Step[] = [
  {
    target: '[data-tour="sidebar-nav"]',
    content: "Navigate between sections using the sidebar. Access the dialer, leads, analytics, and settings from here.",
    title: "Navigation",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tour="dialer-controls"]',
    content: "Start and control your calling session here. Click 'Start Dialing' to connect to the lead queue and begin making calls.",
    title: "Dialer Controls",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tour="queue-stats"]',
    content: "Monitor your queue and performance in real-time. See how many leads are ready, your call count, answer rate, and more.",
    title: "Queue & Stats",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-analytics"]',
    content: "View detailed analytics and reporting on your team's performance, call volumes, and conversion rates.",
    title: "Analytics",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-settings"]',
    content: "Configure your CRM integrations and Twilio phone setup here. Admins can manage credentials and provision phone numbers.",
    title: "Settings",
    placement: "right",
    disableBeacon: true,
  },
];

function useTourNarration() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    stop();

    const cached = cacheRef.current.get(text);
    if (cached) {
      const audio = new Audio(cached);
      audioRef.current = audio;
      audio.volume = 0.85;
      try { await audio.play(); } catch {}
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${BASE}api/tts/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text, voice: "nova" }),
        signal: controller.signal,
      });

      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      cacheRef.current.set(text, url);

      if (controller.signal.aborted) return;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.volume = 0.85;
      await audio.play();
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.warn("Tour narration unavailable:", e?.message);
      }
    }
  }, [stop]);

  const cleanup = useCallback(() => {
    stop();
    for (const url of cacheRef.current.values()) {
      URL.revokeObjectURL(url);
    }
    cacheRef.current.clear();
  }, [stop]);

  return { speak, stop, cleanup };
}

export function OnboardingTour({ run, onComplete }: OnboardingTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const completeOnboarding = useCompleteOnboarding();
  const queryClient = useQueryClient();
  const { speak, stop, cleanup } = useTourNarration();
  const mutedRef = useRef(isMuted);

  useEffect(() => { mutedRef.current = isMuted; }, [isMuted]);

  useEffect(() => {
    if (run) {
      setStepIndex(0);
      if (!mutedRef.current) {
        const step = STEPS[0];
        if (step) speak(`${step.title}. ${step.content}`);
      }
    }
    return cleanup;
  }, [run, speak, cleanup]);

  const handleCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    if (type === "step:after") {
      const nextIndex = index + (action === "prev" ? -1 : 1);
      setStepIndex(nextIndex);

      if (!mutedRef.current && nextIndex >= 0 && nextIndex < STEPS.length) {
        const step = STEPS[nextIndex];
        if (step) speak(`${step.title}. ${step.content}`);
      }
    }

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      stop();
      completeOnboarding.mutate(undefined, {
        onSuccess: () => {
          queryClient.setQueryData(getGetMeQueryKey(), (old: Record<string, unknown> | undefined) => {
            if (!old) return old;
            return { ...old, onboardingCompleted: true };
          });
          onComplete();
        },
      });
    }
  };

  return (
    <Joyride
      steps={STEPS}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      callback={handleCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#3b82f6",
          backgroundColor: "#18181b",
          textColor: "#e4e4e7",
          arrowColor: "#18181b",
          overlayColor: "rgba(0, 0, 0, 0.7)",
        },
        tooltip: {
          borderRadius: "16px",
          padding: "20px",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)",
        },
        tooltipTitle: {
          fontSize: "16px",
          fontWeight: 700,
          color: "#ffffff",
          marginBottom: "4px",
        },
        tooltipContent: {
          fontSize: "14px",
          lineHeight: "1.6",
          color: "#a1a1aa",
          padding: "8px 0",
        },
        buttonNext: {
          backgroundColor: "#3b82f6",
          borderRadius: "10px",
          padding: "8px 20px",
          fontSize: "13px",
          fontWeight: 600,
        },
        buttonBack: {
          color: "#71717a",
          fontSize: "13px",
          fontWeight: 500,
        },
        buttonSkip: {
          color: "#52525b",
          fontSize: "13px",
        },
        spotlight: {
          borderRadius: "16px",
        },
      }}
      tooltipComponent={({ continuous, index, step, backProps, primaryProps, skipProps, closeProps, isLastStep, size }) => (
        <div
          style={{
            backgroundColor: "#18181b",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)",
            maxWidth: "360px",
            position: "relative",
          }}
        >
          <button
            onClick={() => {
              setIsMuted((m) => {
                const next = !m;
                if (next) stop();
                else {
                  const s = STEPS[stepIndex];
                  if (s) speak(`${s.title}. ${s.content}`);
                }
                return next;
              });
            }}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "4px 8px",
              cursor: "pointer",
              color: isMuted ? "#52525b" : "#3b82f6",
              fontSize: "16px",
              lineHeight: 1,
              transition: "all 0.2s",
            }}
            title={isMuted ? "Unmute narration" : "Mute narration"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          {step.title && (
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "4px", paddingRight: "36px" }}>
              {step.title}
            </div>
          )}
          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#a1a1aa", padding: "8px 0" }}>
            {step.content}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                {...skipProps}
                style={{ color: "#52525b", fontSize: "13px", background: "none", border: "none", cursor: "pointer", padding: "6px 12px" }}
              >
                Skip Tour
              </button>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ color: "#52525b", fontSize: "12px" }}>
                {index + 1}/{size}
              </span>
              {index > 0 && (
                <button
                  {...backProps}
                  style={{ color: "#71717a", fontSize: "13px", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: "6px 12px" }}
                >
                  Back
                </button>
              )}
              {continuous && (
                <button
                  {...(isLastStep ? closeProps : primaryProps)}
                  style={{
                    backgroundColor: "#3b82f6",
                    borderRadius: "10px",
                    padding: "8px 20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {isLastStep ? "Finish" : "Next"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip Tour",
      }}
    />
  );
}
