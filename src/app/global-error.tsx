"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui", textAlign: "center", padding: "4rem 1rem" }}>
        <h2>Un problème est survenu</h2>
        <button type="button" onClick={reset}>Réessayer</button>
      </body>
    </html>
  );
}