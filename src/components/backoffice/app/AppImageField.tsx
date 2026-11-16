"use client";
import { useId, useState } from "react";
import type { AppImageKind } from "@/lib/app-media";

export default function AppImageField({ label, value, kind, onChange, onBusy }: { label: string; value: string; kind: AppImageKind; onChange: (url: string) => void; onBusy: (busy: boolean) => void }) {
  const id = useId(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); onBusy(true); setError("");
    try {
      if (file.size > 4 * 1024 * 1024) throw new Error("Images must be under 4 MB.");
      const form = new FormData(); form.set("file", file); form.set("kind", kind);
      const response = await fetch("/api/backoffice/app-image", { method: "POST", body: form });
      if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("Your session may have expired. Save your work and sign in again.");
      const result = await response.json(); if (!response.ok || !result.url) throw new Error(result.error || "Upload failed.");
      onChange(result.url);
    } catch (error) { setError(error instanceof Error ? error.message : "Upload failed."); }
    finally { setBusy(false); onBusy(false); }
  }
  return <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-medium">{label}</label>
    <input id={id} type="url" value={value} onChange={event => onChange(event.target.value)} placeholder="https://…" disabled={busy} className="w-full rounded-xl border border-black/15 bg-[#faf8f6] p-3 text-sm" />
    <label className="block text-xs font-medium">Or upload JPG, PNG or WebP
      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event => { void upload(event.target.files?.[0]); event.target.value = ""; }} className="mt-2 block max-w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#CE2127] file:px-3 file:py-2 file:text-white" />
    </label>
    <p className="text-xs leading-relaxed text-black/60">{kind === "radio" ? "Square, at least 1000 × 1000 px." : kind === "webradio" ? "At least 800 × 800 px; square is recommended." : kind === "home_banner" ? "640 × 200 px, or a larger image with the same 3.2:1 ratio." : "600 × 500 px, or a larger image with the same 6:5 ratio."} Up to 4 MB. Existing links must be from Mainstage media or Cloudinary.</p>
    {value.startsWith("https://") ? <img src={value} alt={`${label} preview`} className={`max-h-40 max-w-full rounded-lg bg-black/5 object-contain ${kind === "home_banner" ? "aspect-[3.2]" : kind === "home_mrec" ? "aspect-[1.2]" : "aspect-square"}`} /> : null}
    <p role="status" className="text-xs text-[#9f1b20]">{busy ? "Uploading…" : error}</p>
  </div>;
}
