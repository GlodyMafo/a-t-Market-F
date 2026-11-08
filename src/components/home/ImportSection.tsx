import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { marketplaces } from "@/constants/site";

const steps = ["Choisissez la boutique", "Collez le lien du produit", "Recevez le prix total livré en RDC"];

export function ImportSection() {
  return (
    <section aria-labelledby="import-title" className="reveal mx-auto max-w-7xl px-4 py-6 md:py-8">
      <div className="rounded-3xl bg-brand-900 p-5 text-white md:p-10">
        <h2 id="import-title" className="font-display text-xl font-extrabold tracking-tight md:text-3xl">
          Importez depuis SHEIN, NOON ou 1688
        </h2>

        <ol className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-900">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {marketplaces.map((m) => (
            <li key={m.id}>
              <Link
                href={`/import?marketplace=${m.id}`}
                className="group block rounded-2xl border border-white/15 bg-white/10 p-5 motion-safe:transition motion-safe:hover:-translate-y-0.5 hover:bg-white/15"
              >
                <p className="font-display text-3xl font-extrabold tracking-tight">{m.name}</p>
                <p className="mt-2 text-sm text-white/70">{m.hint}</p>
                <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand-200">
                  Importer depuis {m.name}
                  <ArrowRight className="h-4 w-4 motion-safe:transition-transform group-hover:translate-x-0.5" aria-hidden />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}