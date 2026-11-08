import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props extends ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
  /** Padding droit réservé au suffixe (défaut : une icône de 44 px). */
  suffixSpace?: string;
}

export function TextField({ label, error, hint, suffix, suffixSpace = "pr-12", id, className, ...props }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none motion-safe:transition focus:ring-2",
            error ? "border-sale focus:border-sale focus:ring-sale/20" : "border-line focus:border-brand-500 focus:ring-brand-500/20",
            suffix ? suffixSpace : "",
            className,
          )}
          {...props}
        />
        {suffix && <div className="absolute right-2 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs text-sale">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}