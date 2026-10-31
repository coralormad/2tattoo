import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/marca/Header";
import { FormularioDisponibilidad } from "@/components/panel/FormularioDisponibilidad";
import { FormularioBloqueo } from "@/components/panel/FormularioBloqueo";
import { eliminarBloqueo, desconectarGoogle } from "@/app/panel/agenda/actions";

const MENSAJES_GOOGLE: Record<string, string> = {
  conectado: "Google Calendar conectado. Tus huecos ya tienen en cuenta tus citas de ahí.",
  error: "No se pudo conectar con Google. Inténtalo de nuevo.",
  sin_refresh:
    "Google no devolvió el permiso permanente. Quita el acceso de 2Tattoo en tu cuenta de Google y vuelve a intentarlo.",
};

export default async function Agenda({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  const { google } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "tatuador") redirect("/");

  const [{ data: disponibilidad }, { data: bloqueos }, { data: conexionGoogle }] =
    await Promise.all([
      supabase
        .from("disponibilidad")
        .select("dia_semana, hora_inicio, hora_fin")
        .eq("tatuador_id", user.id),
      supabase
        .from("bloqueos")
        .select("id, fecha, hora_inicio, hora_fin, motivo")
        .eq("tatuador_id", user.id)
        .gte("fecha", new Date().toISOString().slice(0, 10))
        .order("fecha", { ascending: true }),
      supabase
        .from("conexiones_google")
        .select("tatuador_id")
        .eq("tatuador_id", user.id)
        .maybeSingle(),
    ]);

  const previa: Record<number, { hora_inicio: string; hora_fin: string }> = {};
  for (const d of disponibilidad ?? []) {
    previa[d.dia_semana] = { hora_inicio: d.hora_inicio, hora_fin: d.hora_fin };
  }

  const googleConectado = !!conexionGoogle;

  return (
    <>
      <Header />

      <section className="reticula px-4 pb-18 pt-10 sm:px-10">
        <Link href="/panel" className="text-[11px] font-semibold tracking-widest text-gris">
          ← Volver al panel
        </Link>

        <h1 className="font-display mt-5 text-[clamp(2.5rem,7vw,5.5rem)] uppercase leading-[0.9]">
          Tu <span className="text-lima">agenda</span>.
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-gris-claro">
          Define tu horario habitual y añade bloqueos puntuales (otro trabajo, vacaciones,
          convenciones). Los huecos libres son los que verán tus clientes al reservar un flash.
        </p>

        {google && MENSAJES_GOOGLE[google] && (
          <p
            role="status"
            className={`mt-4 max-w-md text-sm font-semibold ${
              google === "conectado" ? "text-lima" : "text-[#b3221c]"
            }`}
          >
            {MENSAJES_GOOGLE[google]}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-2 border-carbon bg-papel-claro p-5 text-carbon">
          <div className="flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest">
              Google Calendar
            </span>
            <p className="mt-1 text-[13px] text-[#444]">
              {googleConectado
                ? "Conectado. Lo que tengas ahí ocupado se resta de tus huecos."
                : "Conecta tu calendario para que tu otro trabajo también cuente."}
            </p>
          </div>
          {googleConectado ? (
            <form action={desconectarGoogle}>
              <button type="submit" className="text-xs font-semibold tracking-widest text-[#b3221c]">
                DESCONECTAR
              </button>
            </form>
          ) : (
            <a
              href="/auth/google/conectar"
              className="font-display border-2 border-carbon bg-carbon px-4 py-2 text-sm uppercase text-papel no-underline"
            >
              Conectar →
            </a>
          )}
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <FormularioDisponibilidad previa={previa} />

          <div className="flex flex-col gap-8">
            <FormularioBloqueo />

            {bloqueos && bloqueos.length > 0 && (
              <div className="flex flex-col gap-3 border-b-2 border-r-2 border-carbon bg-papel-claro p-6 text-carbon">
                <span className="text-[11px] font-semibold uppercase tracking-widest">
                  Próximos bloqueos
                </span>
                {bloqueos.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 border-t border-dashed border-carbon pt-3 text-[13px]"
                  >
                    <span>
                      {b.fecha}
                      {b.hora_inicio ? ` · ${b.hora_inicio.slice(0, 5)}–${b.hora_fin?.slice(0, 5)}` : " · día entero"}
                      {b.motivo ? ` · ${b.motivo}` : ""}
                    </span>
                    <form action={eliminarBloqueo}>
                      <input type="hidden" name="id" value={b.id} />
                      <button type="submit" className="text-xs font-semibold text-[#b3221c]">
                        QUITAR
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
