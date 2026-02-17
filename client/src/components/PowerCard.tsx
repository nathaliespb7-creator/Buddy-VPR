import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mascot } from "./Mascot";
import { ArrowRight, Zap, BookOpen, Star, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface PowerCardProps {
  categoryScores: Record<string, { correct: number; total: number }>;
  onContinue: () => void;
}

const categories = [
  {
    key: "accent",
    label: "Ударения",
    icon: Zap,
    barColor: "bg-violet-400 dark:bg-violet-500",
    bgColor: "bg-violet-100/50 dark:bg-violet-900/20",
  },
  {
    key: "phonetics",
    label: "Звуки и буквы",
    icon: BookOpen,
    barColor: "bg-sky-400 dark:bg-sky-500",
    bgColor: "bg-sky-100/50 dark:bg-sky-900/20",
  },
  {
    key: "meaning",
    label: "Смысл",
    icon: Star,
    barColor: "bg-amber-400 dark:bg-amber-500",
    bgColor: "bg-amber-100/50 dark:bg-amber-900/20",
  },
];

export function PowerCard({ categoryScores, onContinue }: PowerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="w-full max-w-lg mx-auto px-4 sm:px-6"
      data-testid="power-card"
    >
      <Card className="overflow-visible">
        <CardContent className="pt-6 pb-5">
          <div className="flex flex-col items-center text-center mb-5">
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              <Mascot mood="celebrating" size="md" />
            </motion.div>
            <div className="flex items-center gap-2 mt-3">
              <Shield className="w-6 h-6 text-primary" />
              <h2
                className="text-xl sm:text-2xl font-bold"
                data-testid="text-power-card-title"
              >
                Твоя карта силы
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Разведка пройдена, напарник! Вот что мы узнали:
            </p>
          </div>

          <div className="space-y-3 mb-6" data-testid="power-scores">
            {categories.map((cat, i) => {
              const score = categoryScores[cat.key] || { correct: 0, total: 1 };
              const percent = Math.round((score.correct / score.total) * 100);
              const Icon = cat.icon;

              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className={cn("rounded-xl px-4 py-3", cat.bgColor)}
                  data-testid={`power-score-${cat.key}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">{cat.label}</span>
                    </div>
                    <span className="text-sm font-bold" data-testid={`text-power-percent-${cat.key}`}>
                      {percent}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.15, ease: "easeOut" }}
                      className={cn("h-full rounded-full", cat.barColor)}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex justify-center"
          >
            <Button
              onClick={onContinue}
              size="lg"
              className="gap-2 text-base"
              data-testid="button-power-card-continue"
            >
              К карте знаний
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
