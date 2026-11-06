export const footerLinks = {
  about: [
    { label: "À propos", href: "/a-propos" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Conditions générales", href: "/conditions-generales" },
    { label: "Politique de confidentialité", href: "/confidentialite" },
  ],
  help: [
    { label: "Informations de livraison", href: "/livraison" },
    { label: "Moyens de paiement", href: "/paiements" },
  ],
} as const;

/** À renseigner avec les vrais comptes A&T Market : rien n'est affiché tant que la liste est vide. */
export const socialLinks: ReadonlyArray<{ label: string; href: string }> = [];

export const marketplaces = [
  { id: "shein", name: "SHEIN", hint: "Collez le lien de la fiche produit." },
  { id: "noon", name: "NOON", hint: "Collez le lien de la fiche produit." },
  { id: "1688", name: "1688", hint: "Lien au format detail.1688.com/offer/…" },
] as const;