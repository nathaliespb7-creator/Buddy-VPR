import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mascot } from "./Mascot";
import { Rocket } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="w-full max-w-lg mx-auto px-4 sm:px-6"
    >
      <Card className="overflow-visible" data-testid="welcome-card">
        <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Mascot mood="happy" size="lg" />
          </motion.div>

          <h2
            className="text-2xl sm:text-3xl font-bold mt-4 mb-2"
            data-testid="text-welcome-title"
          >
            Привет, дружок!
          </h2>
          <p
            className="text-muted-foreground mb-6 max-w-sm leading-relaxed"
            data-testid="text-welcome-description"
          >
            Я — твой друг для учёбы. Давай вместе подготовимся к ВПР! Сначала пройдём маленькую
            разведывательную миссию, чтобы я узнал, что ты уже знаешь.
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              onClick={onStart}
              className="w-full gap-2 text-base py-6"
              size="lg"
              data-testid="button-start-mission"
            >
              <Rocket className="w-5 h-5" />
              Начать миссию!
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
