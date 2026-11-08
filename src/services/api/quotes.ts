import type { QuotePreviewResult, UserQuote } from "@/types/domain";
import { api } from "./client";
import { endpoints } from "./endpoints";

export async function listMyQuotes(signal?: AbortSignal) {
  const { data } = await api.get<UserQuote[]>(endpoints.quotes.mine, { auth: "required", signal });
  return data;
}

export type PreviewInput = { productUrl: string };

/** L'extraction chez la boutique peut être longue : délai d'attente de 90 secondes. */
export async function previewQuote(input: PreviewInput, signal?: AbortSignal) {
  const { data } = await api.post<QuotePreviewResult>(endpoints.quotes.preview, input, {
    auth: "none",
    signal,
    timeoutMs: 90_000,
  });
  return data;
}