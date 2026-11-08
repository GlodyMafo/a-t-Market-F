import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-sale" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}