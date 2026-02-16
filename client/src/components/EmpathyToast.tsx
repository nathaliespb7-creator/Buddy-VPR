import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "./Mascot";

interface EmpathyToastProps {
  message: string;
  type: "success" | "encouragement" | "hint";
  visible: boolean;
  onClose: () => void;
}

export function EmpathyToast({ message, type, visible, onClose }: EmpathyToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 4000);
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

  const mood = type === "success" ? "celebrating" : type === "hint" ? "thinking" : "encouraging";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md"
          data-testid="empathy-toast"
        >
          <div
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-lg ${bgClass}`}
          >
            <Mascot mood={mood} size="sm" />
            <p className={`text-sm font-medium leading-snug ${textClass}`} data-testid="text-toast-message">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
