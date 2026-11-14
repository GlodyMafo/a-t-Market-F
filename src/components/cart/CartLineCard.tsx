"use client";

import { AlertTriangle, ExternalLink, Package, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { QuantitySelector } from "@/components/products/QuantitySelector";
import type { CartLine } from "@/features/cart/types";
import { cn, formatDate, formatUsd } from "@/lib/utils";

interface Props {
  line: CartLine;
  busy: boolean;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartLineCard({ line, busy, onQuantity, onRemove }: Props) {
  const soft = line.issue === "PENDING_REVIEW";

  return (
    <li className="rounded-3xl border border-line bg-white p-3 shadow-[0_12px_32px_-24px_rgb(15_17_21/0.3)] sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface sm:h-28 sm:w-28">
          {line.imageUrl ? (
            <Image src={line.imageUrl} alt="" fill unoptimized referrerPolicy="no-referrer" sizes="112px" className="object-contain p-1" />
          ) : (
            <span className="flex h-full items-center justify-center text-muted">
              <Package className="h-6 w-6" aria-hidden />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span
                className={cn(
                  "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                  line.kind === "LOCAL" ? "bg-brand-50 text-brand-700" : "bg-ink text-white",
                )}
              >
                {line.kind === "LOCAL" ? "Disponible à Lubumbashi" : `Import${line.marketplace ? ` · ${line.marketplace}` : ""}`}
              </span>
              <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold sm:text-base">
                {line.kind === "LOCAL" && line.href ? (
                  <Link href={line.href} className="hover:underline">
                    {line.name}
                  </Link>
                ) : (
                  line.name
                )}
              </h3>
              {line.options && <p className="mt-0.5 text-xs text-muted">{line.options}</p>}
              {line.kind === "INTERNATIONAL" && line.href && line.sourceHost && (
                <a
                  href={line.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                >
                  Voir chez {line.sourceHost} <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              aria-label={`Retirer ${line.name} du panier`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted motion-safe:transition-colors hover:bg-red-50 hover:text-sale disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            {line.quantityEditable ? (
              <QuantitySelector value={line.quantity} max={line.maxQuantity ?? 999} onChange={onQuantity} disabled={busy} />
            ) : (
              <p className="text-sm text-muted">Quantité : {line.quantity}</p>
            )}
            <div className="text-right">
              <p className="font-display text-xl font-extrabold tabular-nums tracking-tight text-brand-600">{formatUsd(line.lineTotal)}</p>
              {line.kind === "LOCAL" && line.quantity > 1 && line.unitPrice && (
                <p className="text-xs text-muted">{formatUsd(line.unitPrice)} l&apos;unité</p>
              )}
              {line.kind === "INTERNATIONAL" && line.expiresAt && !line.issue && (
                <p className="text-xs text-muted">Valable jusqu&apos;au {formatDate(line.expiresAt)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {line.issueMessage && (
        <p
          role={soft ? "status" : "alert"}
          className={cn("mt-3 flex items-start gap-2 rounded-2xl p-3 text-sm", soft ? "bg-amber-50 text-amber-900" : "bg-red-50 text-red-700")}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {line.issueMessage}
        </p>
      )}
    </li>
  );
}