export function TopBar() {
  return (
    <div className="bg-brand-900 text-xs text-white">
      <ul className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 py-2 md:justify-between">
        <li>Prix total livré en RDC, sans surprise</li>
        <li className="hidden md:block">Paiement par Mobile Money</li>
        <li className="hidden md:block">Suivi de commande jusqu&apos;à la livraison</li>
      </ul>
    </div>
  );
}