import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const links = [
  { href: "/timeline", label: "Timeline" },
  { href: "/viajes", label: "Mis viajes" },
  { href: "/perfil", label: "Perfil" },
];

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-10 border-b border-fern/10 bg-fern text-white">
      <nav className="mx-auto flex max-w-5xl items-center gap-5 px-4 py-3">
        <Link href="/" className="text-lg font-bold">🥝 Kiwi Latino</Link>

        <div className="ml-auto flex items-center gap-4 text-sm">
          {user && links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-route">{l.label}</Link>
          ))}
          {!user && <Link href="/timeline" className="hover:text-route">Timeline</Link>}

          {user ? (
            <form action="/auth/signout" method="post">
              <button className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20">Salir</button>
            </form>
          ) : (
            <Link href="/login" className="rounded-lg bg-route px-3 py-1.5 font-semibold text-fern hover:bg-route-light">
              Ingresar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
