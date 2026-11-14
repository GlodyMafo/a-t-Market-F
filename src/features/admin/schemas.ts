import { z } from "zod";

export const approveSchema = z.object({
  weightKg: z
    .string()
    .trim()
    .refine((v) => v === "" || (Number.isFinite(Number(v)) && Number(v) > 0 && Number(v) <= 1000 && /^\d+([.,]\d{1,2})?$/.test(v)), "Poids invalide : un nombre positif, 1000 kg maximum, 2 décimales maximum"),
  adminNotes: z.string().trim().max(500, "500 caractères maximum"),
});
export type ApproveValues = z.infer<typeof approveSchema>;

export const rejectSchema = z.object({
  adminNotes: z.string().trim().min(3, "Le motif doit contenir au moins 3 caractères").max(500, "500 caractères maximum"),
});
export type RejectValues = z.infer<typeof rejectSchema>;