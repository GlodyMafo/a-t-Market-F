"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { heroSlides } from "@/constants/banners";
import { cn } from "@/lib/utils";
import { BannerCard } from "./BannerCard";

const AUTOPLAY_MS = 5000;
const arrow =
  "glass-dark absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full opacity-0 motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-100 focus-visible:opacity-100 md:flex";

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = heroSlides.length;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const go = (n: number) => setIndex(((n % count) + count) % count);
  const playing = count > 1 && !reduceMotion && !userPaused;

  // Chaque changement de slide (auto ou manuel) relance le minuteur ; survol, focus et doigt le suspendent.
  useEffect(() => {
    if (!playing || hovered || focused || touching) return;
    const timer = setTimeout(() => setIndex((n) => (n + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, playing, hovered, focused, touching, count]);

  return (
    <div
      role="region"
      aria-roledescription="carrousel"
      aria-label="Offres A&T Market"
      className="group relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        setTouching(true);
      }}
      onTouchCancel={() => setTouching(false)}
      onTouchEnd={(e) => {
        setTouching(false);
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      <div
        aria-live={playing ? "off" : "polite"}
        className="flex motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {heroSlides.map((slide, i) => (
          <div key={slide.id} className="w-full shrink-0" aria-hidden={i !== index}>
            <BannerCard banner={slide} priority={i === 0} tabIndex={i === index ? 0 : -1} />
          </div>
        ))}
      </div>

      {/* Pastille : points + pause. Haut gauche sur mobile (le texte occupe le bas), bas centre sur desktop. */}
      {count > 1 && (
        <div className="glass-dark absolute left-3 top-3 z-20 flex items-center rounded-full px-1.5 md:bottom-4 md:left-1/2 md:top-auto md:-translate-x-1/2">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Aller à l'offre ${i + 1}`}
              aria-current={i === index}
              className="relative flex h-7 items-center px-2 before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-['']"
            >
              <span className={cn("block h-2 rounded-full bg-white motion-safe:transition-all", i === index ? "w-5" : "w-2 opacity-55")} />
            </button>
          ))}
          {!reduceMotion && (
            <button
              type="button"
              onClick={() => setUserPaused((v) => !v)}
              aria-label={userPaused ? "Reprendre le défilement" : "Mettre le défilement en pause"}
              className="relative ml-0.5 flex h-7 w-7 items-center justify-center before:absolute before:-inset-2 before:content-['']"
            >
              {userPaused ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
            </button>
          )}
        </div>
      )}

      <button type="button" onClick={() => go(index - 1)} aria-label="Offre précédente" className={`${arrow} left-3`}>
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button type="button" onClick={() => go(index + 1)} aria-label="Offre suivante" className={`${arrow} right-3`}>
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}