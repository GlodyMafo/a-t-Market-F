"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn, resolveImageUrl } from "@/lib/utils";
import type { ProductImage } from "@/types/domain";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const sorted = useMemo(() => [...images].sort((a, b) => a.position - b.position), [images]);
  const [index, setIndex] = useState(0);
  const current = sorted[index] ?? sorted[0];
  const src = resolveImageUrl(current?.imageUrl);

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface md:flex-1">
        {src ? (
          <Image
            src={src}
            alt={name}
            fill
            priority
            unoptimized
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">Pas d&apos;image</div>
        )}
      </div>

      {sorted.length > 1 && (
        <ul className="flex gap-2 md:w-20 md:flex-col" aria-label="Photos du produit">
          {sorted.map((image, i) => {
            const thumb = resolveImageUrl(image.imageUrl);
            return (
              <li key={image.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Voir la photo ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "relative block h-16 w-16 overflow-hidden rounded-lg border-2 bg-surface md:h-20 md:w-20",
                    i === index ? "border-brand-500" : "border-transparent hover:border-line",
                  )}
                >
                  {thumb && <Image src={thumb} alt="" fill unoptimized sizes="80px" className="object-cover" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}