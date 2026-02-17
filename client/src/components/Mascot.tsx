import { cn } from "@/lib/utils";
import buddyImage from "@assets/Снимок_экрана_2026-02-17_в_16.20.55_1771336673012.png";

export type MascotMood = "idle" | "happy" | "thinking" | "celebrating" | "encouraging" | "wrong" | "hint";

interface MascotProps {
  mood: MascotMood;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isSpeaking?: boolean;
  bookOpen?: boolean;
}

export function Mascot({ mood, className, size = "md", isSpeaking = false }: MascotProps) {
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
      case "celebrating": return "animate-celebrate";
      case "encouraging": return "animate-nod";
      case "wrong": return "animate-nod";
      case "hint": return "animate-buddy-surprise";
      default: return "animate-breathe";
    }
  })();

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        sizeClasses[size],
        bodyAnimation,
        isSpeaking && "buddy-mic-speaking",
        className
      )}
      data-testid="mascot"
    >
      <img
        src={buddyImage}
        alt="ВПР Бадди"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
}
