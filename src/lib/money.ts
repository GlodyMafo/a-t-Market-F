/**
 * Montants en centimes entiers (jamais de flottants).
 * Réservé à l'AFFICHAGE d'estimations : le backend reste la référence de tout total officiel.
 */
export function toCents(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const text = typeof value === "number" ? value.toFixed(2) : value.trim();
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(text);
  if (!match) return null;
  const [, sign, whole, fraction = ""] = match;
  const cents = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
  return sign ? -cents : cents;
}

export function fromCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

export function multiplyMoney(value: string | null, quantity: number): string | null {
  const cents = toCents(value);
  return cents === null ? null : fromCents(cents * quantity);
}

export function sumMoney(values: Array<string | null>): string {
  return fromCents(values.reduce<number>((sum, value) => sum + (toCents(value) ?? 0), 0));
}