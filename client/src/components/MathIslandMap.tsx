/**
 * Карта островов математики ВПР 4 класс (5 островов по ФИОКО).
 * По клику — переход на /play/math/:islandId.
 */

import { useLocation } from "wouter";
import { mathVprGrade4Config } from "@/data/mathVprGrade4";
import { cn } from "@/lib/utils";

export function MathIslandMap() {
  const [, setLocation] = useLocation();

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground mb-1">
        Острова математики ВПР 4 класс
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Выбери остров для тренировки
      </p>

      <div className="flex flex-col gap-3">
        {mathVprGrade4Config.islands.map((island) => (
            <button
              key={island.id}
              type="button"
              onClick={() => setLocation(`/play/math/${island.id}`)}
              className={cn(
                "w-full text-left rounded-2xl border-2 p-4 min-h-[48px] transition-all",
                "hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              style={{
                borderColor: island.color,
                backgroundColor: `${island.color}15`,
              }}
              data-testid={`button-math-island-${island.id}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl shrink-0" aria-hidden>
                  {island.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-foreground">{island.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Задания: {island.tasks.join(", ")} · {island.description}
                  </div>
                </div>
              </div>
            </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Макс. баллов за работу: {mathVprGrade4Config.max_score}
      </p>
    </div>
  );
}
