import { ChevronDown } from "lucide-react";
import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface Props extends ComponentProps<"select"> {
  label: string;
  error?: string;
  hint?: string;
}

export function SelectField({ label, error, hint, id, className, children, ...props }: Props) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div>
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          className={cn(
            "h-12 w-full appearance-none rounded-xl border bg-white pl-4 pr-10 text-sm outline-none motion-safe:transition focus:ring-2 disabled:bg-surface disabled:text-muted",
            error ? "border-sale focus:border-sale focus:ring-sale/20" : "border-line focus:border-brand-500 focus:ring-brand-500/20",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      </div>
      {error ? (
        <p id={`${selectId}-error`} role="alert" className="mt-1.5 text-xs text-sale">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}