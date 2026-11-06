import type { ApiFieldError } from "@/types/api";

export type ApiErrorKind =
  | "network" | "timeout" | "unauthorized" | "forbidden" | "not_found"
  | "validation" | "conflict" | "rate_limited" | "server" | "unknown";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly kind: ApiErrorKind,
    public readonly status: number = 0,
    public readonly code?: string,
    public readonly fieldErrors?: ApiFieldError[],
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Seules les erreurs transitoires méritent une nouvelle tentative automatique. */
  get retryable(): boolean {
    return this.kind === "network" || this.kind === "timeout" || this.kind === "server";
  }
}

export function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 429) return "rate_limited";
  if (status === 400 || status === 413 || status === 422) return "validation";
  if (status >= 500) return "server";
  return "unknown";
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Une erreur est survenue. Réessayez.";
}