/**
 * Холст для геометрических заданий ВПР 5, 10: разбиение фигуры, зеркальное отражение.
 * Сетка, опциональное начальное изображение, инструменты (линия, прямоугольник, окружность).
 */

import { useRef, useState, useEffect, useCallback } from "react";

export type GeometryTaskType = "rectangle_split" | "mirror_reflection" | "circle_draw";

interface GeometryCanvasProps {
  taskType: GeometryTaskType;
  initialImage?: string;
  gridSize?: number;
  onDrawComplete: (drawing: string) => void;
}

type Tool = "line" | "rectangle" | "circle";

const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size: number
) {
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
}

export function GeometryCanvas({
  taskType,
  initialImage,
  gridSize = GRID_SIZE,
  onDrawComplete,
}: GeometryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("line");
  const [isDrawing, setIsDrawing] = useState(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const getCoords = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height, gridSize);
    if (initialImage) {
      const img = new Image();
      img.src = initialImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }, [initialImage, gridSize]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const startDrawing = (e: React.MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    if (tool === "line") {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      startRef.current = { x, y };
    }
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    if (tool !== "line") return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingLine = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) onDrawComplete(canvas.toDataURL("image/png"));
  }, [onDrawComplete]);

  const stopDrawingWithPoint = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsDrawing(false);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsDrawing(false);
      return;
    }
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    if (tool === "rectangle" && startRef.current) {
      const { x, y } = getCoords(e);
      const sx = startRef.current.x;
      const sy = startRef.current.y;
      ctx.strokeRect(
        Math.min(sx, x),
        Math.min(sy, y),
        Math.abs(x - sx),
        Math.abs(y - sy)
      );
    }
    if (tool === "circle" && startRef.current) {
      const { x, y } = getCoords(e);
      const sx = startRef.current.x;
      const sy = startRef.current.y;
      const r = Math.hypot(x - sx, y - sy);
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, 2 * Math.PI);
      ctx.stroke();
    }
    startRef.current = null;
    setIsDrawing(false);
    if (canvas) {
      onDrawComplete(canvas.toDataURL("image/png"));
    }
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height, gridSize);
    if (initialImage) {
      const img = new Image();
      img.src = initialImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
    onDrawComplete("");
  }, [gridSize, initialImage, onDrawComplete]);

  const instruction =
    taskType === "rectangle_split"
      ? "Проведи линию так, чтобы разделить фигуру на квадрат и прямоугольник"
      : taskType === "mirror_reflection"
        ? "Нарисуй зеркальное отражение"
        : "Построй окружность заданного радиуса";

  return (
    <div className="my-4 rounded-lg border-2 border-border overflow-hidden">
      <div className="flex flex-wrap gap-2 p-3 bg-muted/30 border-b border-border">
        <button
          type="button"
          onClick={() => setTool("line")}
          className={`px-3 py-1.5 rounded-md border text-sm ${tool === "line" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"}`}
        >
          📏 Линия
        </button>
        <button
          type="button"
          onClick={() => setTool("rectangle")}
          className={`px-3 py-1.5 rounded-md border text-sm ${tool === "rectangle" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"}`}
        >
          ⬜ Прямоугольник
        </button>
        <button
          type="button"
          onClick={() => setTool("circle")}
          className={`px-3 py-1.5 rounded-md border text-sm ${tool === "circle" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"}`}
        >
          ⭕ Окружность
        </button>
        <button
          type="button"
          onClick={clearCanvas}
          className="ml-auto px-3 py-1.5 rounded-md border border-destructive/50 text-destructive text-sm hover:bg-destructive/10"
        >
          🗑️ Очистить
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block w-full max-w-full bg-background cursor-crosshair touch-none"
        style={{ maxHeight: "300px" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={tool === "line" ? stopDrawingLine : stopDrawingWithPoint}
        onMouseLeave={tool === "line" ? stopDrawingLine : undefined}
        aria-label="Область для чертежа"
      />
      <p className="p-3 text-center text-sm text-muted-foreground bg-muted/20">
        {instruction}
      </p>
    </div>
  );
}
