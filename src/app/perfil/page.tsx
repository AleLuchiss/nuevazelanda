import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/profile/ProfileForm";

export const metadata = { title: "Mi perfil | Kiwi Latino" };

export default async function MyProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/perfil");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, bio, avatar_url, origin_country, nz_start_city, visa")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold text-fern">Tu perfil de viajero</h1>
      <p className="mb-6 text-gray-600">Así te van a ver los demás en el timeline.</p>
      <ProfileForm profile={profile} />
    </main>
  );
}
