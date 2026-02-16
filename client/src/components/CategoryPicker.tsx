import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen, Star, Layers } from "lucide-react";
import { Mascot } from "./Mascot";

interface CategoryPickerProps {
  onSelect: (category: string) => void;
}

const categories = [
  {
    key: "all",
    label: "Все задания",
    description: "Смешанные задания из всех тем",
    icon: Layers,
    color: "bg-primary/10 text-primary",
  },
  {
    key: "accent",
    label: "Ударения",
    description: "Научись правильно ставить ударения",
    icon: Zap,
    color: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
  },
  {
    key: "phonetics",
    label: "Звуки и буквы",
    description: "Узнай, чем звуки отличаются от букв",
    icon: BookOpen,
    color: "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
  },
  {
    key: "meaning",
    label: "Смысл и пословицы",
    description: "Разгадывай мудрость народных пословиц",
    icon: Star,
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  },
];

export function CategoryPicker({ onSelect }: CategoryPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="w-full max-w-2xl mx-auto px-4 sm:px-6"
    >
      <Card className="overflow-visible" data-testid="category-picker">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-center gap-3 mb-5">
            <Mascot mood="happy" size="sm" />
            <div>
              <h2 className="text-xl font-bold" data-testid="text-category-title">
                Выбери тему!
              </h2>
              <p className="text-sm text-muted-foreground">
                Разведка пройдена! Теперь выбери, что хочешь потренировать.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2" data-testid="category-grid">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <button
                    onClick={() => {
                      onSelect(cat.key);
                    }}
                    className="w-full text-left rounded-xl border-2 border-border bg-background px-4 py-4 transition-all hover-elevate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    data-testid={`button-category-${cat.key}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${cat.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-0.5">{cat.label}</p>
                        <p className="text-xs text-muted-foreground leading-snug">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
