import { Mascot } from "./Mascot";
import { Star } from "lucide-react";

interface HeaderProps {
  mascotMood: "idle" | "happy" | "thinking" | "celebrating" | "encouraging";
  stars: number;
}

export function Header({ mascotMood, stars }: HeaderProps) {
  return (
    <header className="w-full py-4 px-4 sm:px-6" data-testid="header">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Mascot mood={mascotMood} size="sm" />
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold tracking-tight"
              data-testid="text-app-title"
            >
              My Training Buddy
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="text-subtitle">
              Твой друг для подготовки к ВПР
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-1.5"
          data-testid="star-counter"
        >
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span className="text-base font-bold text-amber-700 dark:text-amber-300" data-testid="text-star-count">
            {stars}
          </span>
        </div>
      </div>
    </header>
  );
}
