export async function fileToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    // URL revoked later after draw to canvas is OK too; this is fine in most cases.
    // If you see decode issues in Safari, revoke after draw instead.
  }
}

export async function compressImageUnder1MB(
  file: File,
  opts?: {
    maxBytes?: number; // default 1MB
    maxWidth?: number; // default 1600
    maxHeight?: number; // default 1600
    mime?: "image/jpeg" | "image/webp"; // default jpeg
  },
): Promise<File> {
  const maxBytes = opts?.maxBytes ?? 1_000_000;
  const maxWidth = opts?.maxWidth ?? 1600;
  const maxHeight = opts?.maxHeight ?? 1600;
  const mime = opts?.mime ?? "image/jpeg";

  // If already under 1MB, keep it.
  if (file.size <= maxBytes) return file;

  // Some images can't be drawn if they're HEIC; in that case you need a converter.
  const img = await fileToImage(file);

  // Resize while preserving aspect ratio
  let { width, height } = img;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Optional: improve downscale quality a bit
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(img, 0, 0, width, height);

  // Try a few quality steps until we get under 1MB
  const qualities = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35];

  for (const q of qualities) {
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, mime, q),
    );
    if (!blob) continue;

    if (blob.size <= maxBytes) {
      return new File([blob], renameExt(file.name, mime), { type: mime });
    }
  }

  // Last resort: return best effort (smallest tried)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, 0.3),
  );
  if (!blob) throw new Error("Compression failed");

  if (blob.size > maxBytes) {
    throw new Error("Could not compress under 1MB. Try a smaller image.");
  }

  return new File([blob], renameExt(file.name, mime), { type: mime });
}

function renameExt(original: string, mime: string) {
  const base = original.replace(/\.[^/.]+$/, "");
  const ext = mime === "image/webp" ? "webp" : "jpg";
  return `${base}.${ext}`;
}
