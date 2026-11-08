/** Contenu de repli des formulaires enveloppés dans <Suspense>. */
export function FormSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <span className="sr-only">Chargement…</span>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-12 rounded-xl" />
        </div>
      ))}
      <div className="skeleton h-12 rounded-full" />
    </div>
  );
}