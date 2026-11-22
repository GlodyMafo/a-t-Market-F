const MAX_SIDE = 1600;
const MAX_BYTES = 5 * 1024 * 1024;

/** Réduit l'image dans le navigateur (1 600 px, WebP) avant l'envoi : moins lourd pour vos clients et pour le stockage. */
export async function prepareImage(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new Error("Format non pris en charge : utilisez une image JPEG, PNG ou WebP.");
  }
  let result: Blob = file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const small = scale === 1 && file.size <= 500_000 && file.type !== "image/png";
    if (!small) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
        if (blob && blob.size < file.size) result = blob;
      }
    }
    bitmap.close();
  } catch {
    result = file; // navigateur sans traitement d'image : on envoie l'original
  }
  if (result.size > MAX_BYTES) throw new Error("Cette image dépasse 5 Mo même après réduction. Choisissez-en une plus légère.");
  return result;
}