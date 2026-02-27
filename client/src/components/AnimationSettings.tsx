import { useSettings } from "@/context/SettingsContext";
import { cn } from "@/lib/utils";

interface AnimationSettingsProps {
  className?: string;
}

const OPTIONS = [
  { value: "full", label: "Весело и ярко", icon: "🎉" },
  { value: "quiet", label: "Тихо и спокойно", icon: "🤫" },
  { value: "minimal", label: "Минимум", icon: "➖" },
] as const;

export function AnimationSettings({ className }: AnimationSettingsProps) {
  const { animationLevel, setAnimationLevel } = useSettings();

  return (
    <div
      className={cn(
        "inline-flex flex-col items-end gap-1 rounded-xl bg-background/90 backdrop-blur px-2.5 py-2 border border-border/60 shadow-sm",
        "max-w-full",
        className
      )}
    >
      <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">
        Режим анимации
      </span>
      <div className="flex items-center gap-1">
        {OPTIONS.map(option => {
          const isActive = animationLevel === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setAnimationLevel(option.value)}
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-2 py-1 text-base sm:text-lg",
                "border border-transparent bg-muted/40 text-muted-foreground",
                "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1",
                "min-w-[2.25rem] min-h-[2.25rem]",
                isActive && "bg-primary/10 text-primary border-primary/60"
              )}
              aria-label={option.label}
            >
              <span aria-hidden>{option.icon}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

