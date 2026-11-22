import { z } from "zod";

const money = (label: string, { min }: { min: "positive" | "zero" }) =>
  z
    .string()
    .trim()
    .regex(/^\d+([.,]\d{1,2})?$/, `${label} : montant invalide (2 décimales au maximum)`)
    .refine((v) => (min === "positive" ? Number(v.replace(",", ".")) > 0 : true), `${label} doit être supérieur à 0`);

export const productSchema = z.object({
  name: z.string().trim().min(1, "Le nom est obligatoire").max(150, "150 caractères au maximum"),
  description: z.string().trim().max(1000, "1 000 caractères au maximum"),
  price: money("Le prix d'achat", { min: "positive" }),
  margin: money("La marge", { min: "zero" }),
  subCategoryId: z.string().min(1, "Choisissez une sous-catégorie"),
  stock: z.string().trim().regex(/^\d{1,6}$/, "Un nombre entier, 0 ou plus"),
});
export type ProductValues = z.infer<typeof productSchema>;

export const toNumber = (value: string) => Number(value.replace(",", "."));