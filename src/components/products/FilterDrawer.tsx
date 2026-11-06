"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  resultsLabel: string;
  children: ReactNode;
}

/** Panneau du bas pour mobile, basé sur <dialog> : focus piégé et touche Échap gérés par le navigateur. */
export function FilterDrawer({ open, onClose, resultsLabel, children }: Props) {
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
      aria-label="Filtres"
      className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none rounded-t-2xl p-0 backdrop:bg-black/40 lg:hidden"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="font-bold">Filtres</p>
          <button type="button" onClick={onClose} aria-label="Fermer les filtres" className="rounded-full p-2 hover:bg-surface">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        <div className="border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={onClose} className="h-11 w-full rounded-lg bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600">
            {resultsLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}