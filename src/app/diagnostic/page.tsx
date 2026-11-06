"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getReadiness } from "@/services/api/health";

export default function DiagnosticPage() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["health", "ready"],
    queryFn: ({ signal }) => getReadiness(signal),
  });

  if (isLoading) return <p className="p-8 text-center text-sm text-muted">Vérification de l&apos;API…</p>;
  if (error) return <ErrorState title="API injoignable" message={(error as Error).message} onRetry={() => refetch()} />;

  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-xl font-bold text-brand-600">A&amp;T Market</h1>
      <p className="mt-2 text-sm">
        API : <strong>{data?.status}</strong> · Base de données : <strong>{data?.database}</strong>
      </p>
    </main>
  );
}