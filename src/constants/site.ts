export interface FooterLink {
  label: string;
  href: string;
  /** Mettre à true tant que la page n'existe pas : affiché avec « Bientôt » au lieu d'un lien cassé. Retirer la ligne une fois la page créée. */
  soon?: boolean;
}

export const footerLinks: Record<"shop" | "help" | "legal", ReadonlyArray<FooterLink>> = {
  shop: [
    { label: "Tous les produits", href: "/products" },
    { label: "Nouveautés", href: "/products?sort=newest" },
    { label: "Importer un produit", href: "/import" },
    { label: "Mes devis", href: "/account/quotes" },
  ],
  help: [
    { label: "Informations de livraison", href: "/livraison", soon: true },
    { label: "Moyens de paiement", href: "/paiements", soon: true },
    { label: "Contact", href: "/contact", soon: true },
    { label: "À propos", href: "/a-propos", soon: true },
  ],
  legal: [
    { label: "Conditions générales", href: "/conditions-generales", soon: true },
    { label: "Politique de confidentialité", href: "/confidentialite", soon: true },
  ],
};

/** Coordonnées du service client. Seuls les champs remplis sont affichés (en-tête et pied de page). */
export const supportInfo: {
  whatsapp: string;
  phone: string;
  email: string;
  hours: string;
  address: string;
} = {
  whatsapp: "", // numéro international, chiffres uniquement : "243XXXXXXXXX"
  phone: "", // affiché tel quel : "+243 XX XXX XXXX"
  email: "", // "contact@votre-domaine.com"
  hours: "", // "Lundi – samedi, 8h – 18h"
  address: "", // "Avenue …, Lubumbashi"
};

/** Opérateurs affichés dans le pied de page. Ajoutez `logo: "/payments/airtel.svg"` pour afficher un logo à la place du texte. */
export const paymentMethods: ReadonlyArray<{ id: string; label: string; logo?: string }> = [
  { id: "airtel", label: "Airtel" },
  { id: "mtn", label: "MTN" },
  { id: "orange", label: "Orange" },
  { id: "vodacom", label: "Vodacom" },
];

/** À renseigner avec les vrais comptes A&T Market : rien n'est affiché tant que la liste est vide. */
export const socialLinks: ReadonlyArray<{ label: string; href: string }> = [];

export const marketplaces = [
  { id: "shein", name: "SHEIN", hint: "Collez le lien de la fiche produit." },
  { id: "noon", name: "NOON", hint: "Collez le lien de la fiche produit." },
  { id: "1688", name: "1688", hint: "Lien au format detail.1688.com/offer/…" },
] as const;

/** Message de livraison affiché sur la fiche des produits locaux (ex. « Livraison à Lubumbashi sous 24 h »). Laisser vide pour ne rien afficher. */
export const localDeliveryNote = "";

/**
 * Image de fond du bloc profil (page /account).
 * - src : chemin de l'image dans public/ (ex. "/account/cover.webp"). Vide = pas d'image.
 * - position : cadrage (object-position) pour garder le sujet visible, ex. "75% center".
 * - tone : "dark" si l'image est sombre ou colorée (texte blanc), "light" si elle est claire (texte foncé).
 *   Sans image, "light" donne un bloc bleu très clair au lieu du bleu foncé.
 */
export const accountCover: { src: string; position: string; tone: "dark" | "light" } = {
 src: "/account/cover.png",
  position: "75% center",
  tone: "dark",
};

/**
 * Image du panneau de marque des pages de connexion et d'inscription.
 * - src : image du panneau desktop (1200×1600 px conseillé). Vide = panneau bleu foncé sans image.
 * - mobileSrc : bandeau mobile (1200×480 px conseillé). Vide = l'image principale recadrée.
 * - position / mobilePosition : cadrage (object-position) pour garder le sujet visible.
 * Test rapide sans nouvelle image : src "/banners/banner3.png" avec position "82% center".
 */
export const authCover: { src: string; mobileSrc: string; position: string; mobilePosition: string } = {
  src: "",
  mobileSrc: "",
  position: "center",
  mobilePosition: "80% center",
};