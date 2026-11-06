import { PackageCheck, Smartphone, Store, Tag } from "lucide-react";

const items = [
  { icon: Tag, title: "Prix total livré", text: "Affiché en toute transparence" },
  { icon: Smartphone, title: "Mobile Money", text: "Airtel, MTN, Orange, Vodacom" },
  { icon: PackageCheck, title: "Suivi de commande", text: "Jusqu'à la livraison" },
  { icon: Store, title: "Stock local", text: "Disponible à Lubumbashi" },
] as const;

export function TrustBar() {
  return (
    <section aria-label="Nos engagements" className="mx-auto max-w-7xl px-4 pt-6">
      <ul className="grid grid-cols-2 gap-4 rounded-xl border border-line p-4 md:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" aria-hidden />
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}