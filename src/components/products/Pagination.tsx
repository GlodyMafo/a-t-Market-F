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

  const base =
    "flex h-11 min-w-11 items-center justify-center rounded-full border border-line bg-white px-3 text-sm font-medium motion-safe:transition-colors motion-safe:active:scale-95";

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Page précédente" className={cn(base, "disabled:opacity-40")}>
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>

      {/* Mobile : texte compact. Desktop : numéros de page. */}
      <p className="px-3 text-sm font-medium sm:hidden">
        Page {page} sur {totalPages}
      </p>
      <div className="hidden items-center gap-1.5 sm:flex">
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
              aria-label={`Page ${item}`}
              className={cn(base, item === page ? "border-brand-500 bg-brand-500 font-semibold text-white" : "hover:bg-surface")}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Page suivante" className={cn(base, "disabled:opacity-40")}>
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}