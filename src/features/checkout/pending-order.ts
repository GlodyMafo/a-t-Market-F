const KEY = "atm.checkout.order";

/** Mémorise la commande en cours dans l'onglet : si le paiement est interrompu, on la retrouve. */
export function rememberOrder(orderId: string): void {
  try {
    sessionStorage.setItem(KEY, orderId);
  } catch {
    /* stockage indisponible : sans conséquence */
  }
}

export function readPendingOrder(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function forgetOrder(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignoré */
  }
}