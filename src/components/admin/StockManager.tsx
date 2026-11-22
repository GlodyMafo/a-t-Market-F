"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Package } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Modal } from "@/components/admin/Modal";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormAlert } from "@/components/forms/FormAlert";
import { TextField } from "@/components/forms/TextField";
import { Pagination } from "@/components/products/Pagination";
import { LOW_STOCK_NOTICE } from "@/constants/catalog";
import { useAdminInventory, useCatalogMutations, useMovements } from "@/features/admin/catalog-hooks";
import { cn, formatDateTime, resolveImageUrl } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";
import type { InventoryRow } from "@/types/adminCatalog";

type Mode = { kind: "set" | "restock" | "history"; row: InventoryRow } | null;

const setSchema = z.object({ quantity: z.string().trim().regex(/^\d{1,6}$/, "Un nombre entier, 0 ou plus") });
const restockSchema = z.object({
  quantity: z.string().trim().regex(/^[1-9]\d{0,5}$/, "Un nombre entier supérieur à 0"),
  reason: z.string().trim().max(200, "200 caractères au maximum"),
});

const MOVEMENT_LABEL: Record<string, string> = { IN: "Entrée", OUT: "Sortie" };

export function StockManager() {
  const [page, setPage] = useState(1);
  const [onlyOut, setOnlyOut] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const { data, isLoading, isPlaceholderData, error, refetch } = useAdminInventory(page);

  const rows = (data?.items ?? []).filter((row) => !onlyOut || row.quantity === 0);
  const close = () => setMode(null);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Stock</h1>
      <p className="mt-1 text-sm text-muted">Quantités des produits locaux. Un produit à 0 est invisible pour les clients.</p>

      <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={onlyOut} onChange={(event) => setOnlyOut(event.target.checked)} className="h-4 w-4 accent-brand-500" />
        Afficher uniquement les ruptures <span className="text-xs text-muted">(parmi les produits de cette page)</span>
      </label>

      {isLoading && <div className="skeleton mt-4 h-72 rounded-3xl bg-ink/[0.06]" aria-busy="true" aria-label="Chargement du stock" />}
      {error && <ErrorState title="Impossible de charger le stock" message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && rows.length === 0 && <p className="mt-4 rounded-3xl bg-white p-8 text-center text-sm text-muted">{onlyOut ? "Aucune rupture sur cette page." : "Aucun produit."}</p>}

      {rows.length > 0 && (
        <div className={cn("mt-4 overflow-x-auto rounded-3xl bg-white", isPlaceholderData && "opacity-60 motion-safe:transition-opacity")}>
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Produit</th>
                <th scope="col" className="px-4 py-3 font-semibold">Quantité</th>
                <th scope="col" className="px-4 py-3 font-semibold">Dernière mise à jour</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => {
                const image = resolveImageUrl([...row.product.images].sort((a, b) => a.position - b.position)[0]?.imageUrl);
                const out = row.quantity === 0;
                const low = !out && row.quantity <= LOW_STOCK_NOTICE;
                return (
                  <tr key={row.id} className="hover:bg-surface">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-surface">
                          {image ? <Image src={image} alt="" fill unoptimized sizes="40px" className="object-cover" /> : <span className="flex h-full items-center justify-center text-muted"><Package className="h-4 w-4" aria-hidden /></span>}
                        </span>
                        <span className="line-clamp-2 max-w-[18rem] font-semibold">{row.product.name}</span>
                        {!row.product.isActive && <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-muted">Désactivé</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold tabular-nums", out ? "bg-red-50 text-sale" : low ? "bg-amber-100 text-amber-900" : "bg-green-100 text-green-800")}>
                        {out ? "Rupture" : row.quantity}
                      </span>
                      {low && <span className="ml-2 text-xs text-muted">stock faible</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{formatDateTime(row.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button type="button" onClick={() => setMode({ kind: "restock", row })} className="min-h-9 rounded-full bg-brand-500 px-3 text-xs font-semibold text-white hover:bg-brand-600">
                          Réapprovisionner
                        </button>
                        <button type="button" onClick={() => setMode({ kind: "set", row })} className="min-h-9 rounded-full border border-line px-3 text-xs font-semibold hover:bg-surface">
                          Corriger
                        </button>
                        <button type="button" onClick={() => setMode({ kind: "history", row })} className="min-h-9 rounded-full px-3 text-xs font-semibold text-muted hover:bg-surface">
                          Mouvements
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={(next) => { setPage(next); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}

      <Modal open={mode?.kind === "set"} onClose={close} title="Corriger le stock">
        {mode?.kind === "set" && <SetForm row={mode.row} onDone={close} />}
      </Modal>
      <Modal open={mode?.kind === "restock"} onClose={close} title="Réapprovisionner">
        {mode?.kind === "restock" && <RestockForm row={mode.row} onDone={close} />}
      </Modal>
      <Modal open={mode?.kind === "history"} onClose={close} title="Mouvements de stock" wide>
        {mode?.kind === "history" && <History row={mode.row} />}
      </Modal>
    </div>
  );
}

function SetForm({ row, onDone }: { row: InventoryRow; onDone: () => void }) {
  const { setStock } = useCatalogMutations();
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof setSchema>>({ resolver: zodResolver(setSchema), defaultValues: { quantity: String(row.quantity) } });
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        setStock.mutate({ productId: row.productId, quantity: Number(values.quantity) }, { onSuccess: () => { toast.success("Stock corrigé."); onDone(); } }),
      )}
    >
      <p className="text-sm text-muted"><strong className="text-ink">{row.product.name}</strong> : le stock devient exactement la quantité saisie (actuellement {row.quantity}). L&apos;écart est enregistré dans les mouvements.</p>
      {setStock.error && <FormAlert>{errorMessage(setStock.error)}</FormAlert>}
      <TextField label="Nouvelle quantité" inputMode="numeric" error={errors.quantity?.message} {...register("quantity")} />
      <DialogButtons pending={setStock.isPending} onCancel={onDone} label="Enregistrer" />
    </form>
  );
}

function RestockForm({ row, onDone }: { row: InventoryRow; onDone: () => void }) {
  const { restock } = useCatalogMutations();
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof restockSchema>>({ resolver: zodResolver(restockSchema), defaultValues: { quantity: "", reason: "" } });
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        restock.mutate({ productId: row.productId, quantity: Number(values.quantity), reason: values.reason || undefined }, { onSuccess: () => { toast.success("Stock mis à jour."); onDone(); } }),
      )}
    >
      <p className="text-sm text-muted"><strong className="text-ink">{row.product.name}</strong> : la quantité saisie s&apos;ajoute au stock actuel ({row.quantity}).</p>
      {restock.error && <FormAlert>{errorMessage(restock.error)}</FormAlert>}
      <TextField label="Quantité reçue" inputMode="numeric" error={errors.quantity?.message} {...register("quantity")} />
      <TextField label="Motif (facultatif)" placeholder="Ex. Livraison fournisseur" error={errors.reason?.message} {...register("reason")} />
      <DialogButtons pending={restock.isPending} onCancel={onDone} label="Ajouter au stock" />
    </form>
  );
}

function DialogButtons({ pending, onCancel, label }: { pending: boolean; onCancel: () => void; label: string }) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <button type="button" onClick={onCancel} disabled={pending} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold hover:bg-surface">Annuler</button>
      <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">{pending ? "Enregistrement…" : label}</button>
    </div>
  );
}

function History({ row }: { row: InventoryRow }) {
  const { data, isLoading, error } = useMovements(row.productId, true);
  if (isLoading) return <div className="skeleton h-24 rounded-2xl bg-ink/[0.06]" aria-busy="true" />;
  if (error) return <FormAlert>{errorMessage(error)} L&apos;historique nécessite le correctif backend « mouvements de stock ».</FormAlert>;
  if (!data || data.length === 0) return <p className="text-sm text-muted">Aucun mouvement enregistré pour ce produit.</p>;
  return (
    <div>
      <p className="mb-3 text-sm font-semibold">{row.product.name} <span className="font-normal text-muted">(50 derniers mouvements)</span></p>
      <ul className="divide-y divide-line">
        {data.map((movement) => (
          <li key={movement.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <div className="min-w-0">
              <p className="font-semibold">{MOVEMENT_LABEL[movement.type] ?? movement.type}</p>
              <p className="truncate text-xs text-muted">{movement.reason ?? "—"} · {formatDateTime(movement.createdAt)}</p>
            </div>
            <p className={cn("font-bold tabular-nums", movement.type === "IN" ? "text-green-700" : "text-ink")}>{movement.type === "IN" ? "+" : movement.type === "OUT" ? "−" : ""}{movement.quantity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}