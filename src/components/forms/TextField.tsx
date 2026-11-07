import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props extends ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
}

export function TextField({ label, error, hint, suffix, id, className, ...props }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-brand-500",
            error ? "border-sale" : "border-line",
            suffix ? "pr-11" : "",
            className,
          )}
          {...props}
        />
        {suffix && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="mt-1 text-xs text-sale">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}