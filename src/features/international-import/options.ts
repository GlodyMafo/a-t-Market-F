import type { QuoteVariant, QuoteVariantGroup, QuoteVariantOptions} from "@/types/domain";

/** Valeur choisie par groupe d'options : { Couleur: "Noir", Taille: "M" }. */
export type Selected = Record<string, string>;

export const isComplete = (options: QuoteVariantOptions, selected: Selected) =>
  options.groups.every((group) => selected[group.name] !== undefined);

export const missingGroups = (options: QuoteVariantOptions, selected: Selected) =>
  options.groups.filter((group) => selected[group.name] === undefined).map((group) => group.name);

/** Un groupe « informatif » (ex. couleur SHEIN) est choisi par le client mais ne désigne pas de variante. */
const selecting = (group: QuoteVariantGroup) => group.selectsVariant !== false;

export function findVariant(options: QuoteVariantOptions, selected: Selected): QuoteVariant | null {
  if (options.variants.length === 0 || !isComplete(options, selected)) return null;
  const groups = options.groups.filter(selecting);
  return options.variants.find((v) => groups.every((g) => v.selection[g.name] === selected[g.name])) ?? null;
}

/** Une valeur est proposée si une variante disponible la contient avec les autres choix déjà faits. */
export function isValueAvailable(options: QuoteVariantOptions, selected: Selected, groupName: string, value: string): boolean {
  const group = options.groups.find((g) => g.name === groupName);
  const listed = group?.values.find((v) => v.value === value);
  if (!group || options.variants.length === 0 || !selecting(group)) return listed?.available ?? true;
  return options.variants.some(
    (v) =>
      v.available &&
      v.selection[groupName] === value &&
      Object.entries(selected).every(([name, chosen]) => {
        const other = options.groups.find((g) => g.name === name);
        return name === groupName || !other || !selecting(other) || v.selection[name] === undefined || v.selection[name] === chosen;
      }),
  );
}

/** Nouveau choix ; les autres choix devenus impossibles avec lui sont retirés. */
export function applyChoice(options: QuoteVariantOptions, selected: Selected, groupName: string, value: string): Selected {
  const next: Selected = { ...selected, [groupName]: value };
  for (const group of options.groups) {
    if (group.name === groupName || next[group.name] === undefined) continue;
    if (!isValueAvailable(options, next, group.name, next[group.name])) delete next[group.name];
  }
  return next;
}

/** Texte transmis au panier (champ « options », 500 caractères maximum). */
export function formatOptions(options: QuoteVariantOptions | null, selected: Selected): string | undefined {
  if (!options) return undefined;
  const text = options.groups
    .filter((g) => selected[g.name] !== undefined)
    .map((g) => `${g.name} : ${selected[g.name]}`)
    .join(" · ")
    .slice(0, 500);
  return text || undefined;
}