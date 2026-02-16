import { cn } from "@/lib/utils";

type MascotMood = "idle" | "happy" | "thinking" | "celebrating" | "encouraging";

interface MascotProps {
  mood: MascotMood;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Mascot({ mood, className, size = "md" }: MascotProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", sizeClasses[size], className)}
      data-testid="mascot"
    >
      <svg
        viewBox="0 0 120 120"
        className={cn(
          "w-full h-full drop-shadow-lg",
          mood === "idle" && "animate-breathe",
          mood === "happy" && "animate-bounce-soft",
          mood === "thinking" && "animate-tilt",
          mood === "celebrating" && "animate-celebrate",
          mood === "encouraging" && "animate-nod"
        )}
      >
        <defs>
          <radialGradient id="bodyGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </radialGradient>
          <radialGradient id="cheekGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="60" cy="65" rx="42" ry="38" fill="url(#bodyGrad)" stroke="#34D399" strokeWidth="2" />

        <ellipse cx="60" cy="95" rx="30" ry="6" fill="#34D399" opacity="0.15" />

        {mood === "happy" || mood === "celebrating" ? (
          <>
            <ellipse cx="45" cy="55" rx="6" ry="7" fill="#1F2937" />
            <ellipse cx="75" cy="55" rx="6" ry="7" fill="#1F2937" />
            <ellipse cx="46" cy="53" rx="2.5" ry="2.5" fill="white" />
            <ellipse cx="76" cy="53" rx="2.5" ry="2.5" fill="white" />
          </>
        ) : mood === "thinking" ? (
          <>
            <ellipse cx="45" cy="55" rx="6" ry="7" fill="#1F2937" />
            <ellipse cx="75" cy="58" rx="6" ry="5" fill="#1F2937" />
            <ellipse cx="46" cy="53" rx="2.5" ry="2.5" fill="white" />
            <ellipse cx="76" cy="56" rx="2.5" ry="2.5" fill="white" />
          </>
        ) : (
          <>
            <ellipse cx="45" cy="55" rx="5.5" ry="6.5" fill="#1F2937" />
            <ellipse cx="75" cy="55" rx="5.5" ry="6.5" fill="#1F2937" />
            <ellipse cx="46" cy="53" rx="2" ry="2" fill="white" />
            <ellipse cx="76" cy="53" rx="2" ry="2" fill="white" />
          </>
        )}

        <circle cx="33" cy="65" r="8" fill="url(#cheekGrad)" />
        <circle cx="87" cy="65" r="8" fill="url(#cheekGrad)" />

        {mood === "happy" || mood === "celebrating" ? (
          <path d="M 48 72 Q 60 84 72 72" fill="none" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
        ) : mood === "encouraging" ? (
          <path d="M 48 74 Q 60 80 72 74" fill="none" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
        ) : mood === "thinking" ? (
          <ellipse cx="62" cy="75" rx="5" ry="4" fill="#1F2937" opacity="0.7" />
        ) : (
          <path d="M 50 73 Q 60 78 70 73" fill="none" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
        )}

        {mood === "celebrating" && (
          <>
            <circle cx="25" cy="30" r="3" fill="#FBBF24" className="animate-sparkle" />
            <circle cx="95" cy="25" r="2.5" fill="#F472B6" className="animate-sparkle-delay" />
            <circle cx="15" cy="50" r="2" fill="#60A5FA" className="animate-sparkle" />
            <circle cx="105" cy="45" r="2.5" fill="#34D399" className="animate-sparkle-delay" />
            <circle cx="55" cy="15" r="2" fill="#A78BFA" className="animate-sparkle" />
          </>
        )}

        {mood === "thinking" && (
          <>
            <circle cx="98" cy="35" r="4" fill="#E5E7EB" opacity="0.7" />
            <circle cx="105" cy="25" r="6" fill="#E5E7EB" opacity="0.5" />
            <circle cx="108" cy="13" r="3" fill="#E5E7EB" opacity="0.3" />
          </>
        )}

        <ellipse cx="30" cy="50" rx="8" ry="5" fill="#6EE7B7" transform="rotate(-20, 30, 50)" />
        <ellipse cx="90" cy="50" rx="8" ry="5" fill="#6EE7B7" transform="rotate(20, 90, 50)" />
      </svg>
    </div>
  );
}
