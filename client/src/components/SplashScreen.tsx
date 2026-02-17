import { useState } from "react";
import { motion } from "framer-motion";
import { Mascot } from "./Mascot";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [ready, setReady] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-sky-50 dark:from-emerald-950 dark:via-background dark:to-sky-950 px-6"
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
        onAnimationComplete={() => setReady(true)}
        className="mb-6"
      >
        <Mascot mood="happy" size="xl" className="w-56 h-56 sm:w-64 sm:h-64" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-4xl sm:text-5xl font-bold tracking-tight mb-2 text-center"
        data-testid="text-splash-title"
      >
        Бадди ВПР
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-muted-foreground text-base sm:text-lg mb-10 text-center"
        data-testid="text-splash-subtitle"
      >
        Умный помощник для подготовки к ВПР
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 18 }}
      >
        <Button
          onClick={onFinish}
          size="lg"
          className="gap-2 text-lg px-8 bg-primary text-primary-foreground"
          data-testid="button-start"
        >
          Начать
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
