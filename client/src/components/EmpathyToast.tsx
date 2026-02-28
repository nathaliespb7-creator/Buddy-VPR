import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EmpathyToastProps {
  message: string;
  type: "success" | "encouragement" | "hint";
  visible: boolean;
  onClose: () => void;
}

export function EmpathyToast({ message, type, visible, onClose }: EmpathyToastProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => onCloseRef.current(), 2500);
    return () => clearTimeout(timer);
  }, [visible]);

  const bgClass =
    type === "success"
      ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700"
      : type === "hint"
      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700"
      : "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-700";

  const textClass =
    type === "success"
      ? "text-emerald-800 dark:text-emerald-200"
      : type === "hint"
      ? "text-amber-800 dark:text-amber-200"
      : "text-sky-800 dark:text-sky-200";

  const icon = type === "success" ? "✓" : type === "hint" ? "?" : "!";
  const iconBg =
    type === "success"
      ? "bg-emerald-200 dark:bg-emerald-700 text-emerald-700 dark:text-emerald-200"
      : type === "hint"
      ? "bg-amber-200 dark:bg-amber-700 text-amber-700 dark:text-amber-200"
      : "bg-sky-200 dark:bg-sky-700 text-sky-700 dark:text-sky-200";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed left-0 right-0 mx-auto z-[60] w-[calc(100vw-2rem)] max-w-sm"
          style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          data-testid="empathy-toast"
          role="status"
          aria-live="polite"
        >
          <button
            type="button"
            onClick={() => onCloseRef.current()}
            className={`w-full flex items-center gap-2.5 rounded-xl border px-3 py-2.5 shadow-md text-left transition-opacity hover:opacity-90 active:opacity-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[44px] touch-manipulation ${bgClass}`}
            aria-label="Закрыть"
          >
            <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-sm font-bold ${iconBg}`}>
              {icon}
            </div>
            <p className={`text-sm font-medium leading-snug flex-1 ${textClass}`} data-testid="text-toast-message">
              {message}
            </p>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
