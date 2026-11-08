"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { sideTiles } from "@/constants/banners";
import { useProducts } from "@/features/products/hooks";
import { resolveImageUrl } from "@/lib/utils";
import { BannerCard } from "./BannerCard";

const fallback = sideTiles[0];

export function NewArrivalsTile() {
  // Mêmes paramètres que la section « Nouveautés » : la requête est partagée, aucun appel supplémentaire.
  const { data, isLoading } = useProducts({ sort: "newest", limit: 10 });

  if (isLoading) return <div aria-hidden className="min-h-[132px] animate-pulse rounded-2xl bg-surface lg:min-h-0" />;

  const photos = (data?.items ?? [])
    .map((p) => ({ id: p.id, src: resolveImageUrl(p.images[0]?.imageUrl) }))
    .filter((p): p is { id: string; src: string } => Boolean(p.src))
    .slice(0, 3);

  if (photos.length < 3) return <BannerCard banner={fallback} size="small" />;

  return (
    <Link
      href={fallback.href}
      className="group flex min-h-[132px] items-center gap-4 overflow-hidden rounded-2xl bg-brand-50 p-4 motion-safe:transition-transform motion-safe:active:scale-[0.99] lg:min-h-0"
    >
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-extrabold tracking-tight text-brand-900">{fallback.title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-brand-700">{fallback.text}</p>
        <span className="mt-2 inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-brand-600">
          {fallback.cta}
          <ArrowRight className="h-4 w-4 motion-safe:transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
      <div className="grid w-[52%] shrink-0 grid-cols-3 gap-1.5">
        {photos.map((p) => (
          <div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white">
            <Image src={p.src} alt="" fill unoptimized sizes="90px" className="object-cover" />
          </div>
        ))}
      </div>
    </Link>
  );
}