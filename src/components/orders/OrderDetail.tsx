"use client";

import { ChevronLeft, ExternalLink, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StatusPanelAction } from "@/components/orders/StatusPanelAction";
import { StatusBadge } from "@/components/orders/OrderStatusBadge";
import { TrackingTimeline } from "@/components/orders/TrackingTimeline";
import { derivePhase, orderReference } from "@/features/checkout/orderState";
import { useOrder } from "@/features/checkout/useOrder";
import { orderLines } from "@/features/orders/lines";
import { useTracking } from "@/features/orders/hooks";
import { KIND_LABEL, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_TYPE_LABEL, orderKind } from "@/features/orders/status";
import { formatDateTime, formatUsd } from "@/lib/utils";
import { ApiError, errorMessage } from "@/services/api/errors";
import { DeliveryAddressCard } from "../account/DeliveryAddressCard";

export function OrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { data: order, error, isLoading, refetch } = useOrder(orderId);
  const tracking = useTracking(orderId);

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Chargement de la commande">
        <div className="skeleton h-28 rounded-3xl bg-ink/[0.06]" />
        <div className="skeleton h-72 rounded-3xl bg-ink/[0.06]" />
      </div>
    );
  }
  if (error) {
    if (error instanceof ApiError && error.kind === "not_found") {
      return (
        <EmptyState
          title="Commande introuvable"
          message="Cette commande n'existe pas ou ne vous appartient pas."
          actionLabel="Mes commandes"
          onAction={() => router.push("/account/orders")}
        />
      );
    }
    return <ErrorState title="Impossible de charger la commande" message={errorMessage(error)} onRetry={() => refetch()} />;
  }
  if (!order) return null;

  const phase = derivePhase(order);
  const kind = orderKind(order.items);
  const lines = orderLines(order);
  const status = ORDER_STATUS[order.status];
  const events = tracking.data ?? [];
  const showTracking = order.status !== "PENDING_PAYMENT" && order.status !== "CANCELLED";
  const payments = [...(order.payments ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const payLabel =
    phase === "payable" ? "Payer maintenant" : phase === "failed" ? "Réessayer le paiement" : phase === "partial" ? "Payer le reste" : phase === "waiting" ? "Voir le paiement en cours" : null;

  return (
    <div>
      <Link href="/account/orders" className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ChevronLeft className="h-4 w-4" aria-hidden /> Mes commandes
      </Link>

      <header className="rounded-3xl bg-surface p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight">Commande {orderReference(order.id)}</h1>
            <p className="mt-0.5 text-sm text-muted">
              Passée le {formatDateTime(order.createdAt)} · {KIND_LABEL[kind]}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
        {payLabel && (
          <div className="mt-4">
            <StatusPanelAction href={`/checkout/confirmation/${encodeURIComponent(order.id)}`} label={payLabel} />
          </div>
        )}
        {order.status === "CANCELLED" && (
          <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">Cette commande a été annulée, faute de paiement dans le délai prévu. Aucun montant n&apos;a été retenu.</p>
        )}
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-6">
          {showTracking && (
            <>
              <TrackingTimeline kind={kind} events={events} paid />
              {tracking.isError && (
                <p role="alert" className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">
                  Le suivi n&apos;a pas pu être actualisé.{" "}
                  <button type="button" onClick={() => tracking.refetch()} className="font-semibold underline">
                    Réessayer
                  </button>
                </p>
              )}
            </>
          )}

          <section aria-labelledby="items-title" className="rounded-3xl border border-line bg-white p-5 md:p-6">
            <h2 id="items-title" className="font-display text-lg font-extrabold tracking-tight">
              Articles ({lines.reduce((sum, line) => sum + line.quantity, 0)})
            </h2>
            <ul className="mt-4 divide-y divide-line">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface">
                    {line.imageUrl ? (
                      <Image src={line.imageUrl} alt="" fill unoptimized referrerPolicy="no-referrer" sizes="64px" className="object-contain p-1" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-muted">
                        <Package className="h-5 w-5" aria-hidden />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold">
                      {line.href && line.kind === "LOCAL" ? (
                        <Link href={line.href} className="hover:underline">
                          {line.name}
                        </Link>
                      ) : (
                        line.name
                      )}
                    </p>
                    {line.options && <p className="text-xs text-muted">{line.options}</p>}
                    <p className="text-xs text-muted">
                      {line.kind === "LOCAL" ? "Disponible à Lubumbashi" : "Import"} · Quantité : {line.quantity}
                    </p>
                    {line.sourceHost && line.href && (
                      <a href={line.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
                        Voir chez {line.sourceHost} <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-bold tabular-nums">{formatUsd(line.lineTotal)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
          <DeliveryAddressCard raw={order.deliveryAddress} />
          
          <section aria-labelledby="summary-title" className="rounded-3xl border border-line bg-white p-5">
            <h2 id="summary-title" className="font-display text-lg font-extrabold tracking-tight">
              Récapitulatif
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Produits</dt>
                <dd className="font-medium tabular-nums">{formatUsd(order.productsAmount)}</dd>
              </div>
              {Number(order.shippingAmount) > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Transport et douane</dt>
                  <dd className="font-medium tabular-nums">{formatUsd(order.shippingAmount)}</dd>
                </div>
              )}
              <div className="flex items-end justify-between gap-4 border-t border-line pt-3">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-2xl font-extrabold tabular-nums tracking-tight text-brand-600">{formatUsd(order.totalAmount)}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="payments-title" className="rounded-3xl border border-line bg-white p-5">
            <h2 id="payments-title" className="font-display text-lg font-extrabold tracking-tight">
              Paiements
            </h2>
            {payments.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Aucun paiement pour le moment.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {payments.map((payment) => {
                  const state = PAYMENT_STATUS[payment.status];
                  return (
                    <li key={payment.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{PAYMENT_TYPE_LABEL[payment.type]}</p>
                        <p className="text-xs text-muted">{formatDateTime(payment.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold tabular-nums">{formatUsd(payment.amount)}</p>
                        <StatusBadge label={state.label} tone={state.tone} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}