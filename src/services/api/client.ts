import { env } from "@/lib/env";
import { tokenStorage } from "@/lib/token-storage";
import type { ApiFailureBody, ApiSuccessBody } from "@/types/api";
import { ApiError, kindFromStatus } from "./errors";

type Query = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: Query;
  body?: unknown;
  /** "optional" : joint le jeton s'il existe. "required" : refuse l'appel sans jeton. "none" : jamais de jeton. */
  auth?: "none" | "optional" | "required";
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface ApiResult<T> {
  data: T;
  meta?: ApiSuccessBody<T>["meta"];
}

let onUnauthorized: (() => void) | null = null;
/** Appelé quand le backend rejette un jeton (401) : la session doit être fermée. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${env.apiUrl}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { method = "GET", query, body, auth = "optional", signal, timeoutMs = 20_000 } = options;

  const token = auth === "none" ? null : tokenStorage.get();
  if (auth === "required" && !token) {
    throw new ApiError("Connexion requise.", "unauthorized", 401);
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener("abort", forwardAbort);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    if (timedOut) {
      throw new ApiError("Le serveur met trop de temps à répondre. Réessayez.", "timeout");
    }
    if (signal?.aborted) throw error; // annulation voulue par l'appelant
    throw new ApiError("Impossible de joindre le serveur. Vérifiez votre connexion.", "network");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forwardAbort);
  }

  let json: unknown = null;
  try {
    const text = await response.text();
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  const payload = json as Partial<ApiSuccessBody<T>> & Partial<ApiFailureBody> | null;

  if (!response.ok || payload?.success === false) {
    const kind = kindFromStatus(response.status);
    if (response.status === 401 && token) onUnauthorized?.();
    const fallback =
      kind === "server"
        ? "Le serveur rencontre un problème. Réessayez plus tard."
        : kind === "rate_limited"
          ? "Trop de demandes. Patientez un instant."
          : "La requête a échoué.";
    throw new ApiError(payload?.message ?? fallback, kind, response.status, payload?.code, payload?.errors);
  }

  if (payload === null || payload.success !== true) {
    throw new ApiError("Réponse inattendue du serveur.", "unknown", response.status);
  }

  return { data: payload.data as T, meta: payload.meta };
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};