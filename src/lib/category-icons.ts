import {
  Baby, Car, Dumbbell, Footprints, Gem, Home, Laptop, Shirt, ShoppingBag,
  Smartphone, Sparkles, Tag, UtensilsCrossed, type LucideIcon,
} from "lucide-react";

const rules: Array<[RegExp, LucideIcon]> = [
  [/t[ée]l[ée]phone|mobile|smartphone/i, Smartphone],
  [/[ée]lectro|informat|ordinateur|audio/i, Laptop],
  [/chaussure|basket|sandale/i, Footprints],
  [/sac|bagage/i, ShoppingBag],
  [/mode|v[êe]tement|habit|robe|femme|homme/i, Shirt],
  [/beaut[ée]|cosm[ée]tique|parfum|soin/i, Sparkles],
  [/cuisine|ustensile/i, UtensilsCrossed],
  [/maison|d[ée]co|meuble|habitat/i, Home],
  [/b[ée]b[ée]|enfant|jouet/i, Baby],
  [/sport|fitness/i, Dumbbell],
  [/auto|moto|voiture/i, Car],
  [/bijou|montre|accessoire/i, Gem],
];

/** Icône choisie d'après le nom de la catégorie ; icône « étiquette » par défaut. */
export function iconForCategory(name: string): LucideIcon {
  for (const [pattern, icon] of rules) if (pattern.test(name)) return icon;
  return Tag;
}