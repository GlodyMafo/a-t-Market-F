import { Check, Headset } from "lucide-react";
import { supportInfo } from "@/constants/site";
import { IMPORT_MARKETPLACES } from "./marketplaces";

// Mêmes libellés que les lignes du devis (QuoteResult).
const included = ["Prix du produit", "Transport et douane", "Commission A&T"];

export function ImportInfoPanel() {
  const whatsapp = supportInfo.whatsapp.replace(/\D/g, "");
  const { email } = supportInfo;

  return (
    <aside className="rounded-3xl bg-brand-900 p-5 text-white md:p-6 lg:grid lg:grid-cols-3 lg:gap-10 lg:p-8">
      <section aria-labelledby="included-title">
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
      </section>

      <section aria-labelledby="find-title" className="mt-7 lg:mt-0">
        <h2 id="find-title" className="font-display text-lg font-extrabold tracking-tight">
          Où trouver le lien ?
        </h2>
        <ul className="mt-4 space-y-3 text-sm">
          {IMPORT_MARKETPLACES.map((m) => (
            <li key={m.id}>
              <span className="font-bold">{m.name}</span>
              <span className="block text-white/70">{m.tip}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="help-title" className="mt-7 flex flex-col lg:mt-0">
        <h2 id="help-title" className="font-display text-lg font-extrabold tracking-tight">
          Une question ?
        </h2>
        <p className="mt-1 text-sm text-white/70">Notre équipe vous aide à trouver le bon lien ou à comprendre un devis.</p>
        {(whatsapp || email) && (
          <a
            href={whatsapp ? `https://wa.me/${whatsapp}` : `mailto:${email}`}
            {...(whatsapp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-sm font-semibold ring-1 ring-white/25 motion-safe:transition hover:bg-white/20 lg:mt-auto"
          >
            <Headset className="h-4 w-4" aria-hidden /> Écrivez-nous
          </a>
        )}
      </section>
    </aside>
  );
}