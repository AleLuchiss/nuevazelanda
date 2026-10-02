"use client";

import { useMemo, useState } from "react";
import { Plane, Users } from "lucide-react";

export type TimelineTrip = {
  id: string;
  user_id: string;
  arrival_date: string | null;   // "YYYY-MM-DD"
  arrival_month: string | null;  // "YYYY-MM-01"
  flight_origin: string | null;
  display_name: string;
  avatar_url: string | null;
  origin_country: string | null;
  nz_start_city: string | null;
};

type View = "year" | "month" | "week";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Fecha efectiva del viaje: la exacta si existe, si no el mes estimado.
function effectiveDate(t: TimelineTrip): Date {
  return new Date((t.arrival_date ?? t.arrival_month!) + "T00:00:00");
}

// Lunes de la semana de una fecha (clave para agrupar por semana).
function weekStart(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function CommunityTimeline({ trips }: { trips: TimelineTrip[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [view, setView] = useState<View>("year");
  const [month, setMonth] = useState<number | null>(null); // 0-11
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const countries = useMemo(
    () => [...new Set(trips.map((t) => t.origin_country).filter(Boolean))].sort() as string[],
    [trips]
  );
  const cities = useMemo(
    () => [...new Set(trips.map((t) => t.nz_start_city).filter(Boolean))].sort() as string[],
    [trips]
  );

  const filtered = useMemo(
    () =>
      trips.filter((t) => {
        const d = effectiveDate(t);
        if (d.getFullYear() !== year) return false;
        if (country && t.origin_country !== country) return false;
        if (city && t.nz_start_city !== city) return false;
        if (view !== "year" && month !== null && d.getMonth() !== month) return false;
        return true;
      }),
    [trips, year, country, city, view, month]
  );

  // Agrupación según la vista: por mes (año) o por semana (mes/semana).
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; sort: number; items: TimelineTrip[] }>();
    for (const t of filtered) {
      const d = effectiveDate(t);
      let key: string, label: string, sort: number;
      if (view === "year") {
        key = String(d.getMonth());
        label = MONTHS[d.getMonth()];
        sort = d.getMonth();
      } else {
        const w = weekStart(d);
        key = w.toISOString();
        label = `Semana del ${w.getDate()} ${MONTHS[w.getMonth()]}`;
        sort = w.getTime();
      }
      if (!map.has(key)) map.set(key, { label, sort, items: [] });
      map.get(key)!.items.push(t);
    }
    return [...map.values()].sort((a, b) => a.sort - b.sort);
  }, [filtered, view]);

  const maxCount = Math.max(1, ...groups.map((g) => g.items.length));

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-fern">
          <Plane className="text-ocean" /> Timeline de Viajeros
        </h1>
        <p className="text-gray-600">
          Mirá quién viaja a Nueva Zelanda y cuándo. Armá tu grupo de viaje.
        </p>
      </header>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl bg-route-light p-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setYear(year - 1)} className="rounded px-2 py-1 hover:bg-route" aria-label="Año anterior">←</button>
          <span className="w-14 text-center font-semibold text-fern">{year}</span>
          <button onClick={() => setYear(year + 1)} className="rounded px-2 py-1 hover:bg-route" aria-label="Año siguiente">→</button>
        </div>

        <div className="flex overflow-hidden rounded-lg border border-fern/30">
          {(["year", "month", "week"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => {
                setView(v);
                if (v === "year") setMonth(null);
                else if (month === null) setMonth(now.getMonth());
              }}
              className={`px-3 py-1.5 text-sm ${
                view === v ? "bg-fern text-white" : "bg-white text-fern hover:bg-route"
              }`}
            >
              {v === "year" ? "Año" : v === "month" ? "Mes" : "Semana"}
            </button>
          ))}
        </div>

        {view !== "year" && (
          <select
            value={month ?? 0}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm"
            aria-label="Mes"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
        )}

        <select value={country} onChange={(e) => setCountry(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm" aria-label="País de origen">
          <option value="">Todos los países</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select value={city} onChange={(e) => setCity(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm" aria-label="Ciudad en NZ">
          <option value="">Todas las ciudades de NZ</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>

        <span className="ml-auto flex items-center gap-1 text-sm text-fern">
          <Users size={16} /> {filtered.length} viajero{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Línea de tiempo */}
      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          Nadie cargó viajes con estos filtros todavía. ¡Sé el primero! 🥝
        </p>
      ) : (
        <ol className="relative space-y-6 border-l-2 border-ocean/40 pl-6">
          {groups.map((g) => (
            <li key={g.label} className="relative">
              <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-2 border-white bg-ocean" />
              <div className="mb-2 flex items-center gap-3">
                <h2 className="font-semibold text-fern">{g.label}</h2>
                <div className="h-2 flex-1 max-w-xs overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full bg-ocean" style={{ width: `${(g.items.length / maxCount) * 100}%` }} />
                </div>
                <span className="text-sm text-gray-500">{g.items.length}</span>
              </div>

              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    {t.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fern text-white">
                        {t.display_name[0]?.toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-medium text-gray-900">{t.display_name}</p>
                      <p className="truncate text-gray-500">
                        {t.origin_country ?? "LATAM"} → {t.nz_start_city ?? "NZ"}
                      </p>
                      <p className="text-xs text-ocean">
                        {t.arrival_date
                          ? new Date(t.arrival_date + "T00:00:00").toLocaleDateString("es", { day: "numeric", month: "short" })
                          : "Fecha estimada"}
                        {t.flight_origin ? ` · sale de ${t.flight_origin}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
