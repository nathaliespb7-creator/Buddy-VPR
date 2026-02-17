import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Award, ArrowRight } from "lucide-react";

interface LevelUpOverlayProps {
  visible: boolean;
  onNext: () => void;
}

export function LevelUpOverlay({ visible, onNext }: LevelUpOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          data-testid="level-up-overlay"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px 5px rgba(251,191,36,0.3)",
                  "0 0 60px 20px rgba(251,191,36,0.5)",
                  "0 0 20px 5px rgba(251,191,36,0.3)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center"
            >
              <Award className="w-16 h-16 text-white drop-shadow-lg" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-white drop-shadow-lg text-center"
              data-testid="text-level-up"
            >
              Отлично!
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-lg text-amber-200 text-center"
            >
              5 звёзд собрано!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Button
                onClick={onNext}
                size="lg"
                className="gap-2 text-base bg-amber-500 border-amber-600 text-white"
                data-testid="button-level-up-next"
              >
                Вперёд!
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
