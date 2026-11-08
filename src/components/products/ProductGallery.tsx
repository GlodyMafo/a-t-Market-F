"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { cn, resolveImageUrl } from "@/lib/utils";
import type { ProductImage } from "@/types/domain";

const arrow =
  "glass-dark absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full opacity-0 motion-safe:transition-opacity motion-safe:duration-200 group-hover:opacity-100 focus-visible:opacity-100 md:flex";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const slides = useMemo(
    () =>
      [...images]
        .sort((a, b) => a.position - b.position)
        .map((image) => ({ id: image.id, src: resolveImageUrl(image.imageUrl) }))
        .filter((slide): slide is { id: string; src: string } => Boolean(slide.src)),
    [images],
  );
  const count = slides.length;

  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const indexRef = useRef(0);
  const frame = useRef(0);
  const target = useRef<number | null>(null);
  const targetTimer = useRef<number | undefined>(undefined);
  const firstRun = useRef(true);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Défilement programmé (vignettes, flèches) : on ignore les positions intermédiaires pour éviter les clignotements.
  const scrollToIndex = useCallback(
    (i: number, instant = false) => {
      const el = trackRef.current;
      if (!el || count === 0) return;
      const next = Math.min(Math.max(i, 0), count - 1);
      const jump = instant || reducedMotion();
      window.clearTimeout(targetTimer.current);
      if (jump) {
        target.current = null;
      } else {
        target.current = next;
        targetTimer.current = window.setTimeout(() => {
          target.current = null;
        }, 700);
      }
      setIndex(next);
      el.scrollTo({ left: next * el.clientWidth, behavior: jump ? "auto" : "smooth" });
    },
    [count],
  );

  function onScroll() {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = trackRef.current;
      if (!el || el.clientWidth === 0) return;
      const i = Math.round(el.scrollLeft / el.clientWidth);
      if (target.current !== null) {
        if (i !== target.current) return;
        target.current = null;
      }
      setIndex(i);
    });
  }

  // Rotation de l'écran / redimensionnement : on reste sur la même photo.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      el.scrollLeft = indexRef.current * el.clientWidth;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [count]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      window.clearTimeout(targetTimer.current);
    },
    [],
  );

  // La vignette active reste visible, sans faire défiler la page.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const list = thumbsRef.current;
    const item = list?.children[index] as HTMLElement | undefined;
    if (!list || !item) return;
    const behavior = reducedMotion() ? "auto" : "smooth";
    if (list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: item.offsetLeft - (list.clientWidth - item.clientWidth) / 2, behavior });
    } else {
      list.scrollTo({ top: item.offsetTop - (list.clientHeight - item.clientHeight) / 2, behavior });
    }
  }, [index]);

  // Visionneuse plein écran
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (zoom !== null && !dialog.open) dialog.showModal();
    if (zoom === null && dialog.open) dialog.close();
  }, [zoom]);

  function closeZoom() {
    if (zoom !== null) scrollToIndex(zoom, true);
    setZoom(null);
  }

  function stepZoom(delta: number) {
    setZoom((z) => (z === null ? z : (z + delta + count) % count));
  }

  function onZoomTouchEnd(event: TouchEvent) {
    if (touchX.current === null) return;
    const dx = event.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) stepZoom(dx < 0 ? 1 : -1);
  }

  if (count === 0) {
    return <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-surface text-sm text-muted">Pas d&apos;image</div>;
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse">
      <div className="group relative min-w-0 md:flex-1">
        <div
          ref={trackRef}
          onScroll={onScroll}
          role="group"
          aria-roledescription="carrousel"
          aria-label="Photos du produit"
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-2xl bg-surface [scrollbar-width:none]"
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="diapositive"
              aria-label={`Photo ${i + 1} sur ${count}`}
              className="relative aspect-square w-full shrink-0 snap-center"
            >
              <button
                type="button"
                onClick={() => setZoom(i)}
                tabIndex={i === index ? 0 : -1}
                aria-label={`Agrandir la photo ${i + 1}`}
                className="absolute inset-0 cursor-zoom-in"
              >
                <Image
                  src={slide.src}
                  alt={i === 0 ? name : `${name}, photo ${i + 1}`}
                  fill
                  unoptimized
                  priority={i === 0}
                  sizes="(min-width: 1024px) 40vw, (min-width: 768px) 45vw, 100vw"
                  className="object-contain"
                />
              </button>
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            {index > 0 && (
              <button type="button" onClick={() => scrollToIndex(index - 1)} aria-label="Photo précédente" className={`${arrow} left-3`}>
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
            )}
            {index < count - 1 && (
              <button type="button" onClick={() => scrollToIndex(index + 1)} aria-label="Photo suivante" className={`${arrow} right-3`}>
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            )}
            <p
              aria-live="polite"
              className="glass-dark pointer-events-none absolute bottom-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums"
            >
              {index + 1} / {count}
            </p>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="md:relative md:w-20 md:shrink-0">
          <ul
            ref={thumbsRef}
            aria-label="Miniatures"
            className="relative flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:absolute md:inset-0 md:flex-col md:overflow-x-hidden md:overflow-y-auto md:pb-0"
          >
            {slides.map((slide, i) => (
              <li key={slide.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => scrollToIndex(i)}
                  aria-label={`Voir la photo ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "relative block h-16 w-16 overflow-hidden rounded-xl border-2 bg-surface motion-safe:transition-colors md:h-20 md:w-20",
                    i === index ? "border-brand-500" : "border-transparent hover:border-line",
                  )}
                >
                  <Image src={slide.src} alt="" fill unoptimized sizes="80px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-label="Photos du produit en grand"
        onClose={() => {
          if (zoom !== null) closeZoom();
        }}
        onKeyDown={(event) => {
          if (count < 2) return;
          if (event.key === "ArrowRight") stepZoom(1);
          else if (event.key === "ArrowLeft") stepZoom(-1);
        }}
        className="m-0 h-dvh max-h-none w-dvw max-w-none bg-black p-0 text-white backdrop:bg-black"
      >
        {zoom !== null && slides[zoom] && (
          <div
            className="relative h-dvh w-dvw"
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={onZoomTouchEnd}
          >
            <Image
              src={slides[zoom].src}
              alt={`${name}, photo ${zoom + 1}`}
              fill
              unoptimized
              sizes="100vw"
              className="object-contain p-2 md:p-10"
            />

            <button
              type="button"
              onClick={closeZoom}
              aria-label="Fermer"
              className="glass-dark absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            {count > 1 && (
              <>
                <button type="button" onClick={() => stepZoom(-1)} aria-label="Photo précédente" className="glass-dark absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full">
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button type="button" onClick={() => stepZoom(1)} aria-label="Photo suivante" className="glass-dark absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full">
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
                <p className="glass-dark absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold tabular-nums">
                  {zoom + 1} / {count}
                </p>
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}