import { ChevronRight, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/orders/OrderStatusBadge";
import { orderReference } from "@/features/checkout/orderState";
import { orderLines } from "@/features/orders/lines";
import { KIND_LABEL, ORDER_STATUS, orderKind } from "@/features/orders/status";
import { formatDate, formatUsd } from "@/lib/utils";
import type { Order } from "@/types/domain";

export function OrderCard({ order }: { order: Order }) {
  const lines = orderLines(order);
  const status = ORDER_STATUS[order.status];
  const units = lines.reduce((sum, line) => sum + line.quantity, 0);
  const shown = lines.slice(0, 4);

  return (
    <li>
      <Link
        href={`/account/orders/${encodeURIComponent(order.id)}`}
        className="block rounded-3xl border border-line bg-white p-4 shadow-[0_12px_32px_-24px_rgb(15_17_21/0.3)] motion-safe:transition-shadow hover:shadow-md md:p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-lg font-extrabold tracking-tight">{orderReference(order.id)}</p>
            <p className="text-xs text-muted">Passée le {formatDate(order.createdAt)}</p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>

        <div className="mt-4 flex items-center gap-2">
          {shown.map((line) => (
            <span key={line.key} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface">
              {line.imageUrl ? (
                <Image src={line.imageUrl} alt="" fill unoptimized referrerPolicy="no-referrer" sizes="48px" className="object-contain p-0.5" />
              ) : (
                <span className="flex h-full items-center justify-center text-muted">
                  <Package className="h-4 w-4" aria-hidden />
                </span>
              )}
            </span>
          ))}
          {lines.length > shown.length && <span className="text-sm font-semibold text-muted">+{lines.length - shown.length}</span>}
          <span className="ml-auto rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-muted">{KIND_LABEL[orderKind(order.items)]}</span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-3">
          <p className="text-sm text-muted">
            {units} article{units > 1 ? "s" : ""} ·{" "}
            <span className="font-display text-lg font-extrabold tabular-nums text-brand-600">{formatUsd(order.totalAmount)}</span>
          </p>
          <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600">
            Voir le détail <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </Link>
    </li>
  );
}