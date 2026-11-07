import { useSyncExternalStore } from "react";

const STEP_MS = 30_000;

function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, STEP_MS);
  return () => clearInterval(timer);
}

/** Heure courante arrondie à 30 s. Vaut 0 côté serveur : ne jamais en déduire une expiration avant l'hydratation. */
export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / STEP_MS) * STEP_MS,
    () => 0,
  );
}