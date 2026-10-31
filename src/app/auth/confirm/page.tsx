import { confirmarCuenta } from "@/app/auth/actions";

type Props = {
  searchParams: Promise<{
    code?: string;
    token_hash?: string;
    type?: string;
    next?: string;
  }>;
};

// Página de aterrizaje del enlace de confirmación del email.
// A propósito NO confirma la cuenta solo con cargarse: muchos gestores de
// correo (Gmail, Outlook) visitan los enlaces en segundo plano para
// escanearlos, y eso gastaría el código antes de que la persona lo pulse.
export default async function ConfirmarEmail({ searchParams }: Props) {
  const { code, token_hash, type, next } = await searchParams;
  const faltaDatos = !code && !(token_hash && type);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-tinta px-6 text-center text-papel">
      <p className="text-xs uppercase tracking-widest text-gris">
        [ último paso ]
      </p>
      <h1 className="font-display text-4xl uppercase sm:text-5xl">
        Confirma tu cuenta
      </h1>

      {faltaDatos ? (
        <p className="max-w-sm text-sm text-gris-claro">
          Este enlace no es válido. Vuelve a intentar entrar desde el email
          más reciente que te hayamos enviado.
        </p>
      ) : (
        <>
          <p className="max-w-sm text-sm text-gris-claro">
            Pulsa el botón para activar tu cuenta de 2Tattoo.
          </p>
          <form action={confirmarCuenta}>
            {code && <input type="hidden" name="code" value={code} />}
            {token_hash && <input type="hidden" name="token_hash" value={token_hash} />}
            {type && <input type="hidden" name="type" value={type} />}
            {next && <input type="hidden" name="next" value={next} />}
            <button
              type="submit"
              className="bg-lima px-8 py-4 text-sm font-bold uppercase tracking-widest text-tinta transition-transform hover:-translate-y-0.5"
            >
              Confirmar cuenta
            </button>
          </form>
        </>
      )}
    </main>
  );
}
