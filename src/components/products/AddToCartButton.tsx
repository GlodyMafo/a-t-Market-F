export function AddToCartButton() {
  return (
    <div>
      <button
        type="button"
        disabled
        className="h-12 w-full rounded-lg bg-brand-500 px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Ajouter au panier
      </button>
      <p className="mt-2 text-xs text-muted">Le panier sera disponible prochainement.</p>
    </div>
  );
}