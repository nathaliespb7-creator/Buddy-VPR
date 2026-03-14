/**
 * Страница карты островов математики ВПР 4 класс.
 * Маршрут: /play/math
 */

import { useLocation } from "wouter";
import { MathIslandMap } from "@/components/MathIslandMap";
import { Button } from "@/components/ui/button";

export default function MathIslandMapPage() {
  const [, setLocation] = useLocation();

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 to-sky-50 dark:from-teal-950/30 dark:to-sky-950/30">
      <div className="p-4 flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/class-selector")}>
          ← Домой
        </Button>
      </div>
      <MathIslandMap />
    </main>
  );
}
