import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from(new Set([1, page - 1, page, page + 1, totalPages]))
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const items: Array<number | "gap"> = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) items.push("gap");
    items.push(p);
  });

  const base = "flex h-10 min-w-10 items-center justify-center rounded-lg border border-line px-3 text-sm";

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1.5">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Page précédente" className={cn(base, "disabled:opacity-40")}>
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>
      {items.map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-muted" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(base, item === page ? "border-brand-500 bg-brand-500 font-semibold text-white" : "hover:bg-surface")}
          >
            {item}
          </button>
        ),
      )}
      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Page suivante" className={cn(base, "disabled:opacity-40")}>
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}