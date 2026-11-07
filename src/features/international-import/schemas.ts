import { z } from "zod";
import { extractUrl, isHttpsUrl } from "@/lib/marketplace";

export const importSchema = z.object({
  productUrl: z
    .string()
    .trim()
    .min(1, "Collez le lien du produit")
    .transform(extractUrl)
    .pipe(
      z
        .string()
        .max(2000, "Ce lien est trop long")
        .refine(isHttpsUrl, "Le lien doit être une adresse complète commençant par https://"),
    ),
  categoryId: z.string().min(1, "Choisissez une catégorie"),
  subCategoryId: z.string().min(1, "Choisissez une sous-catégorie"),
});

export type ImportValues = z.infer<typeof importSchema>;