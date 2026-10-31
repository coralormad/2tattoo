import Link from "next/link";

export default function ErrorConfirmacion() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-tinta px-6 text-center text-papel">
      <p className="text-xs uppercase tracking-widest text-gris">
        [ error de confirmación ]
      </p>
      <h1 className="font-display text-4xl uppercase">Enlace caducado</h1>
      <p className="max-w-sm text-sm text-gris-claro">
        El enlace de confirmación no es válido o ya ha caducado. Pide uno
        nuevo intentando entrar con tu cuenta.
      </p>
      <Link
        href="/login"
        className="mt-2 bg-lima px-6 py-3 text-sm font-bold uppercase tracking-widest text-tinta"
      >
        Volver a entrar
      </Link>
    </main>
  );
}
