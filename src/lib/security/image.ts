import "server-only";
import sharp from "sharp";

export const MAX_EDITOR_IMAGE_BYTES = 4 * 1024 * 1024;

/** Decode and re-encode, stripping metadata and rejecting disguised/animated files. */
export async function prepareEditorImage(file: File) {
  if (!file.size || file.size > MAX_EDITOR_IMAGE_BYTES) {
    throw new Error("Choose an image under 4 MB.");
  }
  try {
    const input = new Uint8Array(await file.arrayBuffer());
    const image = sharp(input, { limitInputPixels: 40000000, failOn: "warning" });
    const info = await image.metadata();
    if (!info.width || !info.height || !["jpeg", "png", "webp"].includes(info.format ?? "") || (info.pages ?? 1) !== 1) {
      throw new Error("Unsupported image.");
    }
    const bytes = await image.webp({ quality: 90 }).toBuffer();
    if (bytes.length > MAX_EDITOR_IMAGE_BYTES) throw new Error("Image too large.");
    return { bytes, contentType: "image/webp", extension: "webp" };
  } catch {
    throw new Error("Choose a valid static JPG, PNG or WebP image under 4 MB.");
  }
}
