import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  children?: ReactNode;
}

export function EmptyState({ title, message, actionLabel, onAction, icon: Icon, children }: Props) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center">
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon className="h-7 w-7" aria-hidden />
        </span>
      )}
      <h2 className="font-display text-lg font-extrabold tracking-tight">{title}</h2>
      {message && <p className="text-sm text-muted">{message}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 min-h-11 rounded-full bg-brand-500 px-6 text-sm font-semibold text-white motion-safe:transition-colors hover:bg-brand-600 motion-safe:active:scale-95"
        >
          {actionLabel}
        </button>
      )}
      {children}
    </div>
  );
}