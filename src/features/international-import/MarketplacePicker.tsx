import { cn } from "@/lib/utils";
import type { MarketplaceId } from "@/lib/marketplace";
import { IMPORT_MARKETPLACES } from "./marketplaces";

interface Props {
  value: MarketplaceId;
  onChange: (id: MarketplaceId) => void;
}

export function MarketplacePicker({ value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">1. Choisissez la boutique</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {IMPORT_MARKETPLACES.map((m) => {
          const selected = m.id === value;
          return (
            <label
              key={m.id}
              className={cn(
                "flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-colors focus-within:ring-2 focus-within:ring-brand-500",
                selected ? "border-brand-500 bg-brand-50" : "border-line hover:border-brand-200",
              )}
            >
              <input type="radio" name="marketplace" value={m.id} checked={selected} onChange={() => onChange(m.id)} className="sr-only" />
              <span className="text-xl font-bold text-brand-600">{m.name}</span>
              <span className="mt-1 text-xs text-muted">{m.tip}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}