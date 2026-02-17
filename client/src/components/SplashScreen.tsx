import { motion } from "framer-motion";
import { Mascot } from "./Mascot";
import { Shield, CheckCircle } from "lucide-react";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-sky-50 dark:from-emerald-950 dark:via-background dark:to-sky-950"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="splash-screen"
    >
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="mb-4"
      >
        <Mascot mood="happy" size="xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-2 mb-2"
      >
        <Shield className="w-7 h-7 text-primary" />
        <CheckCircle className="w-5 h-5 text-primary -ml-3 mt-3" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-3xl sm:text-4xl font-bold tracking-tight mb-1"
        data-testid="text-splash-title"
      >
        ВПР Бадди
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="text-muted-foreground text-sm sm:text-base mb-8"
        data-testid="text-splash-subtitle"
      >
        Твой напарник для подготовки к ВПР
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col items-center gap-3"
      >
        <motion.div
          className="w-32 h-1.5 rounded-full bg-muted overflow-hidden"
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
            onAnimationComplete={onFinish}
          />
        </motion.div>
        <p className="text-xs text-muted-foreground">
          Готовлю задания...
        </p>
      </motion.div>
    </motion.div>
  );
}
