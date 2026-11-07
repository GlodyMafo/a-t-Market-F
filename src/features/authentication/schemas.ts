import { z } from "zod";

export const cleanPhone = (value: string) => value.replace(/[\s.-]/g, "");
const within72Bytes = (value: string) => new TextEncoder().encode(value).length <= 72;

const email = z.string().trim().pipe(z.email("Adresse e-mail invalide"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Le mot de passe est obligatoire").refine(within72Bytes, "Mot de passe invalide"),
});

export const registerSchema = z
  .object({
    email,
    phone: z
      .string()
      .trim()
      .refine((v) => /^\+?[0-9]{9,15}$/.test(cleanPhone(v)), "Numéro invalide (9 à 15 chiffres, avec ou sans +)"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .refine(within72Bytes, "Le mot de passe est trop long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .refine(within72Bytes, "Le mot de passe est trop long"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  });

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;