"use client";

import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type RefObject, type TouchEvent } from "react";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  name: string;
}

const navButton = "glass-dark absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full motion-safe:active:scale-95";
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/** Miniatures par colonne du rail (desktop) : au-delà, le rail passe à 2 puis 3 colonnes pour que tout reste visible. */
const RAIL_ROWS = 9;

/** Bande horizontale : mobile, et plein écran. */
function Thumbs({
  images,
  current,
  onSelect,
  listRef,
  small = false,
  className,
}: {
  images: string[];
  current: number;
  onSelect: (i: number) => void;
  listRef?: RefObject<HTMLUListElement | null>;
  small?: boolean;
  className?: string;
}) {
  return (
    <ul ref={listRef} aria-label="Miniatures" className={cn("relative flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]", className)}>
      {images.map((src, i) => (
        <li key={src} className="shrink-0">
          <button
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Voir la photo ${i + 1} sur ${images.length}`}
            aria-current={i === current}
            className={cn(
              "relative block overflow-hidden rounded-xl border-2 bg-white motion-safe:transition-colors",
              small ? "h-12 w-12" : "h-14 w-14",
              i === current ? "border-brand-500" : "border-transparent hover:border-line",
              small && (i === current ? "border-white" : "opacity-70 hover:opacity-100"),
            )}
          >
            <Image src={src} alt="" fill unoptimized referrerPolicy="no-referrer" sizes="64px" className="object-cover" />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Rail vertical (desktop) : toutes les photos visibles d'un coup d'œil. */
function ThumbRail({
  images,
  current,
  onSelect,
  listRef,
}: {
  images: string[];
  current: number;
  onSelect: (i: number) => void;
  listRef: RefObject<HTMLUListElement | null>;
}) {
  const columns = Math.min(3, Math.ceil(images.length / RAIL_ROWS));
  return (
    <ul
      ref={listRef}
      aria-label="Toutes les photos"
      style={{ gridTemplateColumns: `repeat(${columns}, 3rem)` }}
      className="relative hidden content-start gap-2 overflow-y-auto overscroll-contain [scrollbar-width:thin] lg:grid"
    >
      {images.map((src, i) => (
        <li key={src}>
          <button
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Voir la photo ${i + 1} sur ${images.length}`}
            aria-current={i === current}
            className={cn(
              "relative block h-12 w-12 overflow-hidden rounded-xl border-2 bg-white motion-safe:transition",
              i === current ? "border-brand-500" : "border-transparent opacity-80 hover:border-line hover:opacity-100",
            )}
          >
            <Image src={src} alt="" fill unoptimized referrerPolicy="no-referrer" sizes="48px" className="object-cover" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function QuoteGallery({ images, name }: Props) {
  const count = images.length;
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const touchX = useRef<number | null>(null);
  const firstRun = useRef(true);

  const current = Math.min(index, Math.max(count - 1, 0));
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (zoom && !dialog.open) dialog.showModal();
    if (!zoom && dialog.open) dialog.close();
  }, [zoom]);

  // La miniature active reste visible dans son défilement, sans jamais faire défiler la page.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const behavior = reducedMotion() ? "auto" : "smooth";
    const strip = stripRef.current;
    const stripItem = strip?.children[current] as HTMLElement | undefined;
    if (strip && stripItem && strip.offsetParent !== null) {
      strip.scrollTo({ left: stripItem.offsetLeft - (strip.clientWidth - stripItem.clientWidth) / 2, behavior });
    }
    const rail = railRef.current;
    const railItem = rail?.children[current] as HTMLElement | undefined;
    if (rail && railItem && rail.offsetParent !== null) {
      rail.scrollTo({ top: railItem.offsetTop - (rail.clientHeight - railItem.clientHeight) / 2, behavior });
    }
  }, [current]);

  const swipe = {
    onTouchStart: (e: TouchEvent) => {
      touchX.current = e.touches[0].clientX;
    },
    onTouchEnd: (e: TouchEvent) => {
      if (touchX.current === null || count < 2) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      touchX.current = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    },
  };

  if (count === 0) {
    return (
      <div className="p-3 md:p-4 lg:flex-1">
        <div className="flex h-28 items-center justify-center rounded-2xl bg-white text-sm text-muted lg:h-full lg:min-h-[20rem]">
          Aucune photo disponible pour ce produit.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-2 p-3 md:p-4 lg:flex-1 lg:flex-row-reverse lg:gap-3">
      {/* Grande photo */}
      <div className="relative lg:min-h-0 lg:min-w-0 lg:flex-1" {...swipe}>
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label={count > 1 ? `Agrandir la photo ${current + 1} sur ${count}` : "Agrandir la photo du produit"}
          className="relative block aspect-square max-h-[34rem] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-white lg:absolute lg:inset-0 lg:aspect-auto lg:max-h-none"
        >
          <Image
            src={images[current]}
            alt={count > 1 ? `${name}, photo ${current + 1} sur ${count}` : name}
            fill
            unoptimized
            priority={current === 0}
            referrerPolicy="no-referrer"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-contain p-2"
          />
        </button>

        <span aria-hidden className="glass-dark pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full">
          <Maximize2 className="h-4 w-4" />
        </span>

        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Photo précédente" className={`${navButton} left-2`}>
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className={`${navButton} right-2`}>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <p aria-live="polite" className="glass-dark pointer-events-none absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums">
              {current + 1} / {count}
            </p>
          </>
        )}
      </div>

      {/* Miniatures : bande sur mobile, rail vertical sur desktop */}
      {count > 1 && (
        <>
          <Thumbs images={images} current={current} onSelect={setIndex} listRef={stripRef} className="lg:hidden" />
          <ThumbRail images={images} current={current} onSelect={setIndex} listRef={railRef} />
        </>
      )}

      {/* Visionneuse plein écran */}
      <dialog
        ref={dialogRef}
        aria-label="Photos du produit en grand"
        onClose={() => setZoom(false)}
        onKeyDown={(event) => {
          if (count < 2) return;
          if (event.key === "ArrowRight") go(1);
          else if (event.key === "ArrowLeft") go(-1);
        }}
        className="m-0 h-dvh max-h-none w-dvw max-w-none bg-black p-0 text-white backdrop:bg-black"
      >
        {zoom && (
          <div
            className="relative h-dvh w-dvw cursor-zoom-out"
            onClick={(event) => {
              if (event.target === event.currentTarget) setZoom(false);
            }}
            {...swipe}
          >
            <Image
              src={images[current]}
              alt={`${name}, photo ${current + 1} sur ${count}`}
              fill
              unoptimized
              referrerPolicy="no-referrer"
              sizes="100vw"
              className="pointer-events-none object-contain p-2 pb-24 md:p-10 md:pb-28"
            />

            <button
              type="button"
              onClick={() => setZoom(false)}
              aria-label="Fermer"
              className="glass-dark absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            {count > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Photo précédente" className={`${navButton} left-3 h-11 w-11`}>
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className={`${navButton} right-3 h-11 w-11`}>
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
                <div className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-2 px-3">
                  <p className="glass-dark rounded-full px-3 py-1 text-xs font-semibold tabular-nums">
                    {current + 1} / {count}
                  </p>
                  <div className="max-w-full">
                    <Thumbs images={images} current={current} onSelect={setIndex} small />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}