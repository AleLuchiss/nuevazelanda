"use client";

import { useActionState, useState } from "react";
import { saveTrip } from "@/app/viajes/actions";
import type { ActionState } from "@/app/perfil/actions";

export type Trip = {
  id: string;
  arrival_date: string | null;
  arrival_month: string | null;
  flight_origin: string | null;
  flight_number: string | null;
  notes: string | null;
  is_public: boolean;
};

const initial: ActionState = { ok: false };
const input = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-ocean focus:outline-none focus:ring-1 focus:ring-ocean";

export default function TripForm({ trip }: { trip?: Trip }) {
  const [state, action, pending] = useActionState(saveTrip, initial);
  const [mode, setMode] = useState<"exact" | "month">(trip && !trip.arrival_date ? "month" : "exact");
  const e = state.errors ?? {};

  return (
    <form action={action} className="space-y-4 rounded-2xl bg-white p-6 shadow">
      {trip && <input type="hidden" name="id" value={trip.id} />}
      <input type="hidden" name="mode" value={mode} />

      <div className="flex overflow-hidden rounded-lg border border-fern/30 text-sm">
        {([["exact", "Fecha exacta"], ["month", "Mes estimado"]] as const).map(([m, label]) => (
          <button
            type="button"
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 px-3 py-2 ${mode === m ? "bg-fern text-white" : "bg-white text-fern hover:bg-route"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "exact" ? (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-fern">Fecha de llegada a NZ</span>
          <input type="date" name="arrival_date" defaultValue={trip?.arrival_date ?? ""} className={input} />
          {e.arrival_date && <span className="text-sm text-red-600">{e.arrival_date}</span>}
        </label>
      ) : (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-fern">Mes estimado de llegada</span>
          <input type="month" name="arrival_month" defaultValue={trip?.arrival_month?.slice(0, 7) ?? ""} className={input} />
          {e.arrival_month && <span className="text-sm text-red-600">{e.arrival_month}</span>}
        </label>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-fern">Sale desde (opcional)</span>
          <input name="flight_origin" placeholder="Buenos Aires (EZE)" defaultValue={trip?.flight_origin ?? ""} className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-fern">N.º de vuelo (opcional)</span>
          <input name="flight_number" placeholder="NZ31" defaultValue={trip?.flight_number ?? ""} className={input} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-fern">Notas (opcional)</span>
        <textarea name="notes" rows={2} maxLength={300} defaultValue={trip?.notes ?? ""} className={input}
          placeholder="Busco compañeros para alquilar un camper..." />
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="is_public" defaultChecked={trip?.is_public ?? true} className="h-4 w-4 accent-fern" />
        Mostrar mi viaje en el timeline público
      </label>

      <button disabled={pending}
        className="w-full rounded-xl bg-ocean px-5 py-3 font-semibold text-white transition hover:bg-ocean-dark disabled:opacity-60">
        {pending ? "Guardando…" : trip ? "Actualizar viaje" : "Agregar viaje"}
      </button>

      {state.message && <p className={`text-sm ${state.ok ? "text-fern" : "text-red-600"}`}>{state.message}</p>}
    </form>
  );
}
