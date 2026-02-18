import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award } from "lucide-react";

interface LevelUpOverlayProps {
  visible: boolean;
  onNext: () => void;
}

export function LevelUpOverlay({ visible, onNext }: LevelUpOverlayProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onNext, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onNext]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onNext}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 cursor-pointer"
          data-testid="level-up-overlay"
        >
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px 5px rgba(251,191,36,0.3)",
                  "0 0 50px 15px rgba(251,191,36,0.5)",
                  "0 0 20px 5px rgba(251,191,36,0.3)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center"
            >
              <Award className="w-12 h-12 text-white drop-shadow-lg" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white drop-shadow-lg text-center"
              data-testid="text-level-up"
            >
              5 звёзд собрано!
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
