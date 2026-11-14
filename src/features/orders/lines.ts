import { z } from "zod";
import { multiplyMoney } from "@/lib/money";
import { resolveImageUrl } from "@/lib/utils";
import { safeHost } from "@/lib/marketplace";
import type { Order } from "@/types/domain";

// On ne lit que ces champs du devis figé : le reste n'est pas affiché.
const snapshotSchema = z.object({
  productName: z.string().nullable().optional(),
  productUrl: z.string().optional(),
  options: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

export interface OrderLine {
  key: string;
  kind: "LOCAL" | "INTERNATIONAL";
  name: string;
  imageUrl: string | null;
  options: string | null;
  quantity: number;
  unitPrice: string | null;
  lineTotal: string | null;
  sourceHost: string | null;
  href: string | null;
}

export function orderLines(order: Order): OrderLine[] {
  return order.items.map((item) => {
    if (item.quoteId) {
      const parsed = snapshotSchema.safeParse(item.quoteSnapshot);
      const snapshot = parsed.success ? parsed.data : {};
      const host = snapshot.productUrl ? safeHost(snapshot.productUrl) : null;
      return {
        key: item.id,
        kind: "INTERNATIONAL",
        name: snapshot.productName ?? "Produit importé",
        imageUrl: snapshot.imageUrl?.startsWith("https://") ? snapshot.imageUrl : null,
        options: snapshot.options ?? null,
        quantity: item.quantity,
        unitPrice: null,
        lineTotal: item.price, // pour un article importé, le prix de la ligne est déjà le total pour la quantité
        sourceHost: host,
        href: host ? snapshot.productUrl! : null,
      };
    }
    const first = [...(item.product?.images ?? [])].sort((a, b) => a.position - b.position)[0]?.imageUrl;
    return {
      key: item.id,
      kind: "LOCAL",
      name: item.product?.name ?? "Produit",
      imageUrl: resolveImageUrl(first),
      options: null,
      quantity: item.quantity,
      unitPrice: item.price, // article local : prix unitaire (à vérifier sur une vraie commande)
      lineTotal: multiplyMoney(item.price, item.quantity),
      sourceHost: null,
      href: item.product ? `/products/${encodeURIComponent(item.product.id)}` : null,
    };
  });
}