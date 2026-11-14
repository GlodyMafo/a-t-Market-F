"use client";

import { ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { OrderCard } from "@/components/orders/OrderCard";
import { Pagination } from "@/components/products/Pagination";
import { useMyOrders } from "@/features/orders/hooks";
import { errorMessage } from "@/services/api/errors";

export function OrdersList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, isPlaceholderData, error, refetch } = useMyOrders(page);

  return (
    <section aria-labelledby="orders-title">
      <h1 id="orders-title" className="font-display text-2xl font-extrabold tracking-tight">
        Mes commandes
      </h1>

      {isLoading && (
        <ul className="mt-5 space-y-3" aria-busy="true" aria-label="Chargement des commandes">
          {[0, 1, 2].map((i) => (
            <li key={i} className="skeleton h-40 rounded-3xl bg-ink/[0.06]" />
          ))}
        </ul>
      )}

      {error && <ErrorState title="Impossible de charger vos commandes" message={errorMessage(error)} onRetry={() => refetch()} />}

      {data && data.items.length === 0 && (
        <EmptyState
          icon={ReceiptText}
          title="Aucune commande pour l'instant"
          message="Vos commandes apparaîtront ici, avec leur suivi jusqu'à la livraison."
          actionLabel="Voir les produits"
          onAction={() => router.push("/products")}
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <ul className={`mt-5 space-y-3 ${isPlaceholderData ? "opacity-60 motion-safe:transition-opacity" : ""}`} aria-busy={isPlaceholderData}>
            {data.items.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </ul>
          <Pagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={(next) => { setPage(next); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        </>
      )}
    </section>
  );
}