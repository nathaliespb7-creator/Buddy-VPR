import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Склонение слова «балл»: 1 балл, 2/3/4 балла, 5+ баллов (и 11–14, 111–114 и т.д.). */
export function ballWord(n: number): "балл" | "балла" | "баллов" {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return "баллов"
  if (mod10 === 1) return "балл"
  if (mod10 >= 2 && mod10 <= 4) return "балла"
  return "баллов"
}

/** «N балл» / «N балла» / «N баллов». */
export function ballsPhrase(n: number): string {
  return `${n} ${ballWord(n)}`
}
