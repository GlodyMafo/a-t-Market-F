"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { QuoteVariantOptions } from "@/types/domain";
import type { VariantSelection } from "./options";

interface Props {
  options: QuoteVariantOptions;
  value: VariantSelection;
  onChange: (next: VariantSelection) => void;
  /** Ex. « une couleur et une taille » : message affiché tant que le choix est incomplet. */
  missing?: string;
}

const choice =
  "relative flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 text-sm font-medium motion-safe:transition focus-within:ring-2 focus-within:ring-brand-500";

export function VariantPicker({ options, value, onChange, missing }: Props) {
  const { colors, sizes } = options;

  return (
    <div className="space-y-4 rounded-2xl bg-white p-4">
      {colors.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold">
            Couleur
            {value.color && <span className="font-normal text-muted"> : {value.color}</span>}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((color) => {
              const selected = value.color === color.name;
              return (
                <label
                  key={color.name}
                  title={color.name}
                  className={cn(choice, "pr-3", color.imageUrl ? "pl-1" : "pl-3", selected ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line hover:border-brand-200")}
                >
                  <input
                    type="radio"
                    name="variant-color"
                    value={color.name}
                    checked={selected}
                    onChange={() => onChange({ ...value, color: color.name })}
                    className="sr-only"
                  />
                  {color.imageUrl && (
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface">
                      <Image src={color.imageUrl} alt="" fill unoptimized referrerPolicy="no-referrer" sizes="36px" className="object-cover" />
                    </span>
                  )}
                  <span className="max-w-[9rem] truncate">{color.name}</span>
                  {selected && <Check className="h-4 w-4" aria-hidden />}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold">
            Taille
            {value.size && <span className="font-normal text-muted"> : {value.size}</span>}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((size) => {
              const selected = value.size === size.name;
              return (
                <label
                  key={size.name}
                  title={size.available ? size.name : `${size.name} : indisponible`}
                  className={cn(
                    choice,
                    "min-w-11 justify-center px-3",
                    !size.available
                      ? "cursor-not-allowed border-line bg-surface text-muted line-through"
                      : selected
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-line hover:border-brand-200",
                  )}
                >
                  <input
                    type="radio"
                    name="variant-size"
                    value={size.name}
                    checked={selected}
                    disabled={!size.available}
                    onChange={() => onChange({ ...value, size: size.name })}
                    className="sr-only"
                  />
                  {size.name}
                  {!size.available && <span className="sr-only"> (indisponible)</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {missing && (
        <p role="status" className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
          Choisissez {missing} pour continuer.
        </p>
      )}
    </div>
  );
}