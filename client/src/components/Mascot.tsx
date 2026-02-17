import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export type MascotMood = "idle" | "happy" | "thinking" | "celebrating" | "encouraging" | "wrong" | "hint";

interface MascotProps {
  mood: MascotMood;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Mascot({ mood, className, size = "md" }: MascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [reactionMouth, setReactionMouth] = useState<string | null>(null);
  const [reactionBounce, setReactionBounce] = useState(false);
  const [reactionWide, setReactionWide] = useState(false);
  const [reactionSurprised, setReactionSurprised] = useState(false);
  const [antennaKey, setAntennaKey] = useState(0);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let clientX: number, clientY: number;
    if ("touches" in e) {
      if (!e.touches[0]) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxShift = 3;
    const factor = Math.min(dist / 200, 1);
    setPupilOffset({
      x: (dx / (dist || 1)) * maxShift * factor,
      y: (dy / (dist || 1)) * maxShift * factor,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
    };
  }, [handlePointerMove]);

  const antennaActive = mood === "celebrating" || mood === "happy" || mood === "hint" || mood === "encouraging";

  useEffect(() => {
    if (mood === "celebrating" || mood === "happy") {
      setReactionMouth("M 85 110 Q 100 125 115 110");
      setReactionBounce(true);
      setReactionWide(false);
      setReactionSurprised(false);
      setAntennaKey((k) => k + 1);
      const timer = setTimeout(() => {
        setReactionMouth(null);
        setReactionBounce(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (mood === "wrong") {
      setReactionMouth("M 90 118 L 110 118");
      setReactionWide(true);
      setReactionBounce(false);
      setReactionSurprised(false);
      const timer = setTimeout(() => {
        setReactionMouth(null);
        setReactionWide(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (mood === "hint") {
      setReactionSurprised(true);
      setReactionBounce(false);
      setReactionWide(false);
      setReactionMouth(null);
      setAntennaKey((k) => k + 1);
    } else if (mood === "encouraging") {
      setAntennaKey((k) => k + 1);
      setReactionMouth(null);
      setReactionBounce(false);
      setReactionWide(false);
      setReactionSurprised(false);
    } else {
      setReactionMouth(null);
      setReactionBounce(false);
      setReactionWide(false);
      setReactionSurprised(false);
    }
  }, [mood]);

  const getBaseMouthPath = () => {
    switch (mood) {
      case "happy":
      case "celebrating":
        return "M 85 118 Q 100 132 115 118";
      case "encouraging":
        return "M 87 118 Q 100 126 113 118";
      case "thinking":
        return "M 93 120 Q 100 118 107 120";
      case "wrong":
        return "M 90 118 L 110 118";
      default:
        return "M 90 118 Q 100 124 110 118";
    }
  };

  const useSurprisedMouth = reactionSurprised || mood === "hint";
  const mouthPath = useSurprisedMouth ? null : (reactionMouth || getBaseMouthPath());

  const getEyeStyle = () => {
    if (reactionSurprised || mood === "hint") {
      return { leftRx: 7, leftRy: 8, rightRx: 7, rightRy: 8, squint: false, surprised: true };
    }
    if (reactionWide || mood === "wrong") {
      return { leftRx: 6, leftRy: 8, rightRx: 6, rightRy: 8, squint: false, surprised: false };
    }
    if (mood === "happy" || mood === "celebrating") {
      return { leftRx: 6, leftRy: 3, rightRx: 6, rightRy: 3, squint: true, surprised: false };
    }
    if (mood === "thinking") {
      return { leftRx: 6, leftRy: 6, rightRx: 6, rightRy: 4, squint: false, surprised: false };
    }
    return { leftRx: 6, leftRy: 6, rightRx: 6, rightRy: 6, squint: false, surprised: false };
  };

  const eyes = getEyeStyle();

  const bodyAnimation = (() => {
    if (reactionBounce) return "animate-buddy-jump";
    switch (mood) {
      case "idle": return "animate-breathe";
      case "happy": return "animate-bounce-soft";
      case "thinking": return "animate-buddy-thinking";
      case "celebrating": return "animate-celebrate";
      case "encouraging": return "animate-nod";
      case "wrong": return "animate-nod";
      case "hint": return "animate-buddy-surprise";
      default: return "animate-breathe";
    }
  })();

  const eyeBlinkClass = (() => {
    if (eyes.squint || eyes.surprised) return "";
    if (mood === "thinking") return "buddy-eyes-slow";
    return "buddy-eyes";
  })();

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center justify-center", sizeClasses[size], className)}
      data-testid="mascot"
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="buddy-body-grad" cx="50%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#D6EFFF" />
            <stop offset="100%" stopColor="#BEE3F8" />
          </radialGradient>
          <radialGradient id="buddy-face-grad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </radialGradient>
          <radialGradient id="buddy-cheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="100" cy="180" rx="36" ry="7" fill="#94A3B8" opacity="0.18" />

        <g className={cn("buddy-body", bodyAnimation)}>
          <ellipse cx="100" cy="105" rx="52" ry="60" fill="url(#buddy-body-grad)" stroke="#63B3ED" strokeWidth="3" />

          <g key={antennaKey} className={antennaActive ? "buddy-antenna-active" : "buddy-antenna-idle"}>
            <line x1="100" y1="48" x2="100" y2="30" stroke="#63B3ED" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="26" r="7" fill="#63B3ED" />
            <circle cx="100" cy="26" r="4" fill="#90CDF4" />
            {(mood === "celebrating" || mood === "happy") && (
              <circle cx="100" cy="26" r="7" fill="#FBBF24" opacity="0.5" className="animate-sparkle" />
            )}
            {mood === "hint" && (
              <circle cx="100" cy="26" r="7" fill="#60A5FA" opacity="0.5" className="animate-sparkle" />
            )}
          </g>

          <rect x="38" y="90" width="12" height="7" rx="3.5" fill="#90CDF4" stroke="#63B3ED" strokeWidth="1.5" />
          <rect x="150" y="90" width="12" height="7" rx="3.5" fill="#90CDF4" stroke="#63B3ED" strokeWidth="1.5" />

          <ellipse cx="100" cy="97" rx="36" ry="28" fill="url(#buddy-face-grad)" stroke="#E2E8F0" strokeWidth="1.5" />

          <g className={eyeBlinkClass}>
            {eyes.squint ? (
              <>
                <path d="M 80 93 Q 87 86 94 93" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 106 93 Q 113 86 120 93" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </>
            ) : eyes.surprised ? (
              <>
                <circle cx={87 + pupilOffset.x * 0.3} cy={93 + pupilOffset.y * 0.3} r="9" fill="white" stroke="#2D3748" strokeWidth="1.5" />
                <circle cx={87 + pupilOffset.x} cy={93 + pupilOffset.y} r="4" fill="#2D3748" />
                <circle cx={88.5 + pupilOffset.x * 0.5} cy={91 + pupilOffset.y * 0.5} r="1.5" fill="white" />

                <circle cx={113 + pupilOffset.x * 0.3} cy={93 + pupilOffset.y * 0.3} r="9" fill="white" stroke="#2D3748" strokeWidth="1.5" />
                <circle cx={113 + pupilOffset.x} cy={93 + pupilOffset.y} r="4" fill="#2D3748" />
                <circle cx={114.5 + pupilOffset.x * 0.5} cy={91 + pupilOffset.y * 0.5} r="1.5" fill="white" />
              </>
            ) : (
              <>
                <ellipse cx={87 + pupilOffset.x} cy={93 + pupilOffset.y} rx={eyes.leftRx} ry={eyes.leftRy} fill="#2D3748" />
                <ellipse cx={113 + pupilOffset.x} cy={93 + pupilOffset.y} rx={eyes.rightRx} ry={eyes.rightRy} fill="#2D3748" />
                <circle cx={89 + pupilOffset.x * 0.5} cy={91 + pupilOffset.y * 0.5} r="2" fill="white" opacity="0.8" />
                <circle cx={115 + pupilOffset.x * 0.5} cy={91 + pupilOffset.y * 0.5} r="2" fill="white" opacity="0.8" />
              </>
            )}
          </g>

          {useSurprisedMouth ? (
            <ellipse cx="100" cy="110" rx="4.5" ry="5.5" fill="#2D3748" opacity="0.8" />
          ) : (
            <path
              d={mouthPath!}
              stroke="#2D3748"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          )}

          {(mood === "happy" || mood === "celebrating") && (
            <>
              <circle cx="74" cy="100" r="5" fill="url(#buddy-cheek)" />
              <circle cx="126" cy="100" r="5" fill="url(#buddy-cheek)" />
            </>
          )}
        </g>

        {mood === "celebrating" && (
          <>
            <circle cx="30" cy="35" r="3" fill="#FBBF24" className="animate-sparkle" />
            <circle cx="170" cy="30" r="2.5" fill="#F472B6" className="animate-sparkle-delay" />
            <circle cx="25" cy="75" r="2" fill="#60A5FA" className="animate-sparkle" />
            <circle cx="175" cy="70" r="2.5" fill="#34D399" className="animate-sparkle-delay" />
            <circle cx="65" cy="18" r="2" fill="#A78BFA" className="animate-sparkle" />
            <circle cx="135" cy="15" r="2" fill="#FB923C" className="animate-sparkle-delay" />
          </>
        )}

        {mood === "thinking" && (
          <>
            <circle cx="155" cy="55" r="5" fill="#E2E8F0" opacity="0.7" className="animate-thought-1" />
            <circle cx="167" cy="43" r="7" fill="#E2E8F0" opacity="0.5" className="animate-thought-2" />
            <circle cx="173" cy="27" r="4" fill="#E2E8F0" opacity="0.3" className="animate-thought-3" />
          </>
        )}

        {mood === "wrong" && (
          <>
            <circle cx="72" cy="65" r="3" fill="#93C5FD" opacity="0.3" />
            <circle cx="128" cy="60" r="2" fill="#93C5FD" opacity="0.25" />
          </>
        )}

        {mood === "hint" && (
          <>
            <circle cx="145" cy="50" r="3" fill="#FBBF24" className="animate-sparkle" />
            <circle cx="55" cy="45" r="2.5" fill="#60A5FA" className="animate-sparkle-delay" />
          </>
        )}
      </svg>
    </div>
  );
}
