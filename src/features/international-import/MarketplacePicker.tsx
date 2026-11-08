import { Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MarketplaceId } from "@/lib/marketplace";
import { IMPORT_MARKETPLACES } from "./marketplaces";

interface Props {
  value: MarketplaceId;
  onChange: (id: MarketplaceId) => void;
}

export function MarketplacePicker({ value, onChange }: Props) {
  const selected = IMPORT_MARKETPLACES.find((m) => m.id === value);

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">1. Choisissez la boutique</legend>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {IMPORT_MARKETPLACES.map((m) => {
          const isSelected = m.id === value;
          return (
            <label
              key={m.id}
              className={cn(
                "relative flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 p-3 text-center motion-safe:transition focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 motion-safe:active:scale-[0.98]",
                isSelected ? "border-brand-500 bg-brand-50 shadow-[0_8px_20px_-14px_rgb(61_100_175/0.8)]" : "border-line bg-white hover:border-brand-200",
              )}
            >
              <input type="radio" name="marketplace" value={m.id} checked={isSelected} onChange={() => onChange(m.id)} className="sr-only" />
              {m.logo && <Image src={m.logo} alt="" width={80} height={24} unoptimized className="h-6 w-auto max-w-full object-contain" />}
              <span className={m.logo ? "sr-only" : "font-display text-lg font-extrabold tracking-tight text-brand-700 sm:text-xl"}>{m.name}</span>
              {isSelected && (
                <span aria-hidden className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </label>
          );
        })}
      </div>
      {/* Le conseil n'apparaît que pour la boutique choisie */}
      {selected && (
        <p className="mt-3 text-sm text-muted" aria-live="polite">
          {selected.tip}
        </p>
      )}
    </fieldset>
  );
}