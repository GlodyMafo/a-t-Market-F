
import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AddOutcome } from "./types";

const MAX_LINES = 50;

const localLine = z.object({
  kind: z.literal("LOCAL"),
  productId: z.string().min(1).max(100),
  name: z.string().max(200),
  imageUrl: z.string().max(2000).nullable(),
  quantity: z.number().int().min(1).max(999),
});

const internationalLine = z.object({
  kind: z.literal("INTERNATIONAL"),
  ticket: z.string().min(1).max(12000),
  name: z.string().max(300),
  imageUrl: z.string().max(2000).nullable(),
  productUrl: z.string().max(2000),
  totalPrice: z.string().regex(/^\d+(\.\d+)?$/),
  variantSku: z.string().max(100).nullable().optional(),
  isProvisional: z.boolean(),
  needsReview: z.boolean(),
  expiresAt: z.string().max(40),
  options: z.string().max(500).nullable(),
  quantity: z.number().int().min(1).max(999),
});

const lineSchema = z.discriminatedUnion("kind", [
  localLine,
  internationalLine,
]);

export type GuestLine = z.infer<typeof lineSchema>;
export type GuestInternationalLine = z.infer<typeof internationalLine>;

export const guestLineKey = (line: GuestLine) =>
  line.kind === "LOCAL"
    ? `L:${line.productId}`
    : `I:${line.ticket.length}:${line.ticket.slice(-32)}:${line.variantSku ?? ""}`;

/** Le navigateur est modifiable par l'utilisateur : tout est revalidé à la lecture. */
function sanitizeLines(raw: unknown): GuestLine[] {
  if (!Array.isArray(raw)) return [];

  const lines: GuestLine[] = [];

  for (const item of raw) {
    const parsed = lineSchema.safeParse(item);

    if (parsed.success) {
      lines.push(parsed.data);
    }

    if (lines.length >= MAX_LINES) break;
  }

  return lines;
}

interface GuestCartState {
  lines: GuestLine[];
  hydrated: boolean;

  addLocal: (input: {
    productId: string;
    name: string;
    imageUrl: string | null;
    quantity: number;
    stock: number | null;
  }) => AddOutcome;

  addInternational: (
    input: Omit<GuestInternationalLine, "kind">
  ) => AddOutcome;

  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useGuestCart = create<GuestCartState>()(
  persist(
    (set, get) => ({
      lines: [],
      hydrated: false,

      addLocal: ({ productId, name, imageUrl, quantity, stock }) => {
        const { lines } = get();

        const existing = lines.find(
          (l) => l.kind === "LOCAL" && l.productId === productId
        );

        if (stock !== null && stock <= 0) {
          return {
            ok: false,
            message: "Ce produit est en rupture de stock.",
          };
        }

        if (!existing && lines.length >= MAX_LINES) {
          return {
            ok: false,
            message:
              "Votre panier est plein. Connectez-vous pour continuer vos achats.",
          };
        }

        let desired = Math.min((existing?.quantity ?? 0) + quantity, 999);
        let message: string | undefined;

        if (stock !== null && desired > stock) {
          desired = stock;
          message = `Quantité limitée au stock disponible (${stock}).`;
        }

        const next: GuestLine = {
          kind: "LOCAL",
          productId,
          name: name.slice(0, 200),
          imageUrl,
          quantity: desired,
        };

        set({
          lines: existing
            ? lines.map((l) => (l === existing ? next : l))
            : [...lines, next],
        });

        return { ok: true, message };
      },

      addInternational: (input) => {
        const { lines } = get();

        // Conserve toutes les propriétés, notamment la quantité fournie.
        const line: GuestLine = {
          ...input,
          kind: "INTERNATIONAL",
        };

        if (lines.some((l) => guestLineKey(l) === guestLineKey(line))) {
          return {
            ok: true,
            message: "Ce produit est déjà dans votre panier.",
          };
        }

        if (lines.length >= MAX_LINES) {
          return {
            ok: false,
            message:
              "Votre panier est plein. Connectez-vous pour continuer vos achats.",
          };
        }

        set({ lines: [...lines, line] });

        return { ok: true };
      },

      setQuantity: (key, quantity) => {
        const safe = Math.min(
          Math.max(Math.trunc(quantity) || 1, 1),
          999
        );

        set({
          lines: get().lines.map((l) =>
            guestLineKey(l) === key
              ? { ...l, quantity: safe }
              : l
          ),
        });
      },

      remove: (key) =>
        set({
          lines: get().lines.filter((l) => guestLineKey(l) !== key),
        }),

      clear: () => set({ lines: [] }),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "atm.cart.v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,

      partialize: (state) => ({ lines: state.lines }),

      merge: (persisted, current) => ({
        ...current,
        lines: sanitizeLines(
          (persisted as { lines?: unknown } | undefined)?.lines
        ),
      }),
    }
  )
);
