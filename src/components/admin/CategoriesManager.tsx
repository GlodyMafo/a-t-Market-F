"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Modal } from "@/components/admin/Modal";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormAlert } from "@/components/forms/FormAlert";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { TextField } from "@/components/forms/TextField";
import { useAdminCategories, useCatalogMutations } from "@/features/admin/catalog-hooks";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";
import type { AdminCategory, AdminSubCategory } from "@/types/adminCatalog";

const schema = z.object({
  name: z.string().trim().min(1, "Le nom est obligatoire").max(100, "100 caractères au maximum").refine((v) => /[\p{L}\p{N}]/u.test(v), "Le nom doit contenir une lettre ou un chiffre"),
  description: z.string().trim().max(500, "500 caractères au maximum"),
});
type Values = z.infer<typeof schema>;

type Dialog =
  | { kind: "category"; category?: AdminCategory }
  | { kind: "subcategory"; categoryId: string; sub?: AdminSubCategory }
  | { kind: "confirm"; target: { type: "category" | "sub"; id: string; name: string } }
  | null;

function Switch({ checked, onChange, label, busy }: { checked: boolean; onChange: () => void; label: string; busy?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={busy}
      onClick={onChange}
      className={cn("relative h-7 w-12 shrink-0 rounded-full motion-safe:transition-colors disabled:opacity-60", checked ? "bg-brand-500" : "bg-ink/20")}
    >
      <span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow motion-safe:transition-all", checked ? "left-[1.4rem]" : "left-0.5")} />
    </button>
  );
}

export function CategoriesManager() {
  const { data, isLoading, error, refetch } = useAdminCategories();
  const m = useCatalogMutations();
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);

  function toggleCategory(category: AdminCategory) {
    if (category.isActive) return setDialog({ kind: "confirm", target: { type: "category", id: category.id, name: category.name } });
    m.setCategoryActive.mutate({ id: category.id, isActive: true }, { onSuccess: () => toast.success("Catégorie activée."), onError: (e) => toast.error(errorMessage(e)) });
  }
  function toggleSub(sub: AdminSubCategory) {
    if (sub.isActive) return setDialog({ kind: "confirm", target: { type: "sub", id: sub.id, name: sub.name } });
    m.setSubCategoryActive.mutate({ id: sub.id, isActive: true }, { onSuccess: () => toast.success("Sous-catégorie activée."), onError: (e) => toast.error(errorMessage(e)) });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Catégories</h1>
          <p className="mt-1 text-sm text-muted">Désactiver une catégorie ou une sous-catégorie masque ses produits aux clients.</p>
        </div>
        <button type="button" onClick={() => setDialog({ kind: "category" })} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600">
          <Plus className="h-4 w-4" aria-hidden /> Nouvelle catégorie
        </button>
      </div>

      {isLoading && <div className="skeleton mt-5 h-60 rounded-3xl bg-ink/[0.06]" aria-busy="true" aria-label="Chargement des catégories" />}
      {error && <ErrorState title="Impossible de charger les catégories" message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && data.length === 0 && <p className="mt-6 rounded-3xl bg-white p-8 text-center text-sm text-muted">Aucune catégorie. Créez-en une pour pouvoir ajouter des produits.</p>}

      <ul className="mt-5 space-y-4">
        {data?.map((category) => (
          <li key={category.id} className="rounded-3xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={cn("font-display text-lg font-extrabold tracking-tight", !category.isActive && "text-muted")}>
                  {category.name} {!category.isActive && <span className="ml-1 rounded-full bg-surface px-2 py-0.5 align-middle text-[11px] font-bold">Désactivée</span>}
                </p>
                {category.description && <p className="text-sm text-muted">{category.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setDialog({ kind: "category", category })} className="min-h-9 rounded-full border border-line px-3 text-xs font-semibold hover:bg-surface">Modifier</button>
                <Switch checked={category.isActive} onChange={() => toggleCategory(category)} label={`Catégorie ${category.name} : ${category.isActive ? "active" : "désactivée"}`} busy={m.setCategoryActive.isPending} />
              </div>
            </div>

            <ul className="mt-4 divide-y divide-line rounded-2xl bg-surface">
              {category.subCategories.length === 0 && <li className="p-3 text-sm text-muted">Aucune sous-catégorie.</li>}
              {category.subCategories.map((sub) => (
                <li key={sub.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className={cn("text-sm font-semibold", !sub.isActive && "text-muted")}>{sub.name}</p>
                    <p className="text-xs text-muted">{sub._count.products} produit{sub._count.products > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setDialog({ kind: "subcategory", categoryId: category.id, sub })} className="min-h-9 rounded-full border border-line bg-white px-3 text-xs font-semibold hover:bg-surface">Modifier</button>
                    <Switch checked={sub.isActive} onChange={() => toggleSub(sub)} label={`Sous-catégorie ${sub.name} : ${sub.isActive ? "active" : "désactivée"}`} busy={m.setSubCategoryActive.isPending} />
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setDialog({ kind: "subcategory", categoryId: category.id })} className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
              <Plus className="h-4 w-4" aria-hidden /> Ajouter une sous-catégorie
            </button>
          </li>
        ))}
      </ul>

      <Modal open={dialog?.kind === "category"} onClose={close} title={dialog?.kind === "category" && dialog.category ? "Modifier la catégorie" : "Nouvelle catégorie"}>
        {dialog?.kind === "category" && <NameForm initial={dialog.category} onDone={close} submit={(values) => (dialog.category ? m.updateCategory.mutateAsync({ id: dialog.category.id, body: { name: values.name, description: values.description || null } }) : m.createCategory.mutateAsync({ name: values.name, ...(values.description ? { description: values.description } : {}) }))} />}
      </Modal>
      <Modal open={dialog?.kind === "subcategory"} onClose={close} title={dialog?.kind === "subcategory" && dialog.sub ? "Modifier la sous-catégorie" : "Nouvelle sous-catégorie"}>
        {dialog?.kind === "subcategory" && <NameForm initial={dialog.sub} onDone={close} submit={(values) => (dialog.sub ? m.updateSubCategory.mutateAsync({ id: dialog.sub.id, body: { name: values.name, description: values.description || null } }) : m.createSubCategory.mutateAsync({ name: values.name, categoryId: dialog.categoryId, ...(values.description ? { description: values.description } : {}) }))} />}
      </Modal>
      <Modal open={dialog?.kind === "confirm"} onClose={close} title="Désactiver">
        {dialog?.kind === "confirm" && (
          <div className="space-y-4">
            <p className="text-sm">
              Désactiver <strong>{dialog.target.name}</strong> masque <strong>tous ses produits</strong> aux clients. Vous pourrez la réactiver à tout moment.
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={close} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold hover:bg-surface">Annuler</button>
              <button
                type="button"
                onClick={() => {
                  const { type, id } = dialog.target;
                  const mutation = type === "category" ? m.setCategoryActive : m.setSubCategoryActive;
                  mutation.mutate({ id, isActive: false }, { onSuccess: () => { toast.success("Désactivée."); close(); }, onError: (e) => toast.error(errorMessage(e)) });
                }}
                className="min-h-11 rounded-full bg-sale px-5 text-sm font-semibold text-white hover:opacity-90"
              >
                Désactiver
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function NameForm({ initial, onDone, submit }: { initial?: { name: string; description: string | null }; onDone: () => void; submit: (values: Values) => Promise<unknown> }) {
  const [failure, setFailure] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: initial?.name ?? "", description: initial?.description ?? "" } });
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        setFailure(null);
        try {
          await submit(values);
          toast.success("Enregistré.");
          onDone();
        } catch (error) {
          setFailure(errorMessage(error));
        }
      })}
    >
      {failure && <FormAlert>{failure}</FormAlert>}
      <TextField label="Nom" error={errors.name?.message} {...register("name")} />
      <TextAreaField label="Description (facultative)" error={errors.description?.message} {...register("description")} />
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onDone} disabled={isSubmitting} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold hover:bg-surface">Annuler</button>
        <button type="submit" disabled={isSubmitting} className="min-h-11 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">{isSubmitting ? "Enregistrement…" : "Enregistrer"}</button>
      </div>
    </form>
  );
}