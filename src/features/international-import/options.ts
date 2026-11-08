export interface VariantSelection {
  color?: string;
  size?: string;
}

/** Texte envoyé au panier (Lot 5) dans le champ `options` du backend (500 caractères maximum). */
export function formatOptions(selection: VariantSelection): string | undefined {
  const parts = [selection.color && `Couleur : ${selection.color}`, selection.size && `Taille : ${selection.size}`].filter(Boolean);
  const text = parts.join(" · ").slice(0, 500);
  return text || undefined;
}