import { z } from "zod";

const schema = z.object({
  label: z.string().nullable().optional(),
  fullName: z.string(),
  phone: z.string(),
  city: z.string(),
  commune: z.string().nullable().optional(),
  neighborhood: z.string(),
  street: z.string(),
  landmark: z.string().nullable().optional(),
});

export type DeliveryAddressView = z.infer<typeof schema>;

/** Adresse figée dans une commande ; null pour les commandes anciennes ou si le contenu est illisible. */
export function readDeliveryAddress(raw: unknown): DeliveryAddressView | null {
  const parsed = schema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}