"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  canReset: boolean;
  resultsLabel: string;
  children: ReactNode;
}

/** Feuille du bas pour mobile, basée sur <dialog> : focus piégé et touche Échap gérés par le navigateur. */
export function FilterDrawer({ open, onClose, onReset, canReset, resultsLabel, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // Un clic sur le fond (le <dialog> lui-même) ferme la feuille.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-label="Filtres"
      className="sheet glass-strong fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none overflow-hidden rounded-t-3xl p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm lg:hidden"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-ink/20" />

        <div className="flex items-center justify-between px-4 pb-1 pt-2">
          <p className="font-display text-lg font-extrabold tracking-tight">Filtres</p>
          <div className="flex items-center">
            {canReset && (
              <button type="button" onClick={onReset} className="min-h-11 px-3 text-sm font-semibold text-brand-600">
                Réinitialiser
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Fermer les filtres" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        <div className="border-t border-line/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-full bg-brand-500 text-sm font-semibold text-white motion-safe:transition-colors hover:bg-brand-600 motion-safe:active:scale-[0.99]"
          >
            {resultsLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}