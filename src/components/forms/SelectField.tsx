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
      <label htmlFor={selectId} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
        className={cn(
          "h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-brand-500 disabled:bg-surface disabled:text-muted",
          error ? "border-sale" : "border-line",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p id={`${selectId}-error`} role="alert" className="mt-1 text-xs text-sale">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}