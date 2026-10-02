"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tripSchema } from "@/lib/validation";
import type { ActionState } from "@/app/perfil/actions";

export async function saveTrip(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Iniciá sesión para continuar." };

  const parsed = tripSchema.safeParse({
    mode: formData.get("mode"),
    arrival_date: formData.get("arrival_date") || undefined,
    arrival_month: formData.get("arrival_month") || undefined,
    flight_origin: formData.get("flight_origin") ?? "",
    flight_number: formData.get("flight_number") ?? "",
    notes: formData.get("notes") ?? "",
    is_public: formData.get("is_public") === "on",
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { ok: false, errors };
  }

  const v = parsed.data;
  // arrival_month siempre se completa (primer día del mes) para agrupar en el timeline.
  const arrival_date = v.mode === "exact" ? v.arrival_date! : null;
  const arrival_month = v.mode === "exact" ? `${v.arrival_date!.slice(0, 7)}-01` : `${v.arrival_month}-01`;

  const row = {
    user_id: user.id,
    arrival_date,
    arrival_month,
    flight_origin: v.flight_origin || null,
    flight_number: v.flight_number || null,
    notes: v.notes || null,
    is_public: v.is_public,
  };

  const id = formData.get("id");
  const { error } = id
    ? await supabase.from("trips").update(row).eq("id", String(id)).eq("user_id", user.id)
    : await supabase.from("trips").insert(row);

  if (error) return { ok: false, message: "No pudimos guardar el viaje." };

  revalidatePath("/timeline");
  revalidatePath("/viajes");
  return { ok: true, message: id ? "Viaje actualizado ✅" : "Viaje agregado al timeline 🛫" };
}

export async function deleteTrip(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("trips").delete().eq("id", String(formData.get("id"))).eq("user_id", user.id);

  revalidatePath("/timeline");
  revalidatePath("/viajes");
}
