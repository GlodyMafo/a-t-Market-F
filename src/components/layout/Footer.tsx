import Link from "next/link";
import { footerLinks, socialLinks } from "@/constants/site";

function Column({ title, links }: { title: string; links: ReadonlyArray<{ label: string; href: string }> }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-brand-600">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-8 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-brand-500">A&amp;T Market</p>
          <p className="mt-3 text-sm text-muted">
            Produits locaux à Lubumbashi et importation depuis SHEIN, NOON et 1688. Paiement par Mobile Money.
          </p>
          {socialLinks.length > 0 && (
            <ul className="mt-4 flex gap-4 text-sm">
              {socialLinks.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Column title="A&T Market" links={footerLinks.about} />
        <Column title="Informations" links={footerLinks.help} />
        <Column title="Légal" links={footerLinks.legal} />
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} A&amp;T Market. Tous droits réservés.
      </p>
    </footer>
  );
}