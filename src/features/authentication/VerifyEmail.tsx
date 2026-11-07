"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
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

  if (!token) return <Result tone="error" title="Lien incomplet" text="Ouvrez le lien depuis l'e-mail reçu, ou demandez-en un nouveau depuis votre compte." />;
  if (mutation.isSuccess) return <Result tone="success" title="Adresse e-mail confirmée" text="Merci ! Votre compte est maintenant sécurisé." />;
  if (mutation.isError) return <Result tone="error" title="Lien invalide ou expiré" text={errorMessage(mutation.error)} />;
  return (
    <div className="flex flex-col items-center gap-3 py-6" aria-busy="true">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-hidden />
      <p className="text-sm text-muted">Vérification en cours…</p>
    </div>
  );
}

function Result({ tone, title, text }: { tone: "success" | "error"; title: string; text: string }) {
  const Icon = tone === "success" ? CheckCircle2 : XCircle;
  return (
    <div className="text-center">
      <Icon className={`mx-auto h-10 w-10 ${tone === "success" ? "text-green-600" : "text-sale"}`} aria-hidden />
      <h2 className="mt-3 text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{text}</p>
      <Link href="/account" className="mt-6 inline-block rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
        Aller à mon compte
      </Link>
    </div>
  );
}