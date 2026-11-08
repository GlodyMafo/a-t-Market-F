/** Ordre d'affichage selon l'utilité commerciale. Le premier motif qui correspond gagne : du plus précis au plus général. */
const rules: Array<[RegExp, number]> = [
  [/chaussure|basket|sandale/i, 1],
  [/sac|bagage/i, 2],
  [/beaut[ée]|cosm[ée]tique|parfum|soin/i, 3],
  [/t[ée]l[ée]phone|mobile|smartphone/i, 4],
  [/[ée]lectro|informat|ordinateur|audio/i, 5],
  [/bijou|montre|accessoire/i, 8],
  [/b[ée]b[ée]|enfant|jouet/i, 7],
  [/sport|fitness/i, 9],
  [/auto|moto|voiture/i, 10],
  [/cuisine|ustensile|maison|d[ée]co|meuble|habitat/i, 6],
  [/mode|v[êe]tement|habit|robe|femme|homme|pr[êe]t/i, 0],
];

const FEATURED_COUNT = 4;

function rankOf(name: string): number {
  for (const [pattern, rank] of rules) if (pattern.test(name)) return rank;
  return 99;
}

/** Trie les catégories par priorité (ordre de l'API conservé à égalité) et marque les premières « à la une ». */
export function prioritizeCategories<T extends { name: string }>(list: readonly T[]): Array<{ item: T; featured: boolean }> {
  return list
    .map((item, index) => ({ item, index, rank: rankOf(item.name) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ item, rank }, position) => ({ item, featured: rank < 99 && position < FEATURED_COUNT }));
}