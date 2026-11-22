
"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddressPicker } from "@/components/checkout/AddressPicker";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { PaymentForm } from "@/components/checkout/PaymentForm";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { statusButton } from "@/components/feedback/StatusPanel";
import { useAddresses } from "@/features/account/hooks";
import { useSession } from "@/features/authentication/session.store";
import { useCart } from "@/features/cart/useCart";
import { readPendingOrder } from "@/features/checkout/pending-order";
import { usePayment } from "@/features/checkout/usePayment";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";

function CheckoutSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-6"
      aria-busy="true"
      aria-label="Chargement de la commande"
    >
      <div className="skeleton h-8 w-56 rounded-xl bg-ink/[0.06]" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="skeleton h-96 rounded-3xl bg-ink/[0.06]" />
        <div className="skeleton h-72 rounded-3xl bg-ink/[0.06]" />
      </div>
    </div>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const cart = useCart();
  const { pay, pending, error } = usePayment();

  const { data: addresses } = useAddresses();
  const [chosenAddress, setChosenAddress] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Adresse choisie, sinon l'adresse par défaut, sinon la première.
  const addressId =
    (chosenAddress && addresses?.some((a) => a.id === chosenAddress)
      ? chosenAddress
      : null) ??
    addresses?.find((a) => a.isDefault)?.id ??
    addresses?.[0]?.id ??
    null;

  const [pendingOrderId] = useState(() => readPendingOrder());

  // Panier vide mais commande en cours (paiement interrompu) : on reprend là où on s'est arrêté.
  const resume = cart.status === "ready" && cart.lines.length === 0 && pendingOrderId;

  useEffect(() => {
    if (resume) {
      router.replace(
        `/checkout/confirmation/${encodeURIComponent(pendingOrderId)}`
      );
    }
  }, [resume, pendingOrderId, router]);

  if (cart.status === "loading" || resume) return <CheckoutSkeleton />;

  if (cart.status === "error") {
    return (
      <ErrorState
        title="Impossible de charger votre commande"
        message={errorMessage(cart.error)}
        onRetry={cart.refetch}
      />
    );
  }

  if (cart.lines.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Votre panier est vide"
        message="Ajoutez des produits avant de passer commande."
        actionLabel="Voir les produits"
        onAction={() => router.push("/products")}
      />
    );
  }

  if (!cart.checkoutReady) {
    const problems = cart.lines.filter((line) => !line.payable);

    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-3xl border border-line bg-white p-6">
          <h1 className="font-display text-xl font-extrabold tracking-tight">
            Votre panier doit être corrigé
          </h1>
          <p className="mt-2 text-sm text-muted">
            Ces articles empêchent de passer commande pour le moment :
          </p>
          <ul className="mt-4 space-y-2">
            {problems.map((line) => (
              <li
                key={line.key}
                className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900"
              >
                <span className="font-semibold">{line.name}</span>
                {line.issueMessage && (
                  <span className="block">{line.issueMessage}</span>
                )}
              </li>
            ))}
          </ul>
          <Link href="/cart" className={cn(statusButton, "mt-6 w-full")}>
            Retour au panier
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Finaliser la commande
      </h1>

      {pendingOrderId && (
        <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          Vous avez une commande en attente de paiement.{" "}
          <Link
            href={`/checkout/confirmation/${encodeURIComponent(pendingOrderId)}`}
            className="font-semibold underline"
          >
            La reprendre
          </Link>
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div className="order-2 space-y-6 lg:order-1">
          <section
            aria-labelledby="delivery-title"
            className="rounded-3xl border border-line bg-white p-5 md:p-6"
          >
            <h2
              id="delivery-title"
              className="font-display text-lg font-extrabold tracking-tight"
            >
              Adresse de livraison
            </h2>
            <div className="mt-4">
              <AddressPicker
                value={addressId}
                onChange={(id) => {
                  setChosenAddress(id);
                  setAddressError(null);
                }}
                error={addressError}
              />
            </div>
          </section>

          <section
            aria-labelledby="payment-title"
            className="rounded-3xl border border-line bg-white p-5 md:p-6"
          >
            <h2
              id="payment-title"
              className="font-display text-lg font-extrabold tracking-tight"
            >
              Paiement Mobile Money
            </h2>
            <div className="mt-4">
              <PaymentForm
                amount={cart.total}
                defaultPhone={user?.phone ?? ""}
                pending={pending}
                error={error}
                onSubmit={({ provider, phone }) => {
                  if (!addressId) {
                    setAddressError(
                      "Choisissez ou ajoutez une adresse de livraison."
                    );
                    return;
                  }

                  pay({ provider, phone, addressId });
                }}
              />
            </div>
          </section>
        </div>

        <div className="order-1 lg:order-2">
          <CheckoutSummary cart={cart} />
        </div>
      </div>
    </div>
  );
}
