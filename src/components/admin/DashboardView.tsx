"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StatusBadge } from "@/components/orders/OrderStatusBadge";
import { orderReference } from "@/features/checkout/orderState";
import { useAdminDashboard, useAdminOrders, useAdminStats } from "@/features/admin/hooks";
import { KIND_LABEL, ORDER_STATUS, orderKind } from "@/features/orders/status";
import { cn, formatDateTime, formatUsd } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";

interface Counter {
  key: "internationalToPurchase" | "quotesPendingReview" | "localToPrepare" | "partiallyPaid" | "outOfStockProducts";
  label: string;
  hint: string;
  href?: string;
}

const COUNTERS: Counter[] = [
  { key: "internationalToPurchase", label: "Produits à acheter", hint: "Commandes payées avec articles importés", href: "/admin/purchases" },
  { key: "quotesPendingReview", label: "Devis à valider", hint: "En attente de votre décision", href: "/admin/quotes" },
  { key: "localToPrepare", label: "Commandes locales à préparer", hint: "Payées, à préparer et livrer", href: "/admin/orders" },
  { key: "partiallyPaid", label: "Paiements partiels", hint: "Reste à encaisser", href: "/admin/orders" },
  { key: "outOfStockProducts", label: "Produits en rupture", hint: "Produits locaux actifs sans stock" },
];

export function DashboardView() {
  const dashboard = useAdminDashboard();
  const stats = useAdminStats();
  const recent = useAdminOrders(1, 6);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Tableau de bord</h1>

      <section aria-labelledby="todo-title">
        <h2 id="todo-title" className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
          À traiter
        </h2>
        {dashboard.error ? (
          <ErrorState title="Compteurs indisponibles" message={errorMessage(dashboard.error)} onRetry={() => dashboard.refetch()} />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {COUNTERS.map((counter) => {
              const value = dashboard.data?.[counter.key];
              const urgent = (value ?? 0) > 0;
              const body = (
                <>
                  <p className="text-sm font-semibold text-ink/80">{counter.label}</p>
                  <p className={cn("mt-2 font-display text-4xl font-extrabold tabular-nums tracking-tight", urgent ? "text-brand-600" : "text-muted")}>
                    {value ?? "–"}
                  </p>
                  <p className="mt-1 text-xs text-muted">{counter.hint}</p>
                </>
              );
              const cls = "block h-full rounded-3xl border border-line bg-white p-5";
              return (
                <li key={counter.key}>
                  {counter.href ? (
                    <Link href={counter.href} className={cn(cls, "motion-safe:transition-shadow hover:shadow-md")}>
                      {body}
                    </Link>
                  ) : (
                    <div className={cls}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
          Chiffres clés
        </h2>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Clients inscrits", value: stats.data?.totalUsers },
            { label: "Commandes", value: stats.data?.totalOrders },
            { label: "Commandes payées", value: stats.data?.paidOrders },
            { label: "Chiffre d'affaires", value: stats.data ? formatUsd(stats.data.totalRevenue) : undefined },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-white p-4">
              <dt className="text-xs text-muted">{item.label}</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold tabular-nums tracking-tight">{item.value ?? "–"}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-muted">Chiffre d&apos;affaires : commandes payées ou livrées, en dollars US.</p>
      </section>

      <section aria-labelledby="recent-title">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-title" className="text-sm font-bold uppercase tracking-wider text-muted">
            Dernières commandes
          </h2>
          <Link href="/admin/orders" className="inline-flex items-center text-sm font-semibold text-brand-600 hover:underline">
            Toutes les commandes <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-white">
          {recent.isLoading && <li className="skeleton h-16" aria-busy="true" />}
          {recent.error && <li className="p-4 text-sm text-muted">Impossible de charger les commandes.</li>}
          {recent.data?.items.length === 0 && <li className="p-6 text-center text-sm text-muted">Aucune commande pour l&apos;instant.</li>}
          {recent.data?.items.map((order) => {
            const status = ORDER_STATUS[order.status];
            return (
              <li key={order.id}>
                <Link href={`/admin/orders/${encodeURIComponent(order.id)}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-surface">
                  <span className="font-bold">{orderReference(order.id)}</span>
                  <span className="text-sm text-muted">{order.user.email}</span>
                  <span className="text-xs text-muted">{formatDateTime(order.createdAt)}</span>
                  <span className="ml-auto flex items-center gap-3">
                    <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted">{KIND_LABEL[orderKind(order.items)]}</span>
                    <StatusBadge label={status.label} tone={status.tone} />
                    <span className="w-20 text-right font-bold tabular-nums">{formatUsd(order.totalAmount)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}