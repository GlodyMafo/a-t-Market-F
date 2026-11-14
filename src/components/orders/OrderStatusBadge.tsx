import { cn } from "@/lib/utils";
import { TONE_CLASS, type Tone } from "@/features/orders/status";

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-bold", TONE_CLASS[tone])}>{label}</span>;
}