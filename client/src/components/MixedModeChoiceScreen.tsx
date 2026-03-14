import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Shuffle, Target } from "lucide-react";

interface MixedModeChoiceScreenProps {
  onAll: () => void;
  onOneSkill: (category: string) => void;
  onBack: () => void;
  /** Ключи категорий (островов) для текущего предмета */
  categoryKeys: string[];
  /** Подписи категорий для UI */
  categoryLabels: Record<string, string>;
}

/** В смешанном режиме: один навык или все сразу */
export function MixedModeChoiceScreen({ onAll, onOneSkill, onBack, categoryKeys, categoryLabels }: MixedModeChoiceScreenProps) {
  return (
    <motion.div
      key="mixed-mode-choice"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-md mx-auto px-3 sm:px-4 max-w-[100vw] flex flex-col items-center overflow-x-hidden safe-bottom pb-6"
      data-testid="mixed-mode-choice-screen"
    >
      <Button
        variant="ghost"
        size="sm"
        className="self-start -ml-2 mb-2 gap-1 text-muted-foreground min-h-[48px] touch-manipulation"
        onClick={onBack}
        data-testid="button-mixed-back"
      >
        <ChevronLeft className="w-4 h-4" />
        Назад
      </Button>

      <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 text-foreground" data-testid="mixed-mode-choice-title">
        Тренируем один навык или все сразу?
      </h2>
      <p className="text-muted-foreground text-sm text-center mb-6">
        Выбери, как тренажёр будет выдавать задания
      </p>

      <div className="w-full space-y-3">
        <Card className="overflow-visible border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto min-h-[48px] flex items-center gap-3 p-3 sm:p-4 text-left whitespace-normal rounded-xl touch-manipulation"
              onClick={onAll}
              data-testid="button-mixed-all"
            >
              <div className="rounded-full bg-primary/10 p-3 shrink-0">
                <Shuffle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0 text-foreground">
                <span className="font-semibold block">Все сразу</span>
                <span className="text-sm text-muted-foreground block leading-snug mt-0.5">
                  Задания из всех островов вперемешку
                </span>
              </div>
            </Button>
          </CardContent>
        </Card>

        <p className="text-sm font-medium text-muted-foreground pt-2">или один навык:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categoryKeys.map((key) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className="h-auto min-h-[48px] py-3 px-3 text-xs sm:text-sm text-left justify-start whitespace-normal leading-snug rounded-xl"
              onClick={() => onOneSkill(key)}
              data-testid={`button-skill-${key}`}
            >
              <span className="flex items-center gap-1.5 w-full">
                <Target className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 min-w-0">{categoryLabels[key] ?? key}</span>
              </span>
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
