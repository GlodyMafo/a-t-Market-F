"use client";

import { useMutation } from "@tanstack/react-query";
import { MailWarning } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/features/authentication/session.store";
import { errorMessage } from "@/services/api/errors";
import { resendVerificationEmail } from "@/services/api/auth";

export function VerifyEmailBanner() {
  const user = useSession((s) => s.user);
  const mutation = useMutation({
    mutationFn: resendVerificationEmail,
    onSuccess: () => toast.success("E-mail envoyé. Vérifiez votre boîte de réception."),
    onError: (error) => toast.error(errorMessage(error)),
  });

  // Tant que le backend n'envoie pas `emailVerifiedAt` (champ absent), on n'affiche rien.
  if (!user || user.emailVerifiedAt !== null) return null;

  return (
    <div role="status" className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold text-amber-900">Confirmez votre adresse e-mail</p>
          <p className="text-amber-800">Un lien vous a été envoyé à {user.email}. Il est valable 24 heures.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="h-10 shrink-0 rounded-lg bg-amber-700 px-4 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
      >
        {mutation.isPending ? "Envoi…" : "Renvoyer l'e-mail"}
      </button>
    </div>
  );
}