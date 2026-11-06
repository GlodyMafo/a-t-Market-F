import Image from "next/image";
import Link from "next/link";
import { cn, formatUsd, resolveImageUrl } from "@/lib/utils";
import type { Product } from "@/types/domain";

export function ProductCard({ product }: { product: Product }) {
  const image = resolveImageUrl(product.images[0]?.imageUrl);
  const isLocal = product.type === "LOCAL";

  return (
    <Link href={`/products/${encodeURIComponent(product.id)}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            unoptimized
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">Pas d&apos;image</div>
        )}
        <span
          className={cn(
            "absolute left-2 top-2 rounded px-1.5 py-0.5 text-[11px] font-semibold",
            isLocal ? "bg-brand-500 text-white" : "bg-ink text-white",
          )}
        >
          {isLocal ? "Disponible à Lubumbashi" : "Import"}
        </span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm">{product.name}</h3>
      <p className="mt-1 text-base font-bold">{formatUsd(product.price)}</p>
    </Link>
  );
}