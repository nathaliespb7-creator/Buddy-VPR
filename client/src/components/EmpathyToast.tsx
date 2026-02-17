import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EmpathyToastProps {
  message: string;
  type: "success" | "encouragement" | "hint";
  visible: boolean;
  onClose: () => void;
}

export function EmpathyToast({ message, type, visible, onClose }: EmpathyToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

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
          className="fixed bottom-6 left-0 right-0 mx-auto z-[60] w-[80vw] max-w-sm pointer-events-none"
          data-testid="empathy-toast"
        >
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 shadow-md ${bgClass}`}
          >
            <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-sm font-bold ${iconBg}`}>
              {icon}
            </div>
            <p className={`text-sm font-medium leading-snug ${textClass}`} data-testid="text-toast-message">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
