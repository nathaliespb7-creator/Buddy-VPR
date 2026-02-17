import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Mascot } from "./Mascot";
import { Cat, Bot, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export type AvatarChoice = "cat" | "robot" | "astronaut";

interface AvatarPickerProps {
  onSelect: (avatar: AvatarChoice) => void;
}

const avatars: { key: AvatarChoice; label: string; icon: typeof Cat; gradient: string; iconColor: string }[] = [
  {
    key: "cat",
    label: "Котик",
    icon: Cat,
    gradient: "from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "robot",
    label: "Робот",
    icon: Bot,
    gradient: "from-sky-100 to-indigo-100 dark:from-sky-900/30 dark:to-indigo-900/30",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    key: "astronaut",
    label: "Космонавт",
    icon: Rocket,
    gradient: "from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
];

export function AvatarPicker({ onSelect }: AvatarPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="w-full max-w-lg mx-auto px-4 sm:px-6"
      data-testid="avatar-picker"
    >
      <div className="flex flex-col items-center text-center mb-6">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <Mascot mood="happy" size="lg" bookOpen />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="relative mt-3 mb-3 max-w-xs mx-auto bg-white dark:bg-card border border-border rounded-xl px-4 py-3 shadow-sm"
          data-testid="buddy-greeting-bubble"
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-card border-l border-t border-border rotate-45" />
          <p className="relative text-sm sm:text-base leading-relaxed font-medium" data-testid="text-buddy-greeting">
            Привет! Я Бадди. Я уже открыл свою книгу на нужной странице. Погнали за звёздами?
          </p>
        </motion.div>

        <h2
          className="text-2xl sm:text-3xl font-bold mt-2 mb-2"
          data-testid="text-avatar-title"
        >
          Выбери героя!
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4" data-testid="avatar-grid">
        {avatars.map((av, i) => {
          const Icon = av.icon;
          return (
            <motion.div
              key={av.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <button
                onClick={() => onSelect(av.key)}
                className={cn(
                  "w-full flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-gradient-to-b p-5 sm:p-6",
                  "transition-all hover-elevate active-elevate-2",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  av.gradient
                )}
                data-testid={`button-avatar-${av.key}`}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background/60 flex items-center justify-center">
                  <Icon className={cn("w-9 h-9 sm:w-11 sm:h-11", av.iconColor)} />
                </div>
                <span className="text-sm sm:text-base font-bold">{av.label}</span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
