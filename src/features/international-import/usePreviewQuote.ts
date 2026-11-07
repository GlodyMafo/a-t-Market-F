"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { previewQuote, type PreviewInput } from "@/services/api/quotes";

export function usePreviewQuote() {
  const controller = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: (input: PreviewInput) => {
      controller.current?.abort();
      const next = new AbortController();
      controller.current = next;
      return previewQuote(input, next.signal);
    },
  });

  const { reset } = mutation;
  /** Interrompt l'analyse en cours et efface son état. */
  const cancel = useCallback(() => {
    controller.current?.abort();
    reset();
  }, [reset]);

  return { mutation, cancel };
}