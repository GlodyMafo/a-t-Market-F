"use client";

import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin/Modal";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormAlert } from "@/components/forms/FormAlert";
import { TextField } from "@/components/forms/TextField";
import { useAdminSettings, useCatalogMutations } from "@/features/admin/catalog-hooks";
import { errorMessage } from "@/services/api/errors";
import type { AdminSettings } from "@/types/adminCatalog";

interface Field {
  key: keyof AdminSettings;
  label: string;
  hint: string;
  min: number;
  max: number;
  exclusiveMin?: boolean;
  optional?: boolean;
}

// Bornes identiques à celles du backend.
const FIELDS: Field[] = [
  { key: "commissionRate", label: "Commission A&T (%)", hint: "Pourcentage ajouté au prix du produit. De 0 à 100.", min: 0, max: 100 },
  { key: "chinaPricePerKg", label: "Transport et douane ($ par kg)", hint: "Tarif au kilo, douane incluse. Jusqu'à 500.", min: 0, max: 500, exclusiveMin: true },
  { key: "fixedFee", label: "Frais fixes par commande ($)", hint: "Ajoutés une seule fois par produit importé. De 0 à 1 000.", min: 0, max: 1000 },
  { key: "aedToUsdRate", label: "Taux AED → USD", hint: "Dollars obtenus pour 1 dirham (NOON). Jusqu'à 10.", min: 0, max: 10, exclusiveMin: true },
  { key: "cnyToUsdRate", label: "Taux CNY → USD", hint: "Dollars obtenus pour 1 yuan (1688). Jusqu'à 10.", min: 0, max: 10, exclusiveMin: true },
];
const CAP_FIELD: Field = { key: "autoApproveMaxUsd", label: "Plafond de validation manuelle ($)", hint: "Au-delà de ce total, un devis est vérifié par l'équipe. Vide : aucun plafond.", min: 0, max: 100000, exclusiveMin: true, optional: true };

const asText = (value: string | number | null | undefined) => (value === null || value === undefined ? "" : String(value));

export function SettingsForm() {
  const { data, isLoading, error, refetch } = useAdminSettings();
  if (isLoading) return <div className="skeleton h-96 rounded-3xl bg-ink/[0.06]" aria-busy="true" aria-label="Chargement des réglages" />;
  if (error) return <ErrorState title="Impossible de charger les réglages" message={errorMessage(error)} onRetry={() => refetch()} />;
  if (!data) return null;
  return <Editor key={JSON.stringify(data)} settings={data} />;
}

function Editor({ settings }: { settings: AdminSettings }) {
  const { updateSettings } = useCatalogMutations();
  const fields = useMemo(() => ("autoApproveMaxUsd" in settings ? [...FIELDS, CAP_FIELD] : FIELDS), [settings]);
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.key, asText(settings[f.key])])));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);

  const missingRates = ([["aedToUsdRate", "AED (NOON)"], ["cnyToUsdRate", "CNY (1688)"]] as const).filter(([key]) => asText(settings[key]) === "");

  function parse(field: Field, raw: string): { value: number | null; error?: string } {
    const text = raw.trim().replace(",", ".");
    if (text === "") return field.optional ? { value: null } : { value: null, error: "Obligatoire" };
    const n = Number(text);
    if (!Number.isFinite(n)) return { value: null, error: "Nombre invalide" };
    if (field.exclusiveMin ? n <= field.min : n < field.min) return { value: null, error: field.exclusiveMin ? `Doit être supérieur à ${field.min}` : `Minimum ${field.min}` };
    if (n > field.max) return { value: null, error: `Maximum ${field.max}` };
    return { value: n };
  }

  // Seuls les réglages modifiés sont envoyés.
  const changes = fields.flatMap((field) => {
    const current = asText(settings[field.key]);
    const raw = values[field.key] ?? "";
    if (raw.trim().replace(",", ".") === current.trim()) return [];
    const parsed = parse(field, raw);
    return [{ field, parsed }];
  });

  function review() {
    const nextErrors: Record<string, string> = {};
    for (const { field, parsed } of changes) if (parsed.error) nextErrors[field.key] = parsed.error;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (changes.length === 0) {
      toast.info("Aucun réglage modifié.");
      return;
    }
    setConfirming(true);
  }

  function save() {
    const body = Object.fromEntries(changes.map(({ field, parsed }) => [field.key, parsed.value]));
    updateSettings.mutate(body, {
      onSuccess: () => {
        toast.success("Réglages enregistrés.");
        setConfirming(false);
      },
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Réglages des prix</h1>
      <p className="mt-1 text-sm text-muted">Ces valeurs servent au calcul des devis importés.</p>

      {missingRates.length > 0 && (
        <p role="status" className="mt-5 flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Taux non configuré{missingRates.length > 1 ? "s" : ""} : {missingRates.map(([, label]) => label).join(", ")}. Sans ce taux, les devis dans cette devise ne peuvent pas être calculés.
          </span>
        </p>
      )}

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          review();
        }}
        className="mt-5 space-y-5 rounded-3xl border border-line bg-white p-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              inputMode="decimal"
              hint={field.hint}
              value={values[field.key] ?? ""}
              error={errors[field.key]}
              onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
            />
          ))}
        </div>
        <button type="submit" className="min-h-12 w-full rounded-full bg-brand-500 px-6 text-sm font-semibold text-white motion-safe:transition hover:bg-brand-600 motion-safe:active:scale-95 sm:w-auto">
          Enregistrer les réglages
        </button>
      </form>

      <Modal open={confirming} onClose={() => !updateSettings.isPending && setConfirming(false)} title="Confirmer les changements">
        <div className="space-y-4">
          <ul className="divide-y divide-line rounded-2xl bg-surface text-sm">
            {changes.map(({ field, parsed }) => (
              <li key={field.key} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span>{field.label}</span>
                <span className="tabular-nums">
                  <span className="text-muted">{asText(settings[field.key]) || "—"}</span> → <strong>{parsed.value ?? "aucun"}</strong>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">Ces réglages s&apos;appliquent aux <strong className="text-ink">nouveaux devis</strong> ; les devis déjà créés conservent leurs prix.</p>
          {updateSettings.error && <FormAlert>{errorMessage(updateSettings.error)}</FormAlert>}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => setConfirming(false)} disabled={updateSettings.isPending} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold hover:bg-surface">Annuler</button>
            <button type="button" onClick={save} disabled={updateSettings.isPending} className="min-h-11 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">{updateSettings.isPending ? "Enregistrement…" : "Confirmer"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}