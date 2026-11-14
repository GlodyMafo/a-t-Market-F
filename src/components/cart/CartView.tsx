"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartLineCard } from "@/components/cart/CartLineCard";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCart } from "@/features/cart/useCart";
import { useCartActions } from "@/features/cart/useCartActions";
import { errorMessage } from "@/services/api/errors";

function CartSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6" aria-busy="true" aria-label="Chargement du panier">
      <div className="skeleton h-8 w-48 rounded-xl bg-ink/[0.06]" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-36 rounded-3xl bg-ink/[0.06]" />
          ))}
        </div>
        <div className="skeleton h-72 rounded-3xl bg-ink/[0.06]" />
      </div>
    </div>
  );
}

export function CartView() {
  const router = useRouter();
  const cart = useCart();
  const actions = useCartActions();

  if (cart.status === "loading") return <CartSkeleton />;
  if (cart.status === "error") {
    return <ErrorState title="Impossible de charger votre panier" message={errorMessage(cart.error)} onRetry={cart.refetch} />;
  }
  if (cart.lines.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Votre panier est vide"
        message="Ajoutez des produits disponibles à Lubumbashi, ou importez-en depuis SHEIN, NOON et 1688."
        actionLabel="Voir les produits"
        onAction={() => router.push("/products")}
      >
        <Link href="/import" className="min-h-11 text-sm font-semibold text-brand-600 hover:underline">
          Importer un produit
        </Link>
      </EmptyState>
    );
  }

  const local = cart.lines.filter((l) => l.kind === "LOCAL");
  const imported = cart.lines.filter((l) => l.kind === "INTERNATIONAL");

  const group = (id: string, title: string, lines: typeof cart.lines) =>
    lines.length > 0 && (
      <section aria-labelledby={id}>
        <h2 id={id} className="mb-3 font-display text-lg font-extrabold tracking-tight">
          {title} <span className="font-normal text-muted">({lines.length})</span>
        </h2>
        <ul className="space-y-3">
          {lines.map((line) => (
            <CartLineCard
              key={line.key}
              line={line}
              busy={actions.pending}
              onQuantity={(quantity) => actions.setQuantity(line.key, quantity)}
              onRemove={() => actions.remove(line.key)}
            />
          ))}
        </ul>
      </section>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Mon panier <span className="text-lg font-semibold text-muted">· {cart.count} article{cart.count > 1 ? "s" : ""}</span>
      </h1>

      {cart.mode === "guest" && (
        <p className="mt-4 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
          Votre panier est enregistré sur cet appareil.{" "}
          <Link href="/login?next=/cart" className="font-semibold underline">
            Connectez-vous
          </Link>{" "}
          pour le retrouver partout et passer commande.
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-8">
          {group("cart-local", "Disponibles à Lubumbashi", local)}
          {group("cart-imported", "Importés (SHEIN, NOON, 1688)", imported)}
        </div>
        <CartSummary cart={cart} />
      </div>
    </div>
  );
}