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
    const maxShift = 2.5;
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
          <radialGradient id="buddy-body-grad" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#E0F7E9" />
            <stop offset="40%" stopColor="#C5EDCF" />
            <stop offset="100%" stopColor="#9EDCB0" />
          </radialGradient>
          <radialGradient id="buddy-body-shine" cx="35%" cy="25%" r="30%">
            <stop offset="0%" stopColor="white" stopOpacity="0.25" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="buddy-cheek-l" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFCBAD" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFCBAD" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="buddy-cheek-r" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFCBAD" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFCBAD" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="book-cover" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F2994A" />
            <stop offset="100%" stopColor="#E07B30" />
          </linearGradient>
          <linearGradient id="book-pages" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFDF5" />
            <stop offset="100%" stopColor="#FFEFD5" />
          </linearGradient>
          <linearGradient id="earcup-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B0BEC5" />
            <stop offset="50%" stopColor="#90A4AE" />
            <stop offset="100%" stopColor="#78909C" />
          </linearGradient>
          <linearGradient id="earcup-shine" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        <ellipse cx="100" cy="185" rx="38" ry="5" fill="#94A3B8" opacity="0.12" />

        <g className={cn("buddy-body", bodyAnimation)}>
          <circle cx="100" cy="100" r="62" fill="url(#buddy-body-grad)" />
          <circle cx="100" cy="100" r="62" fill="url(#buddy-body-shine)" />

          <path
            d="M 38 78 Q 42 38 100 28 Q 158 38 162 78"
            fill="none"
            stroke="#546E7A"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          <ellipse cx="38" cy="85" rx="11" ry="13" fill="url(#earcup-grad)" />
          <ellipse cx="38" cy="85" rx="11" ry="13" fill="url(#earcup-shine)" />
          <ellipse cx="38" cy="85" rx="9" ry="11" fill="none" stroke="#607D8B" strokeWidth="1" opacity="0.4" />
          <ellipse cx="36" cy="82" rx="4" ry="5" fill="white" opacity="0.15" />

          <ellipse cx="162" cy="85" rx="11" ry="13" fill="url(#earcup-grad)" />
          <ellipse cx="162" cy="85" rx="11" ry="13" fill="url(#earcup-shine)" />
          <ellipse cx="162" cy="85" rx="9" ry="11" fill="none" stroke="#607D8B" strokeWidth="1" opacity="0.4" />
          <ellipse cx="160" cy="82" rx="4" ry="5" fill="white" opacity="0.15" />

          <g className={isSpeaking ? "buddy-mic-speaking" : ""}>
            <path
              d="M 35 96 Q 30 112 28 128 Q 27 135 32 138"
              fill="none"
              stroke="#546E7A"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="33" cy="140" r="5.5" fill="#546E7A" />
            <circle cx="33" cy="140" r="3.5" fill="#78909C" />
            <circle cx="32" cy="139" r="1.5" fill="white" opacity="0.2" />
          </g>

          <g className={eyeBlinkClass}>
            {eyes.squint ? (
              <>
                <path d="M 72 106 Q 82 96 92 106" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 108 106 Q 118 96 128 106" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            ) : eyes.surprised ? (
              <>
                <circle cx={82} cy={103} r="13" fill="white" />
                <circle cx={82 + pupilOffset.x} cy={103 + pupilOffset.y} r="8" fill="#2D3748" />
                <circle cx={79 + pupilOffset.x * 0.3} cy={99 + pupilOffset.y * 0.3} r="3.5" fill="white" />
                <circle cx={85 + pupilOffset.x * 0.3} cy={105 + pupilOffset.y * 0.3} r="1.5" fill="white" opacity="0.6" />

                <circle cx={118} cy={103} r="13" fill="white" />
                <circle cx={118 + pupilOffset.x} cy={103 + pupilOffset.y} r="8" fill="#2D3748" />
                <circle cx={115 + pupilOffset.x * 0.3} cy={99 + pupilOffset.y * 0.3} r="3.5" fill="white" />
                <circle cx={121 + pupilOffset.x * 0.3} cy={105 + pupilOffset.y * 0.3} r="1.5" fill="white" opacity="0.6" />
              </>
            ) : (
              <>
                <circle cx={82} cy={103} r={eyes.wide ? 14 : 12} fill="white" />
                <circle cx={82 + pupilOffset.x} cy={103 + pupilOffset.y} r={eyes.wide ? 8 : 7} fill="#2D3748" />
                <circle cx={79 + pupilOffset.x * 0.3} cy={99 + pupilOffset.y * 0.3} r="3" fill="white" />
                <circle cx={85 + pupilOffset.x * 0.3} cy={105 + pupilOffset.y * 0.3} r="1.5" fill="white" opacity="0.5" />

                <circle cx={118} cy={103} r={eyes.wide ? 14 : 12} fill="white" />
                <circle cx={118 + pupilOffset.x} cy={103 + pupilOffset.y} r={eyes.wide ? 8 : 7} fill="#2D3748" />
                <circle cx={115 + pupilOffset.x * 0.3} cy={99 + pupilOffset.y * 0.3} r="3" fill="white" />
                <circle cx={121 + pupilOffset.x * 0.3} cy={105 + pupilOffset.y * 0.3} r="1.5" fill="white" opacity="0.5" />
              </>
            )}
          </g>

          <circle cx="65" cy="116" r="8" fill="url(#buddy-cheek-l)" />
          <circle cx="135" cy="116" r="8" fill="url(#buddy-cheek-r)" />

          {mouthType === "surprised" && (
            <ellipse cx="100" cy="126" rx="4" ry="5" fill="#2D3748" opacity="0.8" />
          )}
          {mouthType === "happy" && (
            <path d="M 88 122 Q 100 136 112 122" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
          {mouthType === "flat" && (
            <path d="M 90 126 L 110 126" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
          {mouthType === "smile" && (
            <path d="M 90 123 Q 100 132 110 123" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
          {mouthType === "thinking" && (
            <path d="M 94 127 Q 100 124 106 127" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
          {mouthType === "default" && (
            <path d="M 91 123 Q 102 131 111 124" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}

          <g
            className="buddy-book-hand"
            style={{
              transformOrigin: "158px 145px",
              transform: `rotate(${bookAngle}deg)`,
              transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <circle cx="150" cy="142" r="6" fill="#9EDCB0" stroke="#8BCFA0" strokeWidth="1" opacity="0.8" />

            <rect x="150" y="128" width="30" height="36" rx="3" fill="url(#book-cover)" />
            <rect x="151" y="129" width="3" height="34" rx="1" fill="#D4824A" />

            <path
              d={bookOpen
                ? "M 155 130 L 179 128 L 179 162 L 155 164 Z"
                : "M 155 130 L 178 130 L 178 163 L 155 163 Z"
              }
              fill="url(#book-pages)"
              stroke="#E0D5C0"
              strokeWidth="0.5"
              style={{ transition: "d 0.5s ease" }}
            />

            {bookOpen && (
              <>
                <line x1="159" y1="136" x2="175" y2="135" stroke="#C8B89A" strokeWidth="0.7" opacity="0.5" />
                <line x1="159" y1="141" x2="175" y2="140" stroke="#C8B89A" strokeWidth="0.7" opacity="0.5" />
                <line x1="159" y1="146" x2="175" y2="145" stroke="#C8B89A" strokeWidth="0.7" opacity="0.5" />
                <line x1="159" y1="151" x2="172" y2="150" stroke="#C8B89A" strokeWidth="0.7" opacity="0.4" />
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
