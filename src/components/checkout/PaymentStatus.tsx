"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Ban, RefreshCw, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PaymentForm } from "@/components/checkout/PaymentForm";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StatusPanel, statusButton } from "@/components/feedback/StatusPanel";
import { useSession } from "@/features/authentication/session.store";
import { forgetOrder } from "@/features/checkout/pending-order";
import { derivePhase, orderReference, remainingPayment } from "@/features/checkout/orderState";
import { useOrder } from "@/features/checkout/useOrder";
import { usePayment } from "@/features/checkout/usePayment";
import { cn, formatUsd } from "@/lib/utils";
import { ApiError, errorMessage } from "@/services/api/errors";

export function PaymentStatus({ orderId }: { orderId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useSession((s) => s.user);
  const { data: order, error, isLoading, isFetching, refetch } = useOrder(orderId);
  const { pay, pending, error: payError } = usePayment();

  const phase = order ? derivePhase(order) : null;

  // Commande terminée (payée ou annulée) : plus rien à reprendre dans cet onglet.
  useEffect(() => {
    if (phase === "paid" || phase === "cancelled") forgetOrder();
  }, [phase]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10" aria-busy="true" aria-label="Chargement de la commande">
        <div className="skeleton h-80 rounded-3xl bg-ink/[0.06]" />
      </div>
    );
  }
  if (error) {
    if (error instanceof ApiError && error.kind === "not_found") {
      return (
        <EmptyState
          title="Commande introuvable"
          message="Cette commande n'existe pas ou ne vous appartient pas."
          actionLabel="Voir mon compte"
          onAction={() => router.push("/account")}
        />
      );
    }
    return <ErrorState title="Impossible de charger la commande" message={errorMessage(error)} onRetry={() => refetch()} />;
  }
  if (!order || !phase) return null;

  const reference = orderReference(order.id);
  const remaining = phase === "partial" ? remainingPayment(order) : null;

  const retryForm = (amount: string, paymentType: "FULL" | "PRODUCT" | "SHIPPING", label?: string) => (
    <div className="mt-6 text-left">
      <PaymentForm
        amount={amount}
        defaultPhone={user?.phone ?? ""}
        pending={pending}
        error={payError}
        submitLabel={label}
        onSubmit={({ provider, phone }) => pay({ orderId: order.id, provider, phone, paymentType }).then(() => queryClient.invalidateQueries({ queryKey: ["order", order.id] }))}
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-xl px-4 py-8 md:py-12">
      <div className="rounded-3xl border border-line bg-white p-6 shadow-[0_12px_32px_-22px_rgb(15_17_21/0.3)] md:p-8">
        {phase === "paid" && (
          <StatusPanel
            tone="success"
            title="Paiement confirmé"
            action={
              <Link href={`/account/orders/${encodeURIComponent(order.id)}`} className={statusButton}>
                Suivre ma commande
              </Link>
            }
          >
            Merci ! Votre commande <strong className="text-ink">{reference}</strong> est confirmée. Nous vous tiendrons informé de sa livraison.
          </StatusPanel>
        )}

        {phase === "waiting" && (
          <StatusPanel
            tone="info"
            icon={Smartphone}
            title="Confirmez sur votre téléphone"
            action={
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-semibold motion-safe:transition-colors hover:bg-surface disabled:opacity-60 motion-safe:active:scale-95"
              >
                <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} aria-hidden /> Vérifier maintenant
              </button>
            }
          >
            <p>Une demande de paiement de {formatUsd(order.totalAmount)} vient d&apos;être envoyée à votre téléphone. Validez-la avec votre code secret Mobile Money.</p>
            <p className="mt-2">Cette page se met à jour toute seule. Vous pouvez aussi la fermer : le paiement sera pris en compte automatiquement.</p>
          </StatusPanel>
        )}

        {phase === "failed" && (
          <>
            <StatusPanel tone="error" title="Le paiement n'a pas abouti">
              Aucun montant n&apos;a été retenu pour la commande <strong className="text-ink">{reference}</strong>. Vérifiez votre solde et votre numéro, puis réessayez.
            </StatusPanel>
            {retryForm(order.totalAmount, "FULL", "Réessayer le paiement")}
          </>
        )}

        {phase === "payable" && (
          <>
            <StatusPanel tone="info" title="Paiement à lancer">
              Votre commande <strong className="text-ink">{reference}</strong> est enregistrée, mais le paiement n&apos;a pas encore démarré.
            </StatusPanel>
            {retryForm(order.totalAmount, "FULL")}
          </>
        )}

        {phase === "partial" && (
          <>
            <StatusPanel tone="info" title="Paiement partiel reçu">
              Il reste à régler une partie de la commande <strong className="text-ink">{reference}</strong>.
            </StatusPanel>
            {remaining ? (
              retryForm(remaining.amount, remaining.type, `Payer le reste (${formatUsd(remaining.amount)})`)
            ) : (
              <p className="mt-4 text-center text-sm text-muted">Contactez-nous pour finaliser le paiement de cette commande.</p>
            )}
          </>
        )}

        {phase === "cancelled" && (
          <StatusPanel
            tone="error"
            icon={Ban}
            title="Commande annulée"
            action={
              <Link href="/products" className={statusButton}>
                Reprendre mes achats
              </Link>
            }
          >
            La commande <strong className="text-ink">{reference}</strong> a été annulée, faute de paiement dans le délai prévu. Aucun montant n&apos;a été retenu.
          </StatusPanel>
        )}

        <dl className="mt-8 grid grid-cols-2 gap-3 border-t border-line pt-5 text-sm">
          <div>
            <dt className="text-muted">Commande</dt>
            <dd className="font-semibold">{reference}</dd>
          </div>
          <div className="text-right">
            <dt className="text-muted">Total</dt>
            <dd className="font-display text-lg font-extrabold tabular-nums text-brand-600">{formatUsd(order.totalAmount)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}