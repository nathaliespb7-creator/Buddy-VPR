import { Mascot } from "./Mascot";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/speechSynthesis";

interface HeaderProps {
  mascotMood: "idle" | "happy" | "thinking" | "celebrating" | "encouraging";
}

export function Header({ mascotMood }: HeaderProps) {
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => speak("Привет! Я твой друг для учёбы. Давай заниматься вместе!")}
          data-testid="button-header-voice"
          aria-label="Приветствие"
        >
          <Volume2 className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
