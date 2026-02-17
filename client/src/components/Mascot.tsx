import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export type MascotMood = "idle" | "happy" | "thinking" | "celebrating" | "encouraging" | "wrong" | "hint";

interface MascotProps {
  mood: MascotMood;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isSpeaking?: boolean;
  bookOpen?: boolean;
}

export function Mascot({ mood, className, size = "md", isSpeaking = false, bookOpen = false }: MascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [reactionMouth, setReactionMouth] = useState<string | null>(null);
  const [reactionBounce, setReactionBounce] = useState(false);
  const [reactionWide, setReactionWide] = useState(false);
  const [reactionSurprised, setReactionSurprised] = useState(false);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
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

  useEffect(() => {
    if (mood === "celebrating" || mood === "happy") {
      setReactionMouth("happy");
      setReactionBounce(true);
      setReactionWide(false);
      setReactionSurprised(false);
      const timer = setTimeout(() => {
        setReactionMouth(null);
        setReactionBounce(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (mood === "wrong") {
      setReactionMouth("sad");
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
    } else if (mood === "encouraging") {
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

  const getMouthPath = () => {
    if (reactionSurprised || mood === "hint") return "surprised";
    if (reactionMouth === "happy" || mood === "happy" || mood === "celebrating") return "happy";
    if (reactionMouth === "sad" || mood === "wrong") return "flat";
    if (mood === "encouraging") return "smile";
    if (mood === "thinking") return "thinking";
    return "default";
  };

  const mouthType = getMouthPath();

  const getEyeStyle = () => {
    if (reactionSurprised || mood === "hint") {
      return { squint: false, surprised: true, wide: false };
    }
    if (reactionWide || mood === "wrong") {
      return { squint: false, surprised: false, wide: true };
    }
    if (mood === "happy" || mood === "celebrating") {
      return { squint: true, surprised: false, wide: false };
    }
    return { squint: false, surprised: false, wide: false };
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

  const bookAngle = bookOpen ? -35 : -10;

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center justify-center", sizeClasses[size], className)}
      data-testid="mascot"
    >
      <svg
        viewBox="0 0 220 200"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="buddy-body-grad" cx="45%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#D4F5E0" />
            <stop offset="60%" stopColor="#B8E8C8" />
            <stop offset="100%" stopColor="#9EDCB0" />
          </radialGradient>
          <radialGradient id="buddy-cheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD6E0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFD6E0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="book-cover" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F2994A" />
            <stop offset="100%" stopColor="#E07B30" />
          </linearGradient>
          <linearGradient id="book-pages" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFF8EC" />
            <stop offset="100%" stopColor="#FFEFD5" />
          </linearGradient>
          <linearGradient id="headphone-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3D5A80" />
            <stop offset="100%" stopColor="#2C3E5A" />
          </linearGradient>
        </defs>

        <ellipse cx="100" cy="185" rx="40" ry="6" fill="#94A3B8" opacity="0.15" />

        <g className={cn("buddy-body", bodyAnimation)}>
          <circle cx="100" cy="100" r="58" fill="url(#buddy-body-grad)" />
          <circle cx="100" cy="100" r="56" fill="none" stroke="#8BCFA0" strokeWidth="2" opacity="0.6" />

          <path
            d="M 42 85 Q 38 60 55 45 Q 60 40 60 48 L 60 80 Q 60 88 52 88 L 48 88 Q 42 88 42 82 Z"
            fill="url(#headphone-grad)"
          />
          <rect x="42" y="72" width="20" height="22" rx="6" fill="#3D5A80" />
          <rect x="44" y="74" width="16" height="18" rx="5" fill="#4A6D8C" />
          <ellipse cx="52" cy="83" rx="6" ry="7" fill="#5A7D9C" opacity="0.4" />

          <path
            d="M 158 85 Q 162 60 145 45 Q 140 40 140 48 L 140 80 Q 140 88 148 88 L 152 88 Q 158 88 158 82 Z"
            fill="url(#headphone-grad)"
          />
          <rect x="138" y="72" width="20" height="22" rx="6" fill="#3D5A80" />
          <rect x="140" y="74" width="16" height="18" rx="5" fill="#4A6D8C" />
          <ellipse cx="148" cy="83" rx="6" ry="7" fill="#5A7D9C" opacity="0.4" />

          <path
            d="M 55 45 Q 70 22 100 20 Q 130 22 145 45"
            fill="none"
            stroke="#3D5A80"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <g className={isSpeaking ? "buddy-mic-speaking" : ""}>
            <line x1="48" y1="92" x2="36" y2="120" stroke="#3D5A80" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="34" cy="124" r="5" fill="#3D5A80" />
            <circle cx="34" cy="124" r="3" fill="#4A6D8C" />
            <rect x="30" y="119" width="8" height="6" rx="2" fill="#3D5A80" />
          </g>

          <g className={eyeBlinkClass}>
            {eyes.squint ? (
              <>
                <path d="M 78 95 Q 85 87 92 95" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 108 95 Q 115 87 122 95" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </>
            ) : eyes.surprised ? (
              <>
                <circle cx={85 + pupilOffset.x * 0.3} cy={95 + pupilOffset.y * 0.3} r="10" fill="white" stroke="#2D3748" strokeWidth="1.5" />
                <circle cx={85 + pupilOffset.x} cy={95 + pupilOffset.y} r="5" fill="#2D3748" />
                <circle cx={86.5 + pupilOffset.x * 0.5} cy={93 + pupilOffset.y * 0.5} r="2" fill="white" />

                <circle cx={115 + pupilOffset.x * 0.3} cy={95 + pupilOffset.y * 0.3} r="10" fill="white" stroke="#2D3748" strokeWidth="1.5" />
                <circle cx={115 + pupilOffset.x} cy={95 + pupilOffset.y} r="5" fill="#2D3748" />
                <circle cx={116.5 + pupilOffset.x * 0.5} cy={93 + pupilOffset.y * 0.5} r="2" fill="white" />
              </>
            ) : (
              <>
                <circle cx={85 + pupilOffset.x * 0.3} cy={95 + pupilOffset.y * 0.3} r={eyes.wide ? 9 : 8} fill="white" stroke="#2D3748" strokeWidth="1.2" />
                <circle cx={85 + pupilOffset.x} cy={95 + pupilOffset.y} r={eyes.wide ? 5 : 4.5} fill="#2D3748" />
                <circle cx={86.5 + pupilOffset.x * 0.5} cy={93 + pupilOffset.y * 0.5} r="2" fill="white" />

                <circle cx={115 + pupilOffset.x * 0.3} cy={95 + pupilOffset.y * 0.3} r={eyes.wide ? 9 : 8} fill="white" stroke="#2D3748" strokeWidth="1.2" />
                <circle cx={115 + pupilOffset.x} cy={95 + pupilOffset.y} r={eyes.wide ? 5 : 4.5} fill="#2D3748" />
                <circle cx={116.5 + pupilOffset.x * 0.5} cy={93 + pupilOffset.y * 0.5} r="2" fill="white" />
              </>
            )}
          </g>

          {mouthType === "surprised" && (
            <ellipse cx="100" cy="115" rx="4" ry="5" fill="#2D3748" opacity="0.8" />
          )}
          {mouthType === "happy" && (
            <path d="M 87 112 Q 100 126 113 112" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
          {mouthType === "flat" && (
            <path d="M 90 115 L 110 115" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
          {mouthType === "smile" && (
            <path d="M 89 112 Q 100 122 111 112" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
          {mouthType === "thinking" && (
            <path d="M 93 116 Q 100 113 107 116" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
          {mouthType === "default" && (
            <path d="M 91 113 Q 100 120 109 113" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}

          {(mood === "happy" || mood === "celebrating") && (
            <>
              <circle cx="72" cy="105" r="6" fill="url(#buddy-cheek)" />
              <circle cx="128" cy="105" r="6" fill="url(#buddy-cheek)" />
            </>
          )}

          <g
            className="buddy-book-hand"
            style={{
              transformOrigin: "160px 135px",
              transform: `rotate(${bookAngle}deg)`,
              transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <circle cx="155" cy="130" r="7" fill="#9EDCB0" stroke="#8BCFA0" strokeWidth="1" />

            <rect x="155" y="115" width="28" height="35" rx="2" fill="url(#book-cover)" />
            <rect x="156" y="116" width="2" height="33" rx="1" fill="#D4824A" />

            <path
              d={bookOpen
                ? "M 158 117 L 182 115 L 182 148 L 158 150 Z"
                : "M 158 117 L 181 117 L 181 150 L 158 150 Z"
              }
              fill="url(#book-pages)"
              stroke="#E0D5C0"
              strokeWidth="0.5"
              style={{ transition: "d 0.5s ease" }}
            />

            {bookOpen && (
              <>
                <line x1="162" y1="122" x2="178" y2="121" stroke="#C8B89A" strokeWidth="0.7" opacity="0.5" />
                <line x1="162" y1="127" x2="178" y2="126" stroke="#C8B89A" strokeWidth="0.7" opacity="0.5" />
                <line x1="162" y1="132" x2="178" y2="131" stroke="#C8B89A" strokeWidth="0.7" opacity="0.5" />
                <line x1="162" y1="137" x2="175" y2="136" stroke="#C8B89A" strokeWidth="0.7" opacity="0.4" />
              </>
            )}
          </g>
        </g>

        {mood === "celebrating" && (
          <>
            <circle cx="30" cy="35" r="3" fill="#FBBF24" className="animate-sparkle" />
            <circle cx="185" cy="30" r="2.5" fill="#F472B6" className="animate-sparkle-delay" />
            <circle cx="25" cy="80" r="2" fill="#60A5FA" className="animate-sparkle" />
            <circle cx="190" cy="75" r="2.5" fill="#34D399" className="animate-sparkle-delay" />
            <circle cx="65" cy="18" r="2" fill="#A78BFA" className="animate-sparkle" />
            <circle cx="145" cy="15" r="2" fill="#FB923C" className="animate-sparkle-delay" />
          </>
        )}

        {mood === "thinking" && (
          <>
            <circle cx="165" cy="50" r="5" fill="#E2E8F0" opacity="0.7" className="animate-thought-1" />
            <circle cx="177" cy="38" r="7" fill="#E2E8F0" opacity="0.5" className="animate-thought-2" />
            <circle cx="185" cy="24" r="4" fill="#E2E8F0" opacity="0.3" className="animate-thought-3" />
          </>
        )}

        {mood === "hint" && (
          <>
            <circle cx="155" cy="45" r="3" fill="#FBBF24" className="animate-sparkle" />
            <circle cx="50" cy="40" r="2.5" fill="#60A5FA" className="animate-sparkle-delay" />
          </>
        )}
      </svg>
    </div>
  );
}
