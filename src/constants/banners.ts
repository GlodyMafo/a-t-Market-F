import { Globe, Smartphone, Sparkles, Store, Tag, type LucideIcon } from "lucide-react";

export type BannerTheme = "brand" | "dark" | "light";

export interface Banner {
  id: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  theme: BannerTheme;
  icon: LucideIcon;
  /** Photo optionnelle : déposez le fichier dans public/banners puis renseignez par exemple "/banners/hero-1.jpg". */
  image?: string;
}

export const heroSlides: Banner[] = [
  {
    id: "import",
    title: "Importez depuis SHEIN, NOON et 1688",
    text: "Collez le lien du produit et recevez son prix total livré en RDC.",
    cta: "Importer un produit",
    href: "/import",
    theme: "brand",
    icon: Globe,
    image: "/banners/banner2.png",
  },
  {
    id: "local",
    title: "Disponible à Lubumbashi",
    text: "Des produits en stock, disponibles immédiatement.",
    cta: "Voir les produits",
    href: "/products",
    theme: "dark",
    icon: Store,
    image: "/banners/banner3.png",
  },
  {
    id: "mobile-money",
    title: "Payez par Mobile Money",
    text: "Airtel, MTN, Orange ou Vodacom. Suivez votre commande jusqu'à la livraison.",
    cta: "Commencer",
    href: "/import",
    theme: "light",
    icon: Smartphone,
     image: "/banners/banner4.png",
  },
];

export const sideTiles: Banner[] = [
  {
    id: "new",
    title: "Nouveautés",
    text: "Les derniers produits ajoutés.",
    cta: "Découvrir",
    href: "/products?sort=newest",
    theme: "light",
    icon: Sparkles,
  },
  {
    id: "total-price",
    title: "Prix total livré",
    text: "Le coût final, sans surprise.",
    cta: "Faire un devis",
    href: "/import",
    theme: "dark",
    icon: Tag,
  },
];