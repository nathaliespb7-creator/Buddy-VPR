import { AnimatePresence, motion } from "framer-motion";
import { LevelIcon } from "@/components/LevelIcons";

interface LevelUpModalProps {
  visible: boolean;
  level: number;
  title: string;
  emoji: string;
  onClose: () => void;
}

export function LevelUpModal({ visible, level, title, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-full max-w-md rounded-3xl bg-gradient-to-br from-emerald-50 via-emerald-100 to-amber-50 dark:from-emerald-900 dark:via-emerald-950 dark:to-amber-900 border border-emerald-200/80 dark:border-emerald-700/80 shadow-xl px-4 sm:px-6 py-5 text-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="mx-auto mb-3 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/80 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-200"
            >
              <LevelIcon level={level} size="lg" />
            </motion.div>
            <p className="text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-200 uppercase mb-1">
              Новый уровень!
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 dark:text-emerald-50 mb-1">
              Уровень {level}
            </p>
            <p className="text-lg sm:text-xl font-semibold text-emerald-800 dark:text-emerald-100 mb-3">
              {title}
            </p>
            <p className="text-sm text-emerald-900/80 dark:text-emerald-100/80 mb-4">
              Бадди гордится тобой! Продолжай в том же духе — новые острова и звания уже ждут.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-semibold px-5 py-2 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
            >
              Вперёд за следующими звёздами!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

