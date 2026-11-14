"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { QuoteVariantOptions } from "@/types/domain";
import { isValueAvailable, type Selected } from "./options";

interface Props {
  options: QuoteVariantOptions;
  selected: Selected;
  onSelect: (group: string, value: string) => void;
  /** Ex. « une couleur, une taille » : affiché tant que le choix est incomplet. */
  missing?: string;
}

const chip =
  "relative flex min-h-11 cursor-pointer items-center gap-2.5 rounded-2xl border-2 px-3.5 py-2 text-left text-sm font-medium leading-snug motion-safe:transition focus-within:ring-2 focus-within:ring-brand-500";

export function VariantPicker({ options, selected, onSelect, missing }: Props) {
  return (
    <div className="space-y-5">
      {options.groups.map((group) => {
        const hasImages = group.values.some((v) => v.imageUrl);
        return (
          <fieldset key={group.name}>
            <legend className="mb-2.5 text-sm font-bold">
              {group.name}
              {selected[group.name] && <span className="font-medium text-muted"> : {selected[group.name]}</span>}
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {group.values.map((item) => {
                const isSelected = selected[group.name] === item.value;
                const available = isValueAvailable(options, selected, group.name, item.value);
                return (
                  <label
                    key={item.value}
                    title={available ? item.value : `${item.value} : indisponible`}
                    className={cn(
                      chip,
                      !available
                        ? "cursor-not-allowed border-line bg-surface text-muted line-through"
                        : isSelected
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-line bg-white hover:border-brand-200",
                    )}
                  >
                    <input
                      type="radio"
                      name={`variant-${group.name}`}
                      value={item.value}
                      checked={isSelected}
                      disabled={!available}
                      onChange={() => onSelect(group.name, item.value)}
                      className="sr-only"
                    />
                    {hasImages && item.imageUrl && (
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-surface">
                        <Image src={item.imageUrl} alt="" fill unoptimized referrerPolicy="no-referrer" sizes="44px" className="object-cover" />
                      </span>
                    )}
                    <span className="min-w-0 break-words">{item.value}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0" aria-hidden />}
                    {!available && <span className="sr-only"> (indisponible)</span>}
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {missing && (
        <p role="status" className="rounded-2xl bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-900">
          Choisissez {missing} pour voir le prix exact.
        </p>
      )}
    </div>
  );
}