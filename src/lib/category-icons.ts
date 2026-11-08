import {
  Baby, BookOpen, Camera, Car, Dumbbell, Footprints, Gamepad2, Gem, Gift, Glasses, Headphones, HeartPulse,
  Home, Lamp, Laptop, PawPrint, Plug, Shirt, ShoppingBag, ShoppingBasket, Smartphone, Sofa, Sparkles, Tag,
  UtensilsCrossed, Watch, Wrench, type LucideIcon,
} from "lucide-react";

// Le premier motif qui correspond gagne : du plus précis au plus général.
const rules: Array<[RegExp, LucideIcon]> = [
  [/[ée]lectrom[ée]nager|frigo|cong[ée]lateur|climatis|ventilat/i, Plug],
  [/t[ée]l[ée]phone|mobile|smartphone|tablette/i, Smartphone],
  [/photo|cam[ée]ra|vid[ée]o/i, Camera],
  [/audio|casque|[ée]couteur|enceinte/i, Headphones],
  [/jeu.*vid[ée]o|console|gaming|gamer/i, Gamepad2],
  [/[ée]lectro|informat|ordinateur|laptop/i, Laptop],
  [/chaussure|basket|sandale|botte/i, Footprints],
  [/sac|bagage|valise/i, ShoppingBag],
  [/lunette/i, Glasses],
  [/montre/i, Watch],
  [/bijou|accessoire/i, Gem],
  [/beaut[ée]|cosm[ée]tique|parfum|soin|maquillage|coiffure|cheveux/i, Sparkles],
  [/sant[ée]|pharmacie|bien-?[êe]tre|m[ée]dic/i, HeartPulse],
  [/mode|v[êe]tement|habit|robe|femme|homme|pr[êe]t|textile|lingerie|pagne/i, Shirt],
  [/cuisine|ustensile|vaisselle/i, UtensilsCrossed],
  [/alimentaire|alimentation|supermarch|[ée]picerie|boisson|nourriture/i, ShoppingBasket],
  [/meuble|salon|canap[ée]|literie/i, Sofa],
  [/luminaire|lampe|[ée]clairage/i, Lamp],
  [/maison|d[ée]co|habitat|jardin/i, Home],
  [/b[ée]b[ée]|enfant|pu[ée]riculture/i, Baby],
  [/jouet|cadeau/i, Gift],
  [/sport|fitness|musculation/i, Dumbbell],
  [/auto|moto|voiture|v[ée]hicule|pi[èe]ce/i, Car],
  [/outil|bricolage|quincaillerie|chantier/i, Wrench],
  [/livre|papeterie|scolaire|[ée]cole|bureau/i, BookOpen],
  [/animal|animaux|chien|chat/i, PawPrint],
];

/** Icône choisie d'après le nom de la catégorie ; icône « étiquette » par défaut. */
export function iconForCategory(name: string): LucideIcon {
  for (const [pattern, icon] of rules) if (pattern.test(name)) return icon;
  return Tag;
}