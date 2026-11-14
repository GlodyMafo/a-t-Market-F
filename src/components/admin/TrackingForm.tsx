"use client";

import { useState } from "react";
import { FormAlert } from "@/components/forms/FormAlert";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { Modal } from "@/components/admin/Modal";
import { useAdminMutations } from "@/features/admin/hooks";
import { TRACKING_LABELS } from "@/features/orders/status";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";
import type { AdminOrderDetail } from "@/types/admin";
import type { TrackingStatus } from "@/types/enums";

export function TrackingForm({ order }: { order: AdminOrderDetail }) {
  const { addTracking } = useAdminMutations();
  const [status, setStatus] = useState<TrackingStatus | "">("");
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);

  const allowed = order.allowedNextStatuses;
  const chosen = status || (allowed.length === 1 ? allowed[0] : "");

  function submit() {
    if (!chosen) return;
    addTracking.mutate(
      { orderId: order.id, status: chosen, message: message.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`Suivi mis à jour : ${TRACKING_LABELS[chosen]}. Le client a été prévenu.`);
          setConfirming(false);
          setStatus("");
          setMessage("");
        },
      },
    );
  }

  return (
    <section aria-labelledby="tracking-form-title" className="rounded-3xl border border-line bg-white p-5">
      <h2 id="tracking-form-title" className="font-display text-lg font-extrabold tracking-tight">
        Mettre à jour le suivi
      </h2>

      {allowed.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-surface p-3 text-sm text-muted">
          {order.status === "PAID"
            ? "Le suivi de cette commande est terminé : aucune étape supplémentaire n'est possible."
            : "Le suivi ne peut être mis à jour qu'une fois la commande entièrement payée."}
        </p>
      ) : (
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (chosen) setConfirming(true);
          }}
        >
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Prochaine étape</legend>
            <div className="space-y-2">
              {allowed.map((option) => (
                <label
                  key={option}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 text-sm font-semibold focus-within:ring-2 focus-within:ring-brand-500",
                    chosen === option ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line hover:border-brand-200",
                  )}
                >
                  <input type="radio" name="next-status" value={option} checked={chosen === option} onChange={() => setStatus(option)} className="sr-only" />
                  {TRACKING_LABELS[option]}
                </label>
              ))}
            </div>
          </fieldset>

          <TextAreaField
            label="Message pour le client (facultatif)"
            value={message}
            maxLength={500}
            onChange={(event) => setMessage(event.target.value)}
            hint={`${message.length}/500 · affiché dans le suivi du client`}
          />

          <button
            type="submit"
            disabled={!chosen}
            className="min-h-12 w-full rounded-full bg-brand-500 px-6 text-sm font-semibold text-white motion-safe:transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 motion-safe:active:scale-95"
          >
            Enregistrer l&apos;étape
          </button>
        </form>
      )}

      <Modal open={confirming} onClose={() => !addTracking.isPending && setConfirming(false)} title="Confirmer l'étape">
        {chosen && (
          <div className="space-y-4">
            <p className="text-sm">
              Le suivi passera à <strong>{TRACKING_LABELS[chosen]}</strong> et le client sera prévenu par notification. Cette action ne peut pas être annulée.
            </p>
            {message.trim() && <p className="rounded-2xl bg-surface p-3 text-sm">« {message.trim()} »</p>}
            {addTracking.error && <FormAlert>{errorMessage(addTracking.error)}</FormAlert>}
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setConfirming(false)} disabled={addTracking.isPending} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold hover:bg-surface">
                Annuler
              </button>
              <button type="button" onClick={submit} disabled={addTracking.isPending} className="min-h-11 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
                {addTracking.isPending ? "Enregistrement…" : "Confirmer"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}