import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AnimationLevel = "full" | "quiet" | "minimal";

interface SettingsState {
  animationLevel: AnimationLevel;
  hasChosenAnimationLevel: boolean;
  showAnimationControls: boolean;
}

interface SettingsContextValue extends SettingsState {
  setAnimationLevel: (level: AnimationLevel) => void;
  setHasChosenAnimationLevel: (chosen: boolean) => void;
  setShowAnimationControls: (visible: boolean) => void;
}

const DEFAULT_SETTINGS: SettingsState = {
  animationLevel: "full",
  hasChosenAnimationLevel: false,
  showAnimationControls: true,
};

const STORAGE_KEY = "buddy_settings_v1";

function loadSettings(): SettingsState {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    const animationLevel: AnimationLevel =
      parsed.animationLevel === "quiet" || parsed.animationLevel === "minimal"
        ? parsed.animationLevel
        : "full";
    const hasChosenAnimationLevel = Boolean(parsed.hasChosenAnimationLevel);
    const showAnimationControls =
      typeof parsed.showAnimationControls === "boolean" ? parsed.showAnimationControls : true;
    return { animationLevel, hasChosenAnimationLevel, showAnimationControls };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SettingsState>(() => loadSettings());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Игнорируем ошибки localStorage (например, приватный режим)
    }
  }, [state]);

  const setAnimationLevel = (animationLevel: AnimationLevel) => {
    setState(prev => ({ ...prev, animationLevel }));
  };

  const setHasChosenAnimationLevel = (hasChosenAnimationLevel: boolean) => {
    setState(prev => ({ ...prev, hasChosenAnimationLevel }));
  };

  const setShowAnimationControls = (showAnimationControls: boolean) => {
    setState(prev => ({ ...prev, showAnimationControls }));
  };

  return (
    <SettingsContext.Provider
      value={{
        animationLevel: state.animationLevel,
        hasChosenAnimationLevel: state.hasChosenAnimationLevel,
        showAnimationControls: state.showAnimationControls,
        setAnimationLevel,
        setHasChosenAnimationLevel,
        setShowAnimationControls,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}

