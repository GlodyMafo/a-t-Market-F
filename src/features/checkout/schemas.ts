import { z } from "zod";
import { cleanPhone } from "@/features/authentication/schemas";

export const paymentSchema = z.object({
  provider: z.enum(["AIRTEL", "MTN", "ORANGE", "VODACOM"], { error: "Choisissez votre opérateur" }),
  phone: z
    .string()
    .trim()
    .refine((value) => /^\+?[0-9]{9,15}$/.test(cleanPhone(value)), "Numéro invalide (9 à 15 chiffres, avec ou sans +)"),
});

export type PaymentValues = z.infer<typeof paymentSchema>;