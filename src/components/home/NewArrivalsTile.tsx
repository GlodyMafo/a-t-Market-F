"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { sideTiles } from "@/constants/banners";
import { newArrivalsPhotos } from "@/constants/site";
import { useProducts } from "@/features/products/hooks";
import { cn, resolveImageUrl } from "@/lib/utils";
import { BannerCard } from "./BannerCard";

const fallback = sideTiles[0];
const INTERVAL_MS = 4000;
const MAX_PHOTOS = 5;

interface Photo {
  id: string;
  src: string;
  /** Image du dossier public/ : optimisée par Next.js. Les photos produits viennent de l'API et restent telles quelles. */
  local: boolean;
}

export function NewArrivalsTile() {
  // Mêmes paramètres que la section « Nouveautés » : la requête est partagée, aucun appel supplémentaire.
  const { data, isLoading } = useProducts({ sort: "newest", limit: 10 });
  const [index, setIndex] = useState(0);

  const photos = useMemo<Photo[]>(() => {
    // Images choisies à la main (constants/site.ts) : elles remplacent les photos produits.
    const custom = newArrivalsPhotos.filter(Boolean).slice(0, MAX_PHOTOS);
    if (custom.length > 0) return custom.map((src) => ({ id: src, src, local: true }));

    const seen = new Set<string>();
    const list: Photo[] = [];
    for (const product of data?.items ?? []) {
      const src = resolveImageUrl(product.images[0]?.imageUrl);
      if (!src || seen.has(src)) continue;
      seen.add(src);
      list.push({ id: product.id, src, local: false });
      if (list.length >= MAX_PHOTOS) break;
    }
    return list;
  }, [data]);
  const count = photos.length;

  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [count]);

  if (count === 0 && isLoading) return <div aria-hidden className="skeleton min-h-[132px] rounded-2xl lg:min-h-0" />;
  if (count === 0) return <BannerCard banner={fallback} size="small" />;

  const current = index % count;

  return (
    <Link
      href={fallback.href}
      className="group relative isolate flex min-h-[132px] items-center overflow-hidden rounded-2xl bg-brand-900 p-4 text-white motion-safe:transition-transform motion-safe:active:scale-[0.99] lg:min-h-0"
    >
      {/* Photos défilantes en fond (fondu enchaîné) */}
      {photos.map((photo, i) => (
        <Image
          key={photo.id}
          src={photo.src}
          alt=""
          fill
          unoptimized={!photo.local}
          loading={i === 0 ? "eager" : "lazy"}
          sizes="(min-width: 1024px) 33vw, 100vw"
          className={cn(
            "-z-20 object-cover motion-safe:transition-opacity motion-safe:duration-1000 motion-safe:ease-in-out",
            i === current ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      {/* Voile : garde le texte lisible, même sur une photo à fond clair */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-brand-900/90 via-brand-900/70 via-55% to-brand-900/10" />

      <div className="relative min-w-0 max-w-[62%]">
        <p className="font-display text-lg font-extrabold tracking-tight">{fallback.title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-white/85">{fallback.text}</p>
        <span className="mt-2 inline-flex items-center gap-1.5 py-1 text-sm font-semibold">
          {fallback.cta}
          <ArrowRight className="h-4 w-4 motion-safe:transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>

      {/* Repères décoratifs du diaporama */}
      {count > 1 && (
        <div aria-hidden className="absolute bottom-3 right-3 flex items-center gap-1">
          {photos.map((photo, i) => (
            <span key={photo.id} className={cn("h-1.5 rounded-full bg-white motion-safe:transition-all", i === current ? "w-4" : "w-1.5 opacity-60")} />
          ))}
        </div>
      )}
    </Link>
  );
}