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
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-tight md:text-sm">{title}</p>
              {/* Le détail n'apparaît qu'à partir de md : sur mobile il répète les bannières */}
              <p className="mt-0.5 hidden text-xs text-muted md:block">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}