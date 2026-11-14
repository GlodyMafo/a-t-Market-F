"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal } from "@/components/admin/Modal";
import { FormAlert } from "@/components/forms/FormAlert";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { TextField } from "@/components/forms/TextField";
import { useAdminMutations, useQuoteHistory } from "@/features/admin/hooks";
import { approveSchema, rejectSchema, type ApproveValues, type RejectValues } from "@/features/admin/schemas";
import { formatDateTime, formatUsd } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";
import type { PendingQuote } from "@/types/admin";

interface DialogProps {
  quote: PendingQuote | null;
  onClose: () => void;
}

export function ApproveDialog({ quote, onClose }: DialogProps) {
  return (
    <Modal open={quote !== null} onClose={onClose} title="Approuver le devis">
      {quote && <ApproveForm quote={quote} onClose={onClose} />}
    </Modal>
  );
}

function ApproveForm({ quote, onClose }: { quote: PendingQuote; onClose: () => void }) {
  const { approve } = useAdminMutations();
  const weightKnown = quote.productWeight !== null;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ApproveValues>({ resolver: zodResolver(approveSchema), defaultValues: { weightKg: "", adminNotes: "" } });

  function onSubmit(values: ApproveValues) {
    if (!weightKnown && values.weightKg === "") {
      setError("weightKg", { message: "Le poids est obligatoire : ce devis n'en a pas." });
      return;
    }
    approve.mutate(
      {
        quoteId: quote.id,
        weightKg: values.weightKg === "" ? undefined : Number(values.weightKg.replace(",", ".")),
        adminNotes: values.adminNotes || undefined,
      },
      {
        onSuccess: (updated) => {
          toast.success(`Devis approuvé : ${formatUsd(updated.totalPrice)} pour le client.`);
          onClose();
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="text-sm text-muted">
        <strong className="text-ink">{quote.productName ?? "Produit importé"}</strong>
        <br />
        Le prix est recalculé par le système avec le poids indiqué et les réglages actuels ; l&apos;ancien devis reste dans l&apos;historique.
      </p>
      {approve.error && <FormAlert>{errorMessage(approve.error)}</FormAlert>}

      <TextField
        label={weightKnown ? `Poids en kg (facultatif, actuel : ${quote.productWeight} kg)` : "Poids du produit en kg (obligatoire)"}
        type="text"
        inputMode="decimal"
        placeholder="Ex. 1,25"
        error={errors.weightKg?.message}
        hint="Pesée ou poids de la fiche. Précision au centième de kilo."
        {...register("weightKg")}
      />
      <TextAreaField label="Note interne (facultative)" error={errors.adminNotes?.message} {...register("adminNotes")} />

      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onClose} disabled={approve.isPending} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold hover:bg-surface">
          Annuler
        </button>
        <button type="submit" disabled={approve.isPending} className="min-h-11 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {approve.isPending ? "Validation…" : "Approuver"}
        </button>
      </div>
    </form>
  );
}

export function RejectDialog({ quote, onClose }: DialogProps) {
  return (
    <Modal open={quote !== null} onClose={onClose} title="Rejeter le devis">
      {quote && <RejectForm quote={quote} onClose={onClose} />}
    </Modal>
  );
}

function RejectForm({ quote, onClose }: { quote: PendingQuote; onClose: () => void }) {
  const { reject } = useAdminMutations();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectValues>({ resolver: zodResolver(rejectSchema), defaultValues: { adminNotes: "" } });

  return (
    <form
      onSubmit={handleSubmit((values) =>
        reject.mutate(
          { quoteId: quote.id, adminNotes: values.adminNotes },
          {
            onSuccess: () => {
              toast.success("Devis rejeté.");
              onClose();
            },
          },
        ),
      )}
      noValidate
      className="space-y-4"
    >
      <p className="text-sm text-muted">
        <strong className="text-ink">{quote.productName ?? "Produit importé"}</strong>
        <br />
        Le motif est <strong>visible par le client</strong> et conservé dans l&apos;historique.
      </p>
      {reject.error && <FormAlert>{errorMessage(reject.error)}</FormAlert>}
      <TextAreaField label="Motif du rejet" error={errors.adminNotes?.message} {...register("adminNotes")} />
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onClose} disabled={reject.isPending} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold hover:bg-surface">
          Annuler
        </button>
        <button type="submit" disabled={reject.isPending} className="min-h-11 rounded-full bg-sale px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
          {reject.isPending ? "Envoi…" : "Rejeter"}
        </button>
      </div>
    </form>
  );
}

export function HistoryDialog({ quote, onClose }: DialogProps) {
  return (
    <Modal open={quote !== null} onClose={onClose} title="Historique du devis" wide>
      {quote && <HistoryList quoteId={quote.id} />}
    </Modal>
  );
}

function totalOf(snapshot: unknown): string | null {
  const total = (snapshot as { totalPrice?: unknown } | null)?.totalPrice;
  return typeof total === "string" || typeof total === "number" ? String(total) : null;
}

function HistoryList({ quoteId }: { quoteId: string }) {
  const { data, isLoading, error } = useQuoteHistory(quoteId, true);
  if (isLoading) return <div className="skeleton h-24 rounded-2xl bg-ink/[0.06]" aria-busy="true" />;
  if (error) return <FormAlert>{errorMessage(error)}</FormAlert>;
  if (!data || data.length === 0) return <p className="text-sm text-muted">Aucune décision enregistrée pour ce devis.</p>;
  return (
    <ol className="space-y-3">
      {data.map((revision) => {
        const before = totalOf(revision.snapshotBefore);
        const after = totalOf(revision.snapshotAfter);
        return (
          <li key={revision.id} className="rounded-2xl bg-surface p-4 text-sm">
            <p className="font-semibold">{revision.action === "APPROVED" ? "Approuvé" : revision.action === "REJECTED" ? "Rejeté" : revision.action}</p>
            <p className="text-xs text-muted">
              {formatDateTime(revision.createdAt)}
              {revision.admin ? ` · ${revision.admin.email}` : ""}
            </p>
            {before && after && (
              <p className="mt-1 text-xs">
                Total : {formatUsd(before)} → <strong>{formatUsd(after)}</strong>
              </p>
            )}
            {revision.note && <p className="mt-1">{revision.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}