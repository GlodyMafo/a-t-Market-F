import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { LOW_STOCK_NOTICE } from "@/constants/catalog";
import { cn, formatUsd, resolveImageUrl } from "@/lib/utils";
import type { Product } from "@/types/domain";

interface Props {
  product: Product;
  /** Les premières cartes visibles : image chargée en priorité. */
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: Props) {
  const image = resolveImageUrl(product.images[0]?.imageUrl);
  const isLocal = product.type === "LOCAL";

  // Les signaux de stock ne s'affichent que si l'API fournit l'inventaire dans la liste.
  const quantity = isLocal && product.inventory ? product.inventory.quantity : undefined;
  const soldOut = quantity !== undefined && quantity <= 0;
  const lowStock = quantity !== undefined && quantity > 0 && quantity <= LOW_STOCK_NOTICE;

  return (
    <Link
      href={`/products/${encodeURIComponent(product.id)}`}
      className="group block motion-safe:transition-transform motion-safe:active:scale-[0.98]"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            unoptimized
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            sizes="(min-width: 1280px) 22vw, (min-width: 640px) 33vw, 50vw"
            className={cn(
              "object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105",
              soldOut && "opacity-70",
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">Pas d&apos;image</div>
        )}

        <span
          className={cn(
            "glass-dark absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            isLocal && "bg-brand-600/70",
          )}
        >
          {isLocal ? (
            <>
              <MapPin className="h-3 w-3" aria-hidden />
              <span className="sr-only">Disponible à </span>Lubumbashi
            </>
          ) : (
            "Import"
          )}
        </span>

        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/45">
            <span className="glass rounded-full px-3 py-1 text-xs font-bold">Épuisé</span>
          </div>
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm">{product.name}</h3>
      <p className="mt-1 text-base font-bold tabular-nums">{formatUsd(product.price)}</p>
      {lowStock && <p className="mt-0.5 text-xs font-semibold text-sale">Plus que {quantity} en stock</p>}
    </Link>
  );
}