import { api } from "./client";
import { endpoints } from "./endpoints";

// /health/ready renvoie { status, database } sans le champ `success` : lecture directe.
export async function getReadiness(signal?: AbortSignal): Promise<{ status: string; database: string }> {
  const { env } = await import("@/lib/env");
  const res = await fetch(`${env.apiUrl}${endpoints.health.ready}`, { cache: "no-store", signal });
  const json = (await res.json().catch(() => null)) as { status?: string; database?: string } | null;
  if (!res.ok || json?.status !== "ok") {
    throw new Error(json?.database === "unreachable" ? "Base de données injoignable" : "API indisponible");
  }
  return { status: json.status, database: json.database ?? "ok" };
}

void api;