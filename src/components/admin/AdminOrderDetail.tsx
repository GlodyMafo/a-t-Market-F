"use client";

import { ChevronLeft, ExternalLink, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrackingForm } from "@/components/admin/TrackingForm";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StatusBadge } from "@/components/orders/OrderStatusBadge";
import { orderReference } from "@/features/checkout/orderState";
import { useAdminOrder } from "@/features/admin/hooks";
import { KIND_LABEL, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_TYPE_LABEL, TRACKING_LABELS } from "@/features/orders/status";
import { multiplyMoney } from "@/lib/money";
import { formatDateTime, formatUsd, resolveImageUrl } from "@/lib/utils";
import { safeHost } from "@/lib/marketplace";
import { ApiError, errorMessage } from "@/services/api/errors";
import { DeliveryAddressCard } from "../account/DeliveryAddressCard";

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { data: order, error, isLoading, refetch } = useAdminOrder(orderId);

  if (isLoading) return <div className="skeleton h-96 rounded-3xl bg-ink/[0.06]" aria-busy="true" aria-label="Chargement de la commande" />;
  if (error) {
    if (error instanceof ApiError && error.kind === "not_found") {
      return <EmptyState title="Commande introuvable" actionLabel="Retour aux commandes" onAction={() => router.push("/admin/orders")} />;
    }
    return <ErrorState title="Impossible de charger la commande" message={errorMessage(error)} onRetry={() => refetch()} />;
  }
  if (!order) return null;

  const status = ORDER_STATUS[order.status];
  const payments = [...order.payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <Link href="/admin/orders" className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ChevronLeft className="h-4 w-4" aria-hidden /> Commandes
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Commande {orderReference(order.id)}</h1>
          <p className="mt-0.5 text-sm text-muted">
            {formatDateTime(order.createdAt)} · {KIND_LABEL[order.kind]}
            {order.currentTrackingStatus && <> · Suivi : {TRACKING_LABELS[order.currentTrackingStatus]}</>}
          </p>
        </div>
        <StatusBadge label={status.label} tone={status.tone} />
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-6">
          <section aria-labelledby="customer-title" className="rounded-3xl border border-line bg-white p-5">
            <h2 id="customer-title" className="font-display text-lg font-extrabold tracking-tight">
              Client
            </h2>
            <p className="mt-2 text-sm">
              <a href={`mailto:${order.user.email}`} className="font-semibold text-brand-600 hover:underline">
                {order.user.email}
              </a>
              {order.user.phone && (
                <>
                  {" · "}
                  <a href={`tel:${order.user.phone}`} className="font-semibold text-brand-600 hover:underline">
                    {order.user.phone}
                  </a>
                </>
              )}
            </p>
            <div className="mt-3"><DeliveryAddressCard raw={order.deliveryAddress} /></div>
          </section>

          <section aria-labelledby="items-title" className="rounded-3xl border border-line bg-white p-5">
            <h2 id="items-title" className="font-display text-lg font-extrabold tracking-tight">
              Articles ({order.items.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
            <ul className="mt-4 divide-y divide-line">
              {order.items.map((item) => {
                const imported = item.quote !== null;
                const image = resolveImageUrl([...(item.product?.images ?? [])].sort((a, b) => a.position - b.position)[0]?.imageUrl);
                const host = item.quote ? safeHost(item.quote.productUrl) : null;
                return (
                  <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface">
                      {image ? (
                        <Image src={image} alt="" fill unoptimized sizes="64px" className="object-contain p-1" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-muted">
                          <Package className="h-5 w-5" aria-hidden />
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="line-clamp-2 font-semibold">{item.quote?.productName ?? item.product?.name ?? "Produit"}</p>
                      <p className="text-xs text-muted">
                        {imported ? "Import" : "Local"} · Quantité : {item.quantity}
                      </p>
                      {item.quote?.options && <p className="text-xs font-semibold text-ink/80">Options : {item.quote.options}</p>}
                      {item.quote && (
                        <p className="text-xs text-muted">
                          Poids : {item.quote.productWeight ? `${item.quote.productWeight} kg` : "inconnu"}
                          {item.quote.weightSource ? ` (${item.quote.weightSource})` : ""}
                        </p>
                      )}
                      {item.quote?.adminNotes && <p className="text-xs text-muted">Notes : {item.quote.adminNotes}</p>}
                      {host && item.quote && (
                        <a href={item.quote.productUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                          Ouvrir chez {host} <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      )}
                    </div>
                    <p className="shrink-0 text-sm font-bold tabular-nums">{formatUsd(imported ? item.price : multiplyMoney(item.price, item.quantity))}</p>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="events-title" className="rounded-3xl border border-line bg-white p-5">
            <h2 id="events-title" className="font-display text-lg font-extrabold tracking-tight">
              Historique du suivi
            </h2>
            {order.trackingEvents.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Aucun événement pour l&apos;instant.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {order.trackingEvents.map((event) => (
                  <li key={event.id} className="text-sm">
                    <p className="font-semibold">{TRACKING_LABELS[event.status]}</p>
                    <p className="text-xs text-muted">
                      {formatDateTime(event.createdAt)}
                      {event.actor ? ` · ${event.actor.email}` : ""}
                    </p>
                    {event.message && <p className="mt-0.5 text-ink/80">{event.message}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6">
          <TrackingForm order={order} />

          <section aria-labelledby="amounts-title" className="rounded-3xl border border-line bg-white p-5">
            <h2 id="amounts-title" className="font-display text-lg font-extrabold tracking-tight">
              Montants
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Produits</dt>
                <dd className="font-medium tabular-nums">{formatUsd(order.productsAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Transport et douane</dt>
                <dd className="font-medium tabular-nums">{formatUsd(order.shippingAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-2 font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums text-brand-600">{formatUsd(order.totalAmount)}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="payments-title" className="rounded-3xl border border-line bg-white p-5">
            <h2 id="payments-title" className="font-display text-lg font-extrabold tracking-tight">
              Paiements
            </h2>
            {payments.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Aucun paiement.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {payments.map((payment) => {
                  const state = PAYMENT_STATUS[payment.status];
                  return (
                    <li key={payment.id} className="flex items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-semibold">{PAYMENT_TYPE_LABEL[payment.type]}</p>
                        <p className="text-xs text-muted">{formatDateTime(payment.createdAt)}</p>
                        {payment.providerReference && <p className="truncate text-[11px] text-muted">Réf. {payment.providerReference}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold tabular-nums">{formatUsd(payment.amount)}</p>
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