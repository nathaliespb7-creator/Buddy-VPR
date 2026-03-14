/**
 * Canvas для чертежей в заданиях № 5 и № 10 (площадь, зеркальное отражение).
 */

import { useRef, useState, useEffect, useCallback } from "react";

interface MathDrawingInputProps {
  onDrawComplete: (drawing: string) => void;
  taskType: "mirror" | "shape";
}

export function MathDrawingInput({ onDrawComplete, taskType }: MathDrawingInputProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    if (taskType === "mirror") {
      drawGrid(ctx, canvas.width, canvas.height);
    }
  }, [taskType, drawGrid]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0]!.clientX - rect.left,
        y: e.touches[0]!.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      onDrawComplete(canvas.toDataURL("image/png"));
    }
  }, [hasDrawn, onDrawComplete]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (taskType === "mirror") {
      drawGrid(ctx, canvas.width, canvas.height);
    }
    setHasDrawn(false);
    onDrawComplete("");
  }, [taskType, drawGrid, onDrawComplete]);

  return (
    <div className="math-drawing-input space-y-2">
      <p className="text-sm text-muted-foreground">
        {taskType === "mirror"
          ? "Нарисуй зеркальное отражение"
          : "Выполни построение на чертеже"}
      </p>
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="border rounded-lg w-full max-w-full touch-none"
        style={{ maxHeight: "300px" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        aria-label="Область для чертежа"
      />
      <button
        type="button"
        onClick={clearCanvas}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Очистить
      </button>
    </div>
  );
}
