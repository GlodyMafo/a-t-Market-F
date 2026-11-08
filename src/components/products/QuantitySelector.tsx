import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function QuantitySelector({ value, max, onChange, disabled = false }: Props) {
  const upper = Math.max(max, 1);
  const clamp = (n: number) => Math.min(Math.max(Number.isFinite(n) ? Math.trunc(n) : 1, 1), upper);
  const button =
    "flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface motion-safe:transition motion-safe:active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div role="group" aria-label="Quantité" className={cn("flex w-fit items-center rounded-full border border-line bg-white p-0.5", disabled && "opacity-60")}>
      <button type="button" className={button} aria-label="Diminuer la quantité" disabled={disabled || value <= 1} onClick={() => onChange(clamp(value - 1))}>
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={upper}
        value={value}
        disabled={disabled}
        aria-label="Quantité"
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="h-11 w-12 bg-transparent text-center text-sm font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" className={button} aria-label="Augmenter la quantité" disabled={disabled || value >= upper} onClick={() => onChange(clamp(value + 1))}>
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}