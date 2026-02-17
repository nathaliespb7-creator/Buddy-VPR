import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import type { Rule } from "@/lib/taskData";
import { cn } from "@/lib/utils";

interface RuleCardProps {
  rule: Rule;
  visible: boolean;
}

const categoryGradients: Record<string, string> = {
  accent: "from-violet-50 to-violet-100/50 dark:from-violet-950/40 dark:to-violet-900/20 border-violet-200 dark:border-violet-800",
  phonetics: "from-sky-50 to-sky-100/50 dark:from-sky-950/40 dark:to-sky-900/20 border-sky-200 dark:border-sky-800",
  meaning: "from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-800",
  morphemics: "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800",
  morphology: "from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-rose-900/20 border-rose-200 dark:border-rose-800",
  syntax: "from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/20 border-indigo-200 dark:border-indigo-800",
};

const categoryIconColors: Record<string, string> = {
  accent: "text-violet-500 dark:text-violet-400",
  phonetics: "text-sky-500 dark:text-sky-400",
  meaning: "text-amber-500 dark:text-amber-400",
  morphemics: "text-emerald-500 dark:text-emerald-400",
  morphology: "text-rose-500 dark:text-rose-400",
  syntax: "text-indigo-500 dark:text-indigo-400",
};

const categoryTextColors: Record<string, string> = {
  accent: "text-violet-800 dark:text-violet-200",
  phonetics: "text-sky-800 dark:text-sky-200",
  meaning: "text-amber-800 dark:text-amber-200",
  morphemics: "text-emerald-800 dark:text-emerald-200",
  morphology: "text-rose-800 dark:text-rose-200",
  syntax: "text-indigo-800 dark:text-indigo-200",
};

export function RuleCard({ rule, visible }: RuleCardProps) {
  if (!visible) return null;

  const gradient = categoryGradients[rule.category] || categoryGradients.accent;
  const iconColor = categoryIconColors[rule.category] || categoryIconColors.accent;
  const textColor = categoryTextColors[rule.category] || categoryTextColors.accent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "rounded-xl border bg-gradient-to-br p-4",
        gradient
      )}
      data-testid="rule-card"
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/60 dark:bg-white/10 shrink-0">
          <BookOpen className={cn("w-5 h-5", iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className={cn("w-3.5 h-3.5", iconColor)} />
            <p className={cn("text-xs font-bold uppercase tracking-wide", textColor)} data-testid="text-rule-topic">
              {rule.topic}
            </p>
          </div>
          <p className={cn("text-sm font-medium leading-relaxed", textColor)} data-testid="text-rule-hint">
            {rule.magicHint}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
