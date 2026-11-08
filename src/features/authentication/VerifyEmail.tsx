"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { StatusPanel, statusButton } from "@/components/feedback/StatusPanel";
import { fetchMe, verifyEmail } from "@/services/api/auth";
import { errorMessage } from "@/services/api/errors";
import { tokenStorage } from "@/lib/token-storage";
import { useSession } from "./session.store";

export function VerifyEmail() {
  const token = useSearchParams().get("token") ?? "";
  const started = useRef(false);

  const mutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: async () => {
      // Si la personne est connectée, on rafraîchit son profil pour faire disparaître la bannière.
      if (tokenStorage.get()) {
        try {
          useSession.getState().setUser(await fetchMe());
        } catch {
          /* sans importance : le badge se mettra à jour au prochain chargement */
        }
      }
    },
  });

  // Une seule validation, même en mode strict de développement (le jeton est à usage unique).
  useEffect(() => {
    if (token && !started.current) {
      started.current = true;
      mutation.mutate(token);
    }
  }, [token, mutation]);

  const action = (
    <Link href="/account" className={statusButton}>
      Aller à mon compte
    </Link>
  );

  if (!token) {
    return (
      <StatusPanel tone="error" title="Lien incomplet" action={action}>
        <p>Ouvrez le lien depuis l&apos;e-mail reçu, ou demandez-en un nouveau depuis votre compte.</p>
      </StatusPanel>
    );
  }
  if (mutation.isSuccess) {
    return (
      <StatusPanel tone="success" title="Adresse e-mail confirmée" action={action}>
        <p>Merci ! Votre compte est maintenant sécurisé.</p>
      </StatusPanel>
    );
  }
  if (mutation.isError) {
    return (
      <StatusPanel tone="error" title="Lien invalide ou expiré" action={action}>
        <p>{errorMessage(mutation.error)}</p>
      </StatusPanel>
    );
  }
  return (
    <div role="status" aria-busy="true" className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-hidden />
      </span>
      <p className="text-sm text-muted">Vérification en cours…</p>
    </div>
  );
}