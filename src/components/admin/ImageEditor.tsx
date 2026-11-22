"use client";

import { ImagePlus, Loader2, Star, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { prepareImage } from "@/lib/image-prepare";
import { cn, resolveImageUrl } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";
import { uploadImage } from "@/services/api/adminCatalog";

const MAX_IMAGES = 3;
const validImage = (value: string) => value.length <= 500 && (/^https:\/\//i.test(value) || /^\/uploads\/[\w.-]+$/.test(value));

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

export function ImageEditor({ value, onChange }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const full = value.length >= MAX_IMAGES;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      const url = await uploadImage(await prepareImage(file));
      onChange([...value, url]);
    } catch (error) {
      setMessage(error instanceof Error && !("kind" in error) ? error.message : errorMessage(error));
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function addLink() {
    const url = link.trim();
    if (!validImage(url)) {
      setMessage("Adresse invalide : une adresse https:// complète (500 caractères au maximum).");
      return;
    }
    if (value.includes(url)) {
      setMessage("Cette image est déjà dans la liste.");
      return;
    }
    setMessage(null);
    setLink("");
    onChange([...value, url]);
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">
        Photos <span className="font-normal text-muted">({value.length}/{MAX_IMAGES}, la première est la photo principale)</span>
      </legend>

      <ul className="grid grid-cols-3 gap-3">
        {value.map((url, index) => (
          <li key={url} className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface">
            <Image src={resolveImageUrl(url) ?? url} alt={`Photo ${index + 1}`} fill unoptimized sizes="160px" className="object-cover" />
            {index === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">Principale</span>}
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
              {index > 0 ? (
                <button type="button" aria-label="Définir comme photo principale" onClick={() => onChange([url, ...value.filter((v) => v !== url)])} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75">
                  <Star className="h-4 w-4" aria-hidden />
                </button>
              ) : (
                <span />
              )}
              <button type="button" aria-label={`Retirer la photo ${index + 1}`} onClick={() => onChange(value.filter((v) => v !== url))} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
        {!full && (
          <li>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
              className={cn("flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line text-sm font-semibold text-muted motion-safe:transition-colors hover:border-brand-500 hover:text-brand-600 disabled:opacity-60")}
            >
              {busy ? <Loader2 className="h-6 w-6 animate-spin" aria-hidden /> : <ImagePlus className="h-6 w-6" aria-hidden />}
              {busy ? "Envoi…" : "Ajouter"}
            </button>
          </li>
        )}
      </ul>

      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={(event) => onFile(event.target.files?.[0])} />

      {!full && (
        <div className="mt-3 flex gap-2">
          <label className="sr-only" htmlFor="image-link">Adresse d&apos;une image</label>
          <input
            id="image-link"
            type="url"
            value={link}
            placeholder="ou collez l'adresse d'une image (https://…)"
            onChange={(event) => setLink(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addLink();
              }
            }}
            className="h-11 min-w-0 flex-1 rounded-full border border-line px-4 text-sm outline-none focus:border-brand-500"
          />
          <button type="button" onClick={addLink} className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold hover:bg-surface">
            Ajouter
          </button>
        </div>
      )}
      {message && (
        <p role="alert" className="mt-2 text-xs text-sale">
          {message}
        </p>
      )}
    </fieldset>
  );
}