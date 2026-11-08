import { CheckCircle2, MailCheck, XCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Bouton principal en pilule, à utiliser comme `className` d'un <Link>. */
export const statusButton =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-brand-500 px-8 text-sm font-semibold text-white motion-safe:transition hover:bg-brand-600 motion-safe:active:scale-95";

const TONES = {
  success: { icon: CheckCircle2, box: "bg-green-50 text-green-600" },
  error: { icon: XCircle, box: "bg-red-50 text-sale" },
  info: { icon: MailCheck, box: "bg-brand-50 text-brand-600" },
} as const;

interface Props {
  tone: keyof typeof TONES;
  title: string;
  icon?: LucideIcon;
  children?: ReactNode;
  action?: ReactNode;
}

export function StatusPanel({ tone, title, icon, children, action }: Props) {
  const Icon = icon ?? TONES[tone].icon;
  return (
    <div aria-live="polite" className="flex flex-col items-center text-center">
      <span className={cn("flex h-16 w-16 items-center justify-center rounded-full", TONES[tone].box)}>
        <Icon className="h-8 w-8" aria-hidden />
      </span>
      <h2 className="mt-4 font-display text-xl font-extrabold tracking-tight">{title}</h2>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}