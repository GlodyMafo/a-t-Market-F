/** Accueil et sections : pas de sidebar, jusqu'à 5 colonnes. */
export const PRODUCT_GRID_CLASS = "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5";

/** Catalogue : la sidebar de 240 px prend de la place, donc 3 colonnes jusqu'à xl puis 4 (cartes d'environ 230 px). */
export const CATALOG_GRID_CLASS = "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 xl:grid-cols-4";

export function ProductGridSkeleton({ count = 10, className = PRODUCT_GRID_CLASS }: { count?: number; className?: string }) {
  return (
    <div className={className} aria-busy="true" aria-label="Chargement des produits">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="skeleton aspect-square rounded-xl" />
          <div className="skeleton mt-2 h-3 w-4/5 rounded" />
          <div className="skeleton mt-2 h-4 w-1/3 rounded" />
        </div>
      ))}
    </div>
  );
}

/** Rangée défilante au doigt sur mobile, grille à partir de lg. */
export const PRODUCT_ROW_CLASS =
  "-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0";