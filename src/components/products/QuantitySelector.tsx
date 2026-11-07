import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantitySelector({ value, max, onChange }: Props) {
  const upper = Math.max(max, 1);
  const clamp = (n: number) => Math.min(Math.max(Number.isFinite(n) ? Math.trunc(n) : 1, 1), upper);
  const button =
    "flex h-10 w-10 items-center justify-center rounded-lg border border-line hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div role="group" aria-label="Quantité" className="flex items-center gap-2">
      <button type="button" className={button} aria-label="Diminuer la quantité" disabled={value <= 1} onClick={() => onChange(clamp(value - 1))}>
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={upper}
        value={value}
        aria-label="Quantité"
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="h-10 w-16 rounded-lg border border-line text-center text-sm outline-none focus:border-brand-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" className={button} aria-label="Augmenter la quantité" disabled={value >= upper} onClick={() => onChange(clamp(value + 1))}>
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}