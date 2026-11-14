import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface Props extends ComponentProps<"textarea"> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextAreaField({ label, error, hint, id, className, ...props }: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(
          "min-h-24 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-brand-500",
          error ? "border-sale" : "border-line",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} role="alert" className="mt-1 text-xs text-sale">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}