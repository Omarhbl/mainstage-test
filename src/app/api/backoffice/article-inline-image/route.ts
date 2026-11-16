import { NextResponse } from "next/server";
import { prepareEditorImage } from "@/lib/security/image";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const BACKOFFICE_MEDIA_BUCKET = "media-assets";

export async function POST(request: Request) {
  await requireBackofficeAccess(["admin", "editor"]);

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "Missing service role key in .env.local." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Please choose an image first." },
      { status: 400 }
    );
  }

  let image;
  try { image = await prepareEditorImage(file); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid image." }, { status: 400 }); }
  const storagePath = `article-body/${crypto.randomUUID()}.${image.extension}`;
  const { error } = await adminClient.storage.from(BACKOFFICE_MEDIA_BUCKET)
    .upload(storagePath, image.bytes, { cacheControl: "3600", upsert: false, contentType: image.contentType });

  if (error) {
    return NextResponse.json(
      {
        error:
          "We couldn’t upload that inline image yet. Please make sure the media-assets bucket exists in Supabase Storage.",
      },
      { status: 500 }
    );
  }

  const { data } = adminClient.storage
    .from(BACKOFFICE_MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  return NextResponse.json({ url: data.publicUrl });
}
