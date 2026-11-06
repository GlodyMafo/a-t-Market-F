export const PRODUCT_GRID_CLASS = "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5";

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className={PRODUCT_GRID_CLASS} aria-busy="true" aria-label="Chargement des produits">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-lg bg-surface" />
          <div className="mt-2 h-3 w-4/5 rounded bg-surface" />
          <div className="mt-2 h-4 w-1/3 rounded bg-surface" />
        </div>
      ))}
    </div>
  );
}

/** Rangée défilante au doigt sur mobile, grille à partir de lg. */
export const PRODUCT_ROW_CLASS =
  "-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0";