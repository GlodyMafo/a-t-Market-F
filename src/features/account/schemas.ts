import { z } from "zod";
import { cleanPhone } from "@/features/authentication/schemas";

const phone = z
  .string()
  .trim()
  .refine((v) => /^\+?[0-9]{9,15}$/.test(cleanPhone(v)), "Numéro invalide (9 à 15 chiffres, avec ou sans +)");

const validBirthDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date <= new Date() && date.getUTCFullYear() >= 1900;
};

export const profileSchema = z.object({
  firstName: z.string().trim().max(60, "60 caractères au maximum"),
  lastName: z.string().trim().max(60, "60 caractères au maximum"),
  phone,
  birthDate: z.string().refine((v) => v === "" || validBirthDate(v), "Date invalide"),
  gender: z.enum(["", "FEMALE", "MALE"]),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const addressSchema = z.object({
  label: z.string().trim().max(40, "40 caractères au maximum"),
  fullName: z.string().trim().min(1, "Le nom du destinataire est obligatoire").max(100, "100 caractères au maximum"),
  phone,
  city: z.string().trim().min(1, "La ville est obligatoire").max(80, "80 caractères au maximum"),
  commune: z.string().trim().max(80, "80 caractères au maximum"),
  neighborhood: z.string().trim().min(1, "Le quartier est obligatoire").max(100, "100 caractères au maximum"),
  street: z.string().trim().min(1, "L'avenue ou la rue est obligatoire").max(150, "150 caractères au maximum"),
  landmark: z.string().trim().max(150, "150 caractères au maximum"),
  isDefault: z.boolean(),
});
export type AddressValues = z.infer<typeof addressSchema>;

/** Création : les champs vides sont omis. Modification : ils sont envoyés à null pour effacer la valeur. */
export function toAddressBody(values: AddressValues, mode: "create" | "update") {
  const optional = (value: string) => (value === "" ? (mode === "update" ? null : undefined) : value);
  return {
    label: optional(values.label),
    fullName: values.fullName,
    phone: cleanPhone(values.phone),
    city: values.city,
    commune: optional(values.commune),
    neighborhood: values.neighborhood,
    street: values.street,
    landmark: optional(values.landmark),
    isDefault: values.isDefault,
  };
}

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Saisissez votre mot de passe actuel"),
    newPassword: z
      .string()
      .min(8, "Au moins 8 caractères")
      .refine((v) => new TextEncoder().encode(v).length <= 72, "Mot de passe trop long"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ["confirmPassword"], message: "Les mots de passe ne correspondent pas" })
  .refine((d) => d.newPassword !== d.currentPassword, { path: ["newPassword"], message: "Choisissez un mot de passe différent de l'actuel" });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;