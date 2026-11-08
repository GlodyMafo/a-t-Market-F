"use client";

import { Clock, Headset, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { supportInfo } from "@/constants/site";
import { cn } from "@/lib/utils";

const row = "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-brand-50";
const iconBox = "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600";

export function SupportMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const whatsapp = supportInfo.whatsapp.replace(/\D/g, "");
  const phone = supportInfo.phone.replace(/[^\d+]/g, "");
  const { email, hours, address } = supportInfo;
  const hasAny = Boolean(whatsapp || phone || email || hours || address);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Service client"
        aria-expanded={open}
        aria-controls={panelId}
        className={cn("flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface", open && "bg-brand-50 text-brand-600")}
      >
        <Headset className="h-5 w-5" aria-hidden />
      </button>

      {open && (
        <div id={panelId} className="glass-strong absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl p-3">
          <p className="px-3 pt-1 font-display text-base font-extrabold tracking-tight">Service client</p>
          <p className="px-3 pb-2 text-xs text-muted">Une question avant ou après votre commande ?</p>

          {hasAny ? (
            <ul>
              {whatsapp && (
                <li>
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={row}>
                    <span className={iconBox}><MessageCircle className="h-4 w-4" aria-hidden /></span> Écrire sur WhatsApp
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone}`} className={row}>
                    <span className={iconBox}><Phone className="h-4 w-4" aria-hidden /></span> {supportInfo.phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className={row}>
                    <span className={iconBox}><Mail className="h-4 w-4" aria-hidden /></span>
                    <span className="min-w-0 truncate">{email}</span>
                  </a>
                </li>
              )}
              {hours && (
                <li className="flex items-center gap-3 px-3 py-2 text-xs text-muted">
                  <Clock className="h-4 w-4 shrink-0" aria-hidden /> {hours}
                </li>
              )}
              {address && (
                <li className="flex items-center gap-3 px-3 py-2 text-xs text-muted">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden /> {address}
                </li>
              )}
            </ul>
          ) : (
            <p className="px-3 pb-2 text-sm text-muted">Le service client sera bientôt joignable ici.</p>
          )}
        </div>
      )}
    </div>
  );
}