/**
 * Изображение к условию задания (ВПР 3, 8: рисунки, цены, схемы).
 * Поддержка зума по клику и подписи.
 */

import { useState } from "react";

export interface TaskImageData {
  src: string;
  alt: string;
  caption?: string;
}

interface TaskImageProps {
  /** Путь к файлу или объект с src, alt, caption */
  src: string | TaskImageData;
  alt?: string;
  caption?: string;
  zoomable?: boolean;
}

function normalizeImage(src: string | TaskImageData): TaskImageData {
  if (typeof src === "string") {
    return { src, alt: "Рисунок к заданию", caption: undefined };
  }
  return src;
}

export function TaskImage({
  src,
  alt,
  caption,
  zoomable = true,
}: TaskImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const img = normalizeImage(src);
  const displayAlt = alt ?? img.alt;
  const displayCaption = caption ?? img.caption;

  return (
    <div className="my-4 text-center">
      <div
        role={zoomable && !loadError ? "button" : undefined}
        tabIndex={zoomable && !loadError ? 0 : undefined}
        onClick={() => zoomable && !loadError && setIsZoomed(true)}
        onKeyDown={(e) => zoomable && !loadError && (e.key === "Enter" || e.key === " ") && setIsZoomed(true)}
        className={`relative inline-block rounded-lg border-2 border-border overflow-hidden ${
          zoomable && !loadError ? "cursor-zoom-in" : ""
        }`}
      >
        {loadError ? (
          <div className="min-h-[120px] flex items-center justify-center bg-muted/50 text-muted-foreground text-sm px-4 py-6">
            {displayAlt}
          </div>
        ) : (
          <img
            src={img.src}
            alt={displayAlt}
            loading="lazy"
            className="max-w-full h-auto block"
            onError={() => setLoadError(true)}
          />
        )}
        {zoomable && !loadError && (
          <div
            className="absolute bottom-2 right-2 rounded bg-black/60 text-white px-2 py-1 text-xs"
            aria-hidden
          >
            🔍
          </div>
        )}
      </div>
      {displayCaption && (
        <p className="mt-2 text-sm text-muted-foreground">{displayCaption}</p>
      )}
      {isZoomed && !loadError && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90"
          onClick={() => setIsZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Увеличено изображение"
        >
          <img
            src={img.src}
            alt={displayAlt}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setIsZoomed(false)}
            className="absolute top-5 right-5 rounded-full bg-white p-2 text-xl leading-none text-black hover:bg-gray-100"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
