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

  const getMouthPath = () => {
    switch (mood) {
      case "happy":
      case "celebrating":
        return "M 85 118 Q 100 132 115 118";
      case "encouraging":
        return "M 87 118 Q 100 126 113 118";
      case "thinking":
        return "M 93 120 Q 100 118 107 120";
      default:
        return "M 90 118 Q 100 124 110 118";
    }
  };

  const getEyeStyle = () => {
    if (mood === "happy" || mood === "celebrating") {
      return { leftRy: 3, rightRy: 3, squint: true };
    }
    if (mood === "thinking") {
      return { leftRy: 6, rightRy: 4, squint: false };
    }
    return { leftRy: 6, rightRy: 6, squint: false };
  };

  const eyes = getEyeStyle();

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", sizeClasses[size], className)}
      data-testid="mascot"
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
      >
        <ellipse cx="100" cy="178" rx="38" ry="8" fill="#CBD5E1" opacity="0.5" />

        <g className={cn(
          "buddy-body",
          mood === "idle" && "animate-breathe",
          mood === "happy" && "animate-bounce-soft",
          mood === "thinking" && "animate-tilt",
          mood === "celebrating" && "animate-celebrate",
          mood === "encouraging" && "animate-nod"
        )}>
          <rect x="50" y="45" width="100" height="115" rx="50" fill="#BEE3F8" stroke="#63B3ED" strokeWidth="3.5" />

          <circle cx="100" cy="35" r="6" fill="#63B3ED" />
          <rect x="97" y="28" width="6" height="10" rx="3" fill="#63B3ED" />
          {mood === "celebrating" && (
            <circle cx="100" cy="25" r="4" fill="#FBBF24" className="animate-sparkle" />
          )}

          <rect x="38" y="85" width="14" height="8" rx="4" fill="#90CDF4" stroke="#63B3ED" strokeWidth="2" />
          <rect x="148" y="85" width="14" height="8" rx="4" fill="#90CDF4" stroke="#63B3ED" strokeWidth="2" />

          <rect x="65" y="72" width="70" height="52" rx="18" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />

          <g className="buddy-eyes">
            {eyes.squint ? (
              <>
                <path d="M 78 95 Q 85 88 92 95" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 108 95 Q 115 88 122 95" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <ellipse cx="85" cy="95" rx="6" ry={eyes.leftRy} fill="#2D3748" />
                <ellipse cx="115" cy="95" rx="6" ry={eyes.rightRy} fill="#2D3748" />
                <circle cx="87" cy="93" r="2" fill="white" opacity="0.8" />
                <circle cx="117" cy="93" r="2" fill="white" opacity="0.8" />
              </>
            )}
          </g>

          <path
            d={getMouthPath()}
            stroke="#2D3748"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {mood === "happy" && (
            <>
              <circle cx="72" cy="102" r="5" fill="#FBBF24" opacity="0.2" />
              <circle cx="128" cy="102" r="5" fill="#FBBF24" opacity="0.2" />
            </>
          )}
        </g>

        {mood === "celebrating" && (
          <>
            <circle cx="25" cy="30" r="3" fill="#FBBF24" className="animate-sparkle" />
            <circle cx="175" cy="25" r="2.5" fill="#F472B6" className="animate-sparkle-delay" />
            <circle cx="20" cy="70" r="2" fill="#60A5FA" className="animate-sparkle" />
            <circle cx="180" cy="65" r="2.5" fill="#34D399" className="animate-sparkle-delay" />
            <circle cx="60" cy="15" r="2" fill="#A78BFA" className="animate-sparkle" />
            <circle cx="140" cy="12" r="2" fill="#FB923C" className="animate-sparkle-delay" />
          </>
        )}

        {mood === "thinking" && (
          <>
            <circle cx="160" cy="50" r="5" fill="#E2E8F0" opacity="0.7" />
            <circle cx="172" cy="38" r="7" fill="#E2E8F0" opacity="0.5" />
            <circle cx="178" cy="22" r="4" fill="#E2E8F0" opacity="0.3" />
          </>
        )}
      </svg>
    </div>
  );
}
