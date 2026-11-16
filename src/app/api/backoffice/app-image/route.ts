import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { inspectAppImage, APP_IMAGE_KINDS, MAX_APP_IMAGE_BYTES, type AppImageKind } from "@/lib/app-media";
export async function POST(request: Request) {
  await requireBackofficeAccess(["admin"]);
  try {
    const data = await request.formData(); const file = data.get("file"); const kind = String(data.get("kind")) as AppImageKind;
    if (!APP_IMAGE_KINDS.includes(kind) || !(file instanceof File) || !file.size) return Response.json({ error: "Choose an image and a valid placement." }, { status: 400 });
    if (file.size > MAX_APP_IMAGE_BYTES) return Response.json({ error: "Images must be under 8 MB." }, { status: 400 });
    const bytes = new Uint8Array(await file.arrayBuffer()); const info = await inspectAppImage(bytes, kind);
    const client = createSupabaseAdminClient(); if (!client) throw new Error("Media storage is unavailable.");
    const path = `app/${kind}/${crypto.randomUUID()}.${info.format === "jpeg" ? "jpg" : info.format}`;
    const { error } = await client.storage.from("media-assets").upload(path, bytes, { contentType: `image/${info.format}`, upsert: false, cacheControl: "3600" });
    if (error) throw new Error("Image upload failed. Please try again.");
    const { data: asset } = client.storage.from("media-assets").getPublicUrl(path);
    return Response.json({ url: asset.publicUrl, width: info.width, height: info.height });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Image upload failed." }, { status: 400 }); }
}
