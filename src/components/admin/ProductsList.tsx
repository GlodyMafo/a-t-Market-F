"use client";

import { Package, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin/Modal";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Pagination } from "@/components/products/Pagination";
import { useAdminProducts, useCatalogMutations } from "@/features/admin/catalog-hooks";
import { sumMoney } from "@/lib/money";
import { cn, formatUsd, resolveImageUrl } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";
import type { AdminProduct } from "@/types/adminCatalog";

export function ProductsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isPlaceholderData, error, refetch } = useAdminProducts(page);
  const { toggleProduct, deleteProduct } = useCatalogMutations();
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);

  function toggle(product: AdminProduct) {
    toggleProduct.mutate(product.id, {
      onSuccess: (updated) => toast.success(updated.isActive ? "Produit activé." : "Produit désactivé (invisible pour les clients)."),
      onError: (failure) => toast.error(errorMessage(failure)),
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Produits</h1>
          <p className="mt-1 text-sm text-muted">Produits locaux, les plus récents d&apos;abord.</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600">
          <Plus className="h-4 w-4" aria-hidden /> Nouveau produit
        </Link>
      </div>

      {isLoading && <div className="skeleton mt-5 h-72 rounded-3xl bg-ink/[0.06]" aria-busy="true" aria-label="Chargement des produits" />}
      {error && <ErrorState title="Impossible de charger les produits" message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && data.items.length === 0 && <p className="mt-6 rounded-3xl bg-white p-8 text-center text-sm text-muted">Aucun produit pour l&apos;instant.</p>}

      {data && data.items.length > 0 && (
        <>
          <div className={cn("mt-5 overflow-x-auto rounded-3xl bg-white", isPlaceholderData && "opacity-60 motion-safe:transition-opacity")}>
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Produit</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Prix client</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Stock</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Statut</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((product) => {
                  const image = resolveImageUrl([...product.images].sort((a, b) => a.position - b.position)[0]?.imageUrl);
                  const stock = product.inventory?.quantity ?? 0;
                  return (
                    <tr key={product.id} className="hover:bg-surface">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface">
                            {image ? <Image src={image} alt="" fill unoptimized sizes="48px" className="object-cover" /> : <span className="flex h-full items-center justify-center text-muted"><Package className="h-4 w-4" aria-hidden /></span>}
                          </span>
                          <Link href={`/admin/products/${encodeURIComponent(product.id)}`} className="line-clamp-2 max-w-[18rem] font-semibold hover:text-brand-600 hover:underline">
                            {product.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold tabular-nums">{formatUsd(sumMoney([String(product.price), String(product.margin)]))}</p>
                        <p className="text-xs text-muted">Achat {formatUsd(product.price)} · marge {formatUsd(product.margin)}</p>
                      </td>
                      <td className={cn("px-4 py-3 font-semibold tabular-nums", stock === 0 && "text-sale")}>{stock === 0 ? "Rupture" : stock}</td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", product.isActive ? "bg-green-100 text-green-800" : "bg-surface text-muted")}>
                          {product.isActive ? "Actif" : "Désactivé"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <Link href={`/admin/products/${encodeURIComponent(product.id)}`} className="min-h-9 rounded-full border border-line px-3 text-xs font-semibold leading-9 hover:bg-surface">
                            Modifier
                          </Link>
                          <button type="button" onClick={() => toggle(product)} disabled={toggleProduct.isPending} className="min-h-9 rounded-full border border-line px-3 text-xs font-semibold hover:bg-surface disabled:opacity-50">
                            {product.isActive ? "Désactiver" : "Activer"}
                          </button>
                          <button type="button" onClick={() => setDeleting(product)} className="min-h-9 rounded-full border border-red-200 px-3 text-xs font-semibold text-sale hover:bg-red-50">
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={(next) => { setPage(next); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        </>
      )}

      <Modal open={deleting !== null} onClose={() => !deleteProduct.isPending && setDeleting(null)} title="Supprimer le produit">
        {deleting && (
          <div className="space-y-4">
            <p className="text-sm">
              Supprimer <strong>{deleting.name}</strong> ? S&apos;il figure déjà dans des commandes, il ne sera pas supprimé mais <strong>désactivé</strong> (invisible pour les clients). Il sera retiré des paniers.
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setDeleting(null)} disabled={deleteProduct.isPending} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold hover:bg-surface">
                Annuler
              </button>
              <button
                type="button"
                disabled={deleteProduct.isPending}
                onClick={() =>
                  deleteProduct.mutate(deleting.id, {
                    onSuccess: (result) => {
                      (result.deleted ? toast.success : toast.info)(result.message);
                      setDeleting(null);
                    },
                    onError: (failure) => toast.error(errorMessage(failure)),
                  })
                }
                className="min-h-11 rounded-full bg-sale px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {deleteProduct.isPending ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}