import { cn } from "@/lib/utils";
import buddyImage from "@/assets/images/buddy-mascot.png";

export type MascotMood = "idle" | "happy" | "thinking" | "celebrating" | "encouraging" | "wrong" | "hint";

interface MascotProps {
  mood: MascotMood;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isSpeaking?: boolean;
  bookOpen?: boolean;
  noAnimation?: boolean;
}

export function Mascot({ mood, className, size = "md", isSpeaking = false, noAnimation = false }: MascotProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const bodyAnimation = (() => {
    switch (mood) {
      case "idle": return "animate-breathe";
      case "happy": return "animate-bounce-soft";
      case "thinking": return "animate-buddy-thinking";
      case "celebrating": return "buddy-celebrate-gentle";
      case "encouraging": return "animate-nod";
      case "wrong": return "buddy-emotion-wrong";
      case "hint": return "animate-buddy-surprise";
      default: return "animate-breathe";
    }
  })();

  const emotionOverlay = (() => {
    switch (mood) {
      case "happy":
      case "celebrating":
        return "buddy-glow-happy";
      case "wrong":
        return "buddy-glow-wrong";
      case "encouraging":
        return "buddy-glow-encourage";
      case "hint":
        return "buddy-glow-hint";
      default:
        return "";
    }
  })();

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        sizeClasses[size],
        !noAnimation && bodyAnimation,
        isSpeaking && "buddy-speaking-pulse",
        className
      )}
      data-testid="mascot"
    >
      <img
        src={buddyImage}
        alt="Бадди ВПР"
        className={cn("w-full h-full object-contain transition-all duration-300", emotionOverlay)}
        draggable={false}
      />
    </div>
  );
}
