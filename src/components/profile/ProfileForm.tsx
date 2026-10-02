"use client";

import { useActionState } from "react";
import { updateProfile, type ActionState } from "@/app/perfil/actions";
import { LATAM_COUNTRIES, NZ_CITIES, VISA_TYPES } from "@/lib/constants";

type Profile = {
  display_name: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  origin_country: string | null;
  nz_start_city: string | null;
  visa: string | null;
};

const initial: ActionState = { ok: false };
const input = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-ocean focus:outline-none focus:ring-1 focus:ring-ocean";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-fern">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateProfile, initial);
  const e = state.errors ?? {};

  return (
    <form action={action} className="space-y-4 rounded-2xl bg-white p-6 shadow">
      <div className="flex items-center gap-4">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-fern text-2xl text-white">
            {profile.display_name[0]?.toUpperCase()}
          </span>
        )}
        <Field label="Foto de perfil" error={e.avatar}>
          <input type="file" name="avatar" accept="image/*" className="text-sm" />
        </Field>
      </div>

      <Field label="Nombre" error={e.display_name}>
        <input name="display_name" defaultValue={profile.display_name} className={input} required />
      </Field>

      <Field label="Usuario" error={e.username}>
        <input name="username" defaultValue={profile.username ?? ""} placeholder="ej: juan_kiwi" className={input} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="País de origen" error={e.origin_country}>
          <select name="origin_country" defaultValue={profile.origin_country ?? ""} className={input} required>
            <option value="" disabled>Elegí tu país</option>
            {LATAM_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Ciudad inicial en NZ" error={e.nz_start_city}>
          <select name="nz_start_city" defaultValue={profile.nz_start_city ?? ""} className={input} required>
            <option value="" disabled>Elegí una ciudad</option>
            {NZ_CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Tipo de visa" error={e.visa}>
        <select name="visa" defaultValue={profile.visa ?? "working_holiday"} className={input}>
          {VISA_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
        </select>
      </Field>

      <Field label="Sobre vos (opcional)" error={e.bio}>
        <textarea name="bio" rows={3} maxLength={300} defaultValue={profile.bio ?? ""} className={input} />
      </Field>

      <button
        disabled={pending}
        className="w-full rounded-xl bg-fern px-5 py-3 font-semibold text-white transition hover:bg-fern-light disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar perfil"}
      </button>

      {state.message && (
        <p className={`text-sm ${state.ok ? "text-fern" : "text-red-600"}`}>{state.message}</p>
      )}
    </form>
  );
}
