"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  wide?: boolean;
  children: ReactNode;
}

/** Fenêtre modale native (<dialog>) : focus piégé, touche Échap et clic à l'extérieur gérés. */
export function Modal({ open, onClose, title, wide = false, children }: Props) {
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
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn("m-auto max-h-[90dvh] rounded-3xl p-0 shadow-2xl backdrop:bg-black/50", wide ? "w-[min(44rem,calc(100vw-2rem))]" : "w-[min(32rem,calc(100vw-2rem))]")}
    >
      <div className="flex max-h-[90dvh] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-extrabold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{open && children}</div>
      </div>
    </dialog>
  );
}