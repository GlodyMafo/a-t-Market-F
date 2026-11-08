
export function TopBar() {
  return (
    <div className="bg-brand-900 text-xs text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-1.5 md:py-2">
        <ul className="flex flex-1 items-center justify-center gap-8 md:justify-between">
          <li>Prix total livré en RDC, sans surprise</li>
          <li className="hidden md:block">Paiement par Mobile Money</li>
          <li className="hidden md:block">Suivi de commande jusqu&apos;à la livraison</li>
        </ul>
      </div>
    </div>
  );
}