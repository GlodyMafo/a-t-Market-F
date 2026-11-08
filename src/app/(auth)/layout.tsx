import { ChevronLeft, Smartphone, Store, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { authCover } from "@/constants/site";

const promises = [
  { icon: Tag, title: "Prix total livré", text: "Affiché avant de commander" },
  { icon: Smartphone, title: "Paiement par Mobile Money", text: "Réglez depuis votre téléphone" },
  { icon: Store, title: "Stock local", text: "Disponible à Lubumbashi" },
] as const;

function Brand() {
  return (
    <Link href="/" aria-label="A&T Market, accueil" className="inline-flex w-fit items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
        <Image src="/images/logo.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight">A&amp;T Market</span>
    </Link>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  const cover = authCover.src;
  const mobileCover = authCover.mobileSrc || cover;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Panneau de marque : desktop uniquement, reste en place pendant le défilement du formulaire */}
      <aside className="relative isolate hidden overflow-hidden bg-brand-900 p-10 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between lg:self-start xl:p-12">
        {cover && (
          <>
            <Image src={cover} alt="" fill sizes="45vw" style={{ objectPosition: authCover.position }} className="-z-20 object-cover" />
            {/* Dégradé fonctionnel : garde les promesses lisibles en bas, laisse respirer l'image en haut */}
            <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-brand-900 via-brand-900/70 to-brand-900/15" />
          </>
        )}

        <Brand />

        <div>
          <p className="max-w-md font-display text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">
            Achetez local ou importez, en toute simplicité.
          </p>
          <ul className="mt-6 grid gap-3">
            {promises.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/20 backdrop-blur-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-xs text-white/70">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        {/* Bandeau de marque : mobile et tablette uniquement */}
        <header className="relative isolate flex h-36 shrink-0 items-start overflow-hidden bg-brand-900 p-5 text-white lg:hidden">
          {mobileCover && (
            <>
              <Image src={mobileCover} alt="" fill sizes="100vw" style={{ objectPosition: authCover.mobilePosition }} className="-z-20 object-cover" />
              <div aria-hidden className="absolute inset-0 -z-10 bg-brand-900/55" />
            </>
          )}
          <Brand />
        </header>

        <main className="relative -mt-6 flex flex-1 flex-col rounded-t-3xl bg-white px-5 pb-10 pt-6 lg:mt-0 lg:items-center lg:justify-center lg:rounded-none lg:px-10 lg:py-12">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-6 inline-flex min-h-11 items-center gap-1 rounded-full bg-surface pl-3 pr-4 text-sm font-medium text-muted motion-safe:transition-colors hover:text-brand-600 motion-safe:active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden /> Retour à la boutique
            </Link>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}