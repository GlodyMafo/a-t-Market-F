"use client";

import Link from "next/link";
import { useState } from "react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StatusBadge } from "@/components/orders/OrderStatusBadge";
import { Pagination } from "@/components/products/Pagination";
import { orderReference } from "@/features/checkout/orderState";
import { useAdminOrders } from "@/features/admin/hooks";
import { KIND_LABEL, ORDER_STATUS, TRACKING_LABELS, orderKind } from "@/features/orders/status";
import { formatDateTime, formatUsd } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";

export function AdminOrdersList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isPlaceholderData, error, refetch } = useAdminOrders(page, 20);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Commandes</h1>
      <p className="mt-1 text-sm text-muted">Les plus récentes d&apos;abord.</p>

      {isLoading && <div className="skeleton mt-5 h-72 rounded-3xl bg-ink/[0.06]" aria-busy="true" aria-label="Chargement des commandes" />}
      {error && <ErrorState title="Impossible de charger les commandes" message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && data.items.length === 0 && <p className="mt-6 rounded-3xl bg-white p-8 text-center text-sm text-muted">Aucune commande pour l&apos;instant.</p>}

      {data && data.items.length > 0 && (
        <>
          <div className={`mt-5 overflow-x-auto rounded-3xl bg-white ${isPlaceholderData ? "opacity-60 motion-safe:transition-opacity" : ""}`}>
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Commande</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Client</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Statut</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Suivi</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((order) => {
                  const status = ORDER_STATUS[order.status];
                  const latest = [...order.trackingEvents].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
                  return (
                    <tr key={order.id} className="hover:bg-surface">
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${encodeURIComponent(order.id)}`} className="font-bold text-brand-600 hover:underline">
                          {orderReference(order.id)}
                        </Link>
                        <p className="text-xs text-muted">{formatDateTime(order.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-[14rem] truncate">{order.user.email}</p>
                        <p className="text-xs text-muted">{order.user.phone ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3">{KIND_LABEL[orderKind(order.items)]}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={status.label} tone={status.tone} />
                      </td>
                      <td className="px-4 py-3 text-muted">{latest ? TRACKING_LABELS[latest.status] : "—"}</td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">{formatUsd(order.totalAmount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={(next) => { setPage(next); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        </>
      )}
    </div>
  );
}