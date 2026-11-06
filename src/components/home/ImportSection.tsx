import Link from "next/link";
import { marketplaces } from "@/constants/site";

const steps = ["Choisissez la boutique", "Collez le lien du produit", "Recevez le prix total livré en RDC"];

export function ImportSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <div className="rounded-2xl bg-surface p-5 md:p-8">
        <h2 className="text-lg font-bold md:text-2xl">Importez depuis SHEIN, NOON ou 1688</h2>

        <ol className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
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
                className="block rounded-xl bg-white p-5 transition-shadow hover:shadow-md"
              >
                <p className="text-2xl font-bold text-brand-600">{m.name}</p>
                <p className="mt-2 text-sm text-muted">{m.hint}</p>
                <p className="mt-4 text-sm font-semibold text-brand-600">Importer depuis {m.name} →</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}