"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation";

export type ActionState = { ok: boolean; message?: string; errors?: Record<string, string> };

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Iniciá sesión para continuar." };

  const parsed = profileSchema.safeParse({
    display_name: formData.get("display_name"),
    username: formData.get("username"),
    bio: formData.get("bio") ?? "",
    origin_country: formData.get("origin_country"),
    nz_start_city: formData.get("nz_start_city"),
    visa: formData.get("visa"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { ok: false, errors };
  }

  // Foto opcional: se sube al bucket "avatars" (carpeta = id del usuario).
  let avatar_url: string | undefined;
  const file = formData.get("avatar");
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      return { ok: false, errors: { avatar: "Imagen de hasta 2 MB (JPG/PNG/WebP)" } };
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) return { ok: false, message: "No pudimos subir la foto." };
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    avatar_url = `${data.publicUrl}?v=${Date.now()}`;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ ...parsed.data, bio: parsed.data.bio || null, ...(avatar_url && { avatar_url }) })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") return { ok: false, errors: { username: "Ese usuario ya existe" } };
    return { ok: false, message: "No pudimos guardar el perfil." };
  }

  revalidatePath("/timeline");
  revalidatePath("/perfil");
  return { ok: true, message: "Perfil guardado ✅" };
}
