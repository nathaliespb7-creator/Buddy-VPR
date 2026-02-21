import { motion } from "framer-motion";
import { Mascot } from "./Mascot";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-sky-50 dark:from-emerald-950 dark:via-background dark:to-sky-950 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      data-testid="splash-screen"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="mb-6"
      >
        <Mascot mood="idle" size="xl" className="w-56 h-56 sm:w-64 sm:h-64" noAnimation />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
        className="text-4xl sm:text-5xl font-bold tracking-tight mb-2 text-center"
        data-testid="text-splash-title"
      >
        Бадди ВПР
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
        className="text-muted-foreground text-base sm:text-lg mb-6 text-center"
        data-testid="text-splash-subtitle"
      >
        Умный помощник для подготовки
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
        className="mb-8"
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

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
        className="flex items-center gap-2 text-muted-foreground"
        data-testid="text-social-proof"
      >
        <Users className="w-4 h-4" />
        <p className="text-sm">
          Уже более 5 000 учеников готовятся со мной
        </p>
      </motion.div>
    </motion.div>
  );
}
