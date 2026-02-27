/**
 * Иконки уровней в стиле Бадди: округлые, дружелюбные, в палитре приложения.
 * Цвета: primary (мятный), secondary (фиолетовый), accent (янтарный).
 */
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

const iconClass = "w-full h-full";

/** Уровень 1 — Искатель: росток (первые шаги, поиск знаний) */
function IconSeeker({ className }: { className?: string }) {
  return (
    <svg className={cn(iconClass, className)} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <ellipse cx="16" cy="26" rx="4" ry="2" fill="currentColor" className="text-emerald-700 dark:text-emerald-500" />
      <path
        d="M16 24V12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-emerald-600 dark:text-emerald-400"
      />
      <path
        d="M16 12c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"
        fill="currentColor"
        className="text-emerald-500 dark:text-emerald-300"
      />
      <path
        d="M14 14l2-4 2 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-emerald-600 dark:text-emerald-400"
      />
    </svg>
  );
}

/** Уровень 2 — Следопыт: компас (путь, исследование) */
function IconPathfinder({ className }: { className?: string }) {
  return (
    <svg className={cn(iconClass, className)} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
      <path
        d="M16 8v3l4 4-4 4v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
      <path
        d="M16 20l-4-4 4-4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-violet-500 dark:text-violet-400"
      />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" className="text-violet-500 dark:text-violet-400" />
    </svg>
  );
}

/** Уровень 3 — Хранитель: открытая книга */
function IconKeeper({ className }: { className?: string }) {
  return (
    <svg className={cn(iconClass, className)} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M8 6v20c0 1 .8 2 2 2h2V6h-2c-1.2 0-2 .8-2 0z"
        fill="currentColor"
        className="text-violet-400 dark:text-violet-500"
      />
      <path
        d="M22 6v22h2c1.2 0 2-1 2-2V6c0-1-.8-2-2-2h-2z"
        fill="currentColor"
        className="text-violet-500 dark:text-violet-400"
      />
      <path
        d="M12 6h8v20h-8z"
        fill="currentColor"
        className="text-violet-100 dark:text-violet-900/50"
      />
      <path
        d="M16 10v12M13 13h6M13 16h6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        className="text-violet-600 dark:text-violet-300"
      />
    </svg>
  );
}

/** Уровень 4 — Магистр: шапка выпускника */
function IconMaster({ className }: { className?: string }) {
  return (
    <svg className={cn(iconClass, className)} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M16 4L4 10v2l12 6 12-6v-2L16 4z"
        fill="currentColor"
        className="text-amber-500 dark:text-amber-400"
      />
      <path
        d="M4 14l12 6 12-6v8l-12 6-12-6v-8z"
        fill="currentColor"
        className="text-amber-600 dark:text-amber-300"
      />
      <path
        d="M16 20v8M12 24h8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="text-amber-700 dark:text-amber-200"
      />
    </svg>
  );
}

/** Уровень 5 — Легенда: корона */
function IconLegend({ className }: { className?: string }) {
  return (
    <svg className={cn(iconClass, className)} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M6 20l4-8 4 4 4-6 4 6 4-8 2 12H6z"
        fill="currentColor"
        className="text-amber-400 dark:text-amber-300"
      />
      <path
        d="M8 20h16v4H8z"
        fill="currentColor"
        className="text-amber-600 dark:text-amber-400"
      />
      <path
        d="M16 10l-2 4 2-1 2 1-2-4z"
        fill="currentColor"
        className="text-amber-200 dark:text-amber-500"
      />
    </svg>
  );
}

/** Уровень 6 — Бадди-Герой: щит со звездой */
function IconHero({ className }: { className?: string }) {
  return (
    <svg className={cn(iconClass, className)} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M16 4l-8 3v6c0 6 4 10 8 12 4-2 8-6 8-12V7l-8-3z"
        fill="currentColor"
        className="text-primary"
      />
      <path
        d="M16 8l-4 1.5v4c0 3 2 5 4 6 2-1 4-3 4-6v-4L16 8z"
        fill="currentColor"
        className="text-white/90 dark:text-emerald-950/80"
      />
      <path
        d="M16 11l1.5 3 3 .5-2 2 .5 3L16 18l-2.5 1.5.5-3-2-2 3-.5L16 11z"
        fill="currentColor"
        className="text-amber-400 dark:text-amber-300"
      />
    </svg>
  );
}

const LEVEL_ICONS: Record<number, ComponentType<{ className?: string }>> = {
  1: IconSeeker,
  2: IconPathfinder,
  3: IconKeeper,
  4: IconMaster,
  5: IconLegend,
  6: IconHero,
};

interface LevelIconProps {
  level: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12 sm:w-14 sm:h-14",
};

/**
 * Иконка уровня в стиле Бадди. Используется в ProfileSummary и в бейдже шапки.
 */
export function LevelIcon({ level, className, size = "md" }: LevelIconProps) {
  const Icon = LEVEL_ICONS[Math.max(1, Math.min(6, level))] ?? IconSeeker;
  return (
    <span className={cn("inline-flex items-center justify-center shrink-0", sizeClasses[size], className)} role="img" aria-hidden>
      <Icon className="w-full h-full" />
    </span>
  );
}
