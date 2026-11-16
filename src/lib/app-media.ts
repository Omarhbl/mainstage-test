import "server-only";
import sharp from "sharp";
import { isHttpsUrl } from "@/lib/app-config";

export type AppImageKind = "radio" | "webradio" | "home_banner" | "home_mrec";
export const APP_IMAGE_KINDS: AppImageKind[] = ["radio", "webradio", "home_banner", "home_mrec"];
export const MAX_APP_IMAGE_BYTES = 8 * 1024 * 1024;
export function checkAppImageSize(kind: AppImageKind, width: number, height: number) {
  if (kind === "radio" && (width !== height || width < 1000)) throw new Error("Radio artwork must be square and at least 1000 × 1000 pixels.");
  if (kind === "webradio" && (width < 800 || height < 800)) throw new Error("Webradio covers must be at least 800 × 800 pixels.");
  if (kind === "home_banner" && (width < 640 || height < 200 || width * 200 !== height * 640)) throw new Error("Home banners must have a 3.2:1 ratio, at least 640 × 200 pixels.");
  if (kind === "home_mrec" && (width < 600 || height < 500 || width * 500 !== height * 600)) throw new Error("Home rectangles must have a 6:5 ratio, at least 600 × 500 pixels.");
}
export async function inspectAppImage(bytes: Uint8Array, kind: AppImageKind) {
  if (bytes.length > MAX_APP_IMAGE_BYTES) throw new Error("Images must be under 8 MB.");
  const info = await sharp(bytes, { limitInputPixels: 40000000 }).metadata();
  if (!info.width || !info.height || !["jpeg", "png", "webp"].includes(info.format ?? "") || (info.pages ?? 1) > 1) throw new Error("Choose a static JPG, PNG or WebP image.");
  checkAppImageSize(kind, info.width, info.height);
  return { width: info.width, height: info.height, format: info.format };
}
export async function verifyAppImageUrl(value: string, kind: AppImageKind) {
  if (!value && kind === "radio") return;
  if (!isHttpsUrl(value)) throw new Error("Image links must use HTTPS.");
  const url = new URL(value);
  const storage = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
  const allowed = (storage && url.hostname === storage.hostname && url.pathname.startsWith("/storage/v1/object/public/media-assets/")) || (url.hostname === "res.cloudinary.com" && url.pathname.includes("/image/upload/")) || (["www.themainstagent.com", "themainstagent.com"].includes(url.hostname) && /\.(png|jpe?g|webp)$/i.test(url.pathname) && !url.pathname.startsWith("/api/"));
  if (!allowed || (url.port && url.port !== "443")) throw new Error("Upload this image here, or use an existing Mainstage media / Cloudinary image URL.");
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(10000), cache: "no-store" });
  if (!response.ok || !response.body) throw new Error("The image could not be loaded. Upload it again or check its link.");
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try { while (true) { const { done, value: chunk } = await reader.read(); if (done) break; size += chunk.length; if (size > MAX_APP_IMAGE_BYTES) throw new Error("Images must be under 8 MB."); chunks.push(chunk); } } finally { await reader.cancel(); }
  await inspectAppImage(Buffer.concat(chunks), kind);
}
