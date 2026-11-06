import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <p className="text-sm text-muted">Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" className="mt-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}