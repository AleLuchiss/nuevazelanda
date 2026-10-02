import Link from "next/link";

const features = [
  { icon: "🗓️", title: "Timeline de viajeros", text: "Mirá quién viaja a NZ en tu misma semana o mes y armá tu grupo." },
  { icon: "📄", title: "Guías de la comunidad", text: "Banco, IRD, SIM, trabajo y alojamiento, explicado por quienes ya lo hicieron. (Próximamente)" },
  { icon: "📸", title: "Galería", text: "Fotos y recuerdos de la ruta, el trabajo y los paisajes. (Próximamente)" },
];

export default function Home() {
  return (
    <main>
      <section className="bg-gradient-to-b from-fern to-ocean px-4 py-20 text-center text-white">
        <p className="text-5xl">🥝✈️🏔️</p>
        <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-bold sm:text-5xl">
          Tu Working Holiday en Nueva Zelanda, en comunidad
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
          Desde la planificación hasta tu primer día en NZ: ayuda mutua entre latinos.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/login" className="rounded-xl bg-route px-6 py-3 font-semibold text-fern hover:bg-route-light">
            Unirme con Google
          </Link>
          <Link href="/timeline" className="rounded-xl border border-white/60 px-6 py-3 font-semibold hover:bg-white/10">
            Ver el timeline
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-14 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl bg-route-light p-5">
            <p className="text-3xl">{f.icon}</p>
            <h2 className="mt-2 font-semibold text-fern">{f.title}</h2>
            <p className="mt-1 text-sm text-gray-700">{f.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
