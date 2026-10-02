import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-route-light px-4">
      <div className="text-center">
        <p className="text-5xl">🥝✈️</p>
        <h1 className="mt-3 text-3xl font-bold text-fern">Kiwi Latino</h1>
        <p className="mt-2 max-w-md text-gray-700">
          La comunidad latina del Working Holiday en Nueva Zelanda. Encontrá
          compañeros de viaje, guías y consejos de quienes ya pasaron por esto.
        </p>
      </div>

      <GoogleLoginButton next={next ?? "/timeline"} />

      {error && (
        <p className="text-sm text-red-600">Hubo un problema al iniciar sesión. Probá otra vez.</p>
      )}
    </main>
  );
}
