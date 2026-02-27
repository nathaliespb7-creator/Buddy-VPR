import { motion, AnimatePresence } from "framer-motion";
import type { AnimationLevel } from "@/context/SettingsContext";

interface AnimationOnboardingDialogProps {
  visible: boolean;
  onChoose: (level: AnimationLevel) => void;
}

export function AnimationOnboardingDialog({ visible, onChoose }: AnimationOnboardingDialogProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-md rounded-2xl bg-background shadow-xl border border-border/80 p-4 sm:p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
              Настройка поощрений
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
              Как тебе нравится заниматься?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Можно изменить режим в любой момент в правом верхнем углу экрана.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => onChoose("full")}
                className="flex-1 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-left hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl" aria-hidden>
                    🎉
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-foreground">
                    Весело и ярко
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Конфетти, анимация Бадди и яркие награды.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onChoose("quiet")}
                className="flex-1 rounded-xl border border-border bg-muted/60 px-3 py-2.5 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl" aria-hidden>
                    🤫
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-foreground">
                    Тихо и спокойно
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Без вспышек и конфетти — только аккуратные подсказки.
                </p>
              </button>
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground">
              Режим можно поменять позже. По умолчанию — «Весело и ярко».
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

