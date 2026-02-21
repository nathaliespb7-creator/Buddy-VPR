import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Shuffle, Compass } from "lucide-react";

interface ModeChoiceScreenProps {
  onIslands: () => void;
  onMixed: () => void;
  onDiagnostic?: () => void;
}

/** Экран выбора режима: три блока разного цвета, без маскота по центру. Понятно для ребёнка. */
export function ModeChoiceScreen({ onIslands, onMixed, onDiagnostic }: ModeChoiceScreenProps) {
  const cardClass =
    "w-full h-auto min-h-[48px] flex flex-row items-center gap-2.5 sm:gap-3 p-3 sm:p-3 text-left whitespace-normal rounded-xl touch-manipulation";
  const titleClass = "font-semibold block text-sm sm:text-base";
  const descClass = "text-xs text-muted-foreground break-words leading-snug line-clamp-2";

  return (
    <motion.div
      key="mode-choice"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-md mx-auto px-3 sm:px-4 max-w-[100vw] flex flex-col items-center flex-1 min-h-0 py-3 sm:py-4 pb-4 safe-bottom overflow-y-auto overflow-x-hidden"
      data-testid="mode-choice-screen"
    >
      <h2 className="text-lg sm:text-xl font-bold text-center mb-0.5" data-testid="mode-choice-title">
        Как хочешь заниматься?
      </h2>
      <p className="text-muted-foreground text-xs text-center mb-3 sm:mb-4">
        Выбери один из режимов
      </p>

      <div className="w-full space-y-2 sm:space-y-2.5 flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* Блок 1: острова — спокойный зелёный */}
        <Card className="overflow-hidden border-2 border-emerald-200 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/30 hover:border-emerald-400 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 transition-colors shrink-0">
          <CardContent className="p-0">
            <Button variant="ghost" className={cardClass + " hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20"} onClick={onIslands} data-testid="button-mode-islands">
              <div className="rounded-full bg-emerald-200/80 dark:bg-emerald-700/80 p-2 w-fit shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-emerald-300" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden flex flex-col gap-0.5">
                <span className={titleClass + " text-emerald-800 dark:text-emerald-200"}>По островам</span>
                <span className={descClass}>
                  Выбери остров, прорабатывай его и смотри динамику. В любой момент можно перейти на другой остров.
                </span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Блок 2: смешанный — дружелюбный синий/фиолетовый */}
        <Card className="overflow-hidden border-2 border-violet-200 dark:border-violet-700 bg-violet-50/80 dark:bg-violet-950/30 hover:border-violet-400 hover:bg-violet-100/80 dark:hover:bg-violet-900/40 transition-colors shrink-0">
          <CardContent className="p-0">
            <Button variant="ghost" className={cardClass + " hover:bg-violet-100/50 dark:hover:bg-violet-900/20"} onClick={onMixed} data-testid="button-mode-mixed">
              <div className="rounded-full bg-violet-200/80 dark:bg-violet-700/80 p-2 w-fit shrink-0">
                <Shuffle className="w-4 h-4 sm:w-5 sm:h-5 text-violet-700 dark:text-violet-300" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden flex flex-col gap-0.5">
                <span className={titleClass + " text-violet-800 dark:text-violet-200"}>Смешанный режим</span>
                <span className={descClass}>
                  Тренажёр сам выдаёт задания. Можно тренировать один навык или все сразу.
                </span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Блок 3: диагностика — тёплый янтарный (исследование) */}
        {onDiagnostic && (
          <Card className="overflow-hidden border-2 border-amber-200 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/30 hover:border-amber-400 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 transition-colors shrink-0">
            <CardContent className="p-0">
              <Button variant="ghost" className={cardClass + " hover:bg-amber-100/50 dark:hover:bg-amber-900/20"} onClick={onDiagnostic} data-testid="button-diagnostic">
                <div className="rounded-full bg-amber-200/80 dark:bg-amber-700/80 p-2 sm:p-2.5 w-fit shrink-0">
                  <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden flex flex-col gap-0.5">
                  <span className={titleClass + " font-bold text-amber-800 dark:text-amber-200"}>Пройди диагностику</span>
                  <span className={descClass}>
                    Узнай свои сильные стороны за несколько заданий по разным темам.
                  </span>
                </div>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
