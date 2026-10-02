import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TripForm, { type Trip } from "@/components/trips/TripForm";
import { deleteTrip } from "@/app/viajes/actions";

export const metadata = { title: "Mis viajes | Kiwi Latino" };

function fmt(t: Trip) {
  return t.arrival_date
    ? new Date(t.arrival_date + "T00:00:00").toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })
    : new Date(t.arrival_month + "T00:00:00").toLocaleDateString("es", { month: "long", year: "numeric" }) + " (estimado)";
}

export default async function MyTripsPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const { editar } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/viajes");

  // Sin perfil completo no se puede aparecer bien en el timeline.
  const { data: profile } = await supabase
    .from("profiles")
    .select("origin_country, nz_start_city")
    .eq("id", user.id)
    .single();
  const profileIncomplete = !profile?.origin_country || !profile?.nz_start_city;

  const { data } = await supabase
    .from("trips")
    .select("id, arrival_date, arrival_month, flight_origin, flight_number, notes, is_public")
    .eq("user_id", user.id)
    .order("arrival_month", { ascending: true });

  const trips = (data ?? []) as Trip[];
  const editing = trips.find((t) => t.id === editar);

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-fern">Mis viajes ✈️</h1>
        <p className="text-gray-600">Cargá cuándo viajás para encontrarte con otros viajeros.</p>
      </div>

      {profileIncomplete && (
        <p className="rounded-lg bg-route p-3 text-sm text-fern">
          Completá tu <Link href="/perfil" className="font-semibold underline">perfil</Link> (país y
          ciudad en NZ) para que te vean bien en el timeline.
        </p>
      )}

      <section>
        <h2 className="mb-3 text-xl font-semibold text-fern">{editing ? "Editar viaje" : "Nuevo viaje"}</h2>
        <TripForm key={editing?.id ?? "new"} trip={editing} />
        {editing && <Link href="/viajes" className="mt-2 inline-block text-sm text-ocean underline">Cancelar edición</Link>}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-fern">Mis viajes cargados</h2>
        {trips.length === 0 ? (
          <p className="text-gray-500">Todavía no cargaste ninguno.</p>
        ) : (
          <ul className="space-y-2">
            {trips.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3">
                <div className="text-sm">
                  <p className="font-medium capitalize text-gray-900">{fmt(t)}</p>
                  <p className="text-gray-500">
                    {t.flight_origin ?? "—"} {t.flight_number ? `· ${t.flight_number}` : ""} · {t.is_public ? "Público" : "Privado"}
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  <Link href={`/viajes?editar=${t.id}`} className="text-ocean hover:underline">Editar</Link>
                  <form action={deleteTrip}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="text-red-600 hover:underline">Borrar</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
