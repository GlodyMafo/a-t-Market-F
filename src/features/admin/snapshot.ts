import { z } from "zod";
import { safeHost } from "@/lib/marketplace";

const schema = z.object({
  productName: z.string().nullable().optional(),
  productUrl: z.string().optional(),
  options: z.string().nullable().optional(),
});

export function readSnapshot(raw: unknown) {
  const parsed = schema.safeParse(raw);
  const data = parsed.success ? parsed.data : {};
  const host = data.productUrl ? safeHost(data.productUrl) : null;
  return {
    name: data.productName ?? "Produit importé",
    options: data.options ?? null,
    url: host ? (data.productUrl as string) : null,
    host,
  };
}