import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { footerLinks, paymentMethods, socialLinks, supportInfo, type FooterLink } from "@/constants/site";

function Column({ title, links }: { title: string; links: ReadonlyArray<FooterLink> }) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold">{title}</h3>
      <ul className="mt-3 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            {link.soon ? (
              <span className="inline-flex items-center gap-2 text-white/60">
                {link.label}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">Bientôt</span>
              </span>
            ) : (
              <Link href={link.href} className="text-white/75 hover:text-white hover:underline">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const whatsapp = supportInfo.whatsapp.replace(/\D/g, "");
  const phone = supportInfo.phone.replace(/[^\d+]/g, "");
  const { email, hours, address } = supportInfo;
  const hasChannel = Boolean(whatsapp || phone || email);
  const hasContact = hasChannel || Boolean(hours || address);
  const actionBtn = "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold";

  return (
    <footer className="mt-12 rounded-t-3xl bg-brand-900 text-white md:rounded-t-[2.5rem]">
      <div className="mx-auto max-w-7xl px-4 pt-10 md:pt-12">
        {/* Bande d'aide : n'apparaît que si au moins un canal est renseigné dans constants/site.ts */}
        {hasChannel && (
          <div className="mb-10 flex flex-col gap-4 rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <p className="font-display text-lg font-extrabold tracking-tight md:text-xl">Une question avant de commander ?</p>
              <p className="mt-1 text-sm text-white/70">Notre équipe vous répond{hours ? ` · ${hours}` : ""}.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={`${actionBtn} bg-white text-brand-900 hover:bg-brand-50`}>
                  <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className={`${actionBtn} bg-white/10 ring-1 ring-white/25 hover:bg-white/20`}>
                  <Phone className="h-4 w-4" aria-hidden /> Appeler
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className={`${actionBtn} bg-white/10 ring-1 ring-white/25 hover:bg-white/20`}>
                  <Mail className="h-4 w-4" aria-hidden /> E-mail
                </a>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-10 md:grid-cols-[1.4fr_2.6fr]">
          {/* Marque */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                <Image src="/images/logo.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
              </span>
              <p className="font-display text-xl font-extrabold tracking-tight">A&amp;T Market</p>
            </div>
            <p className="mt-4 max-w-sm text-sm text-white/70">
              Produits locaux à Lubumbashi et importation depuis SHEIN, NOON et 1688. Paiement par Mobile Money.
            </p>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/60">Paiement par Mobile Money</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <li key={m.id} className="flex h-8 items-center rounded-lg bg-white px-2.5 text-xs font-bold text-brand-900">
                  {m.logo ? <Image src={m.logo} alt={m.label} width={48} height={20} unoptimized className="h-5 w-auto" /> : m.label}
                </li>
              ))}
            </ul>

            {socialLinks.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2 text-sm">
                {socialLinks.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center rounded-full bg-white/10 px-4 font-medium ring-1 ring-white/20 hover:bg-white/20">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Colonnes */}
          <div className="grid grid-cols-2 gap-8 md:[grid-template-columns:repeat(auto-fit,minmax(9rem,1fr))]">
            <Column title="Boutique" links={footerLinks.shop} />
            <Column title="Aide & informations" links={footerLinks.help} />
            <Column title="Légal" links={footerLinks.legal} />

            {hasContact && (
              <div>
                <h3 className="font-display text-sm font-bold">Service client</h3>
                <ul className="mt-3 space-y-2.5 text-sm text-white/75">
                  {whatsapp && (
                    <li>
                      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                        <MessageCircle className="h-4 w-4 shrink-0" aria-hidden /> WhatsApp
                      </a>
                    </li>
                  )}
                  {phone && (
                    <li>
                      <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-white">
                        <Phone className="h-4 w-4 shrink-0" aria-hidden /> {supportInfo.phone}
                      </a>
                    </li>
                  )}
                  {email && (
                    <li>
                      <a href={`mailto:${email}`} className="flex items-center gap-2 break-all hover:text-white">
                        <Mail className="h-4 w-4 shrink-0" aria-hidden /> {email}
                      </a>
                    </li>
                  )}
                  {hours && (
                    <li className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {hours}
                    </li>
                  )}
                  {address && (
                    <li className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {address}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/15 px-4 py-5 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} A&amp;T Market. Tous droits réservés. <span className="whitespace-nowrap">Prix affichés en dollars US (USD).</span>
        </p>
        <a href="#" className="inline-flex min-h-9 items-center gap-1.5 self-start font-semibold text-white/80 hover:text-white md:self-auto">
          <ArrowUp className="h-3.5 w-3.5" aria-hidden /> Haut de page
        </a>
      </div>
    </footer>
  );
}