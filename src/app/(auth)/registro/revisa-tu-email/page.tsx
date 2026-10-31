export default function RevisaTuEmail() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-tinta px-6 text-center text-papel">
      <p className="text-xs uppercase tracking-widest text-gris">
        [ un último paso ]
      </p>
      <h1 className="font-display text-4xl uppercase sm:text-5xl">
        Revisa tu email
      </h1>
      <p className="max-w-sm text-sm text-gris-claro">
        Te hemos enviado un enlace de confirmación. Ábrelo para activar tu
        cuenta y poder entrar.
      </p>
    </main>
  );
}
