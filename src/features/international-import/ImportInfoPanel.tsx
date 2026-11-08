import { Check, Headset } from "lucide-react";
import { supportInfo } from "@/constants/site";

// Mêmes libellés que les lignes du devis (QuoteResult).
const included = ["Prix du produit", "Transport", "Douane", "Commission A&T"];

export function ImportInfoPanel() {
  const whatsapp = supportInfo.whatsapp.replace(/\D/g, "");
  const { email } = supportInfo;

  return (
    <aside aria-labelledby="included-title" className="rounded-3xl bg-brand-900 p-5 text-white md:p-6 lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
      <h2 id="included-title" className="font-display text-lg font-extrabold tracking-tight">
        Ce que comprend le prix total livré
      </h2>
      <p className="mt-1 text-sm text-white/70">Chaque ligne est détaillée dans votre devis.</p>

      <ul className="mt-4 space-y-2.5">
        {included.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Check className="h-3.5 w-3.5" aria-hidden />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-white/60">Le cas échéant, des frais fixes sont indiqués dans le détail. Montants en dollars US, calculés par A&amp;T Market.</p>

      {(whatsapp || email) && (
        <a
          href={whatsapp ? `https://wa.me/${whatsapp}` : `mailto:${email}`}
          {...(whatsapp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-sm font-semibold ring-1 ring-white/25 motion-safe:transition hover:bg-white/20"
        >
          <Headset className="h-4 w-4" aria-hidden /> Une question ? Écrivez-nous
        </a>
      )}
    </aside>
  );
}