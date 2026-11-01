import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/marca/Header";
import { FormularioDisponibilidad, type ProximoDia } from "@/components/panel/FormularioDisponibilidad";
import { FormularioBloqueo } from "@/components/panel/FormularioBloqueo";
import { CapsulaGoogle } from "@/components/panel/CapsulaGoogle";
import { Pista, BotonAyuda } from "@/components/panel/Ayuda";
import { CalendarioAgenda, type CitaCal } from "@/components/panel/CalendarioAgenda";
import { ListaBloqueos } from "@/components/panel/ListaBloqueos";

const MENSAJES_GOOGLE: Record<string, string> = {
  conectado: "Google Calendar conectado. Tus huecos ya tienen en cuenta tus citas de ahí.",
  error: "No se pudo conectar con Google. Inténtalo de nuevo.",
  sin_refresh:
    "Google no devolvió el permiso permanente. Quita el acceso de 2Tattoo en tu cuenta de Google y vuelve a intentarlo.",
};

const MENSAJES_HORARIO: Record<string, { texto: string; aviso?: boolean }> = {
  guardado: { texto: "✓ Horario guardado. Ya es el que verán tus clientes." },
  vacio: {
    texto:
      "Has guardado un horario vacío: no marcaste ningún día, así que ahora mismo no tienes ningún hueco disponible para reservar.",
    aviso: true,
  },
};

export default async function Agenda({
  searchParams,
}: {
  searchParams: Promise<{ google?: string; horario?: string }>;
}) {
  const { google, horario } = await searchParams;
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

  const [{ data: disponibilidad }, { data: bloqueos }, { data: conexionGoogle }, { data: filasCitas }] =
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
      supabase
        .from("solicitudes")
        .select("id, estado, fecha, hora_inicio, hora_fin, flashes!inner(titulo, tatuador_id), cliente:perfiles!cliente_id(nombre)")
        .eq("flashes.tatuador_id", user.id)
        .in("estado", ["pendiente", "aceptada"])
        .not("fecha", "is", null),
    ]);

  type FilaCita = {
    id: string;
    estado: "pendiente" | "aceptada";
    fecha: string;
    hora_inicio: string | null;
    hora_fin: string | null;
    flashes: { titulo: string } | { titulo: string }[] | null;
    cliente: { nombre: string | null } | { nombre: string | null }[] | null;
  };
  const uno = <T,>(v: T | T[] | null) => (Array.isArray(v) ? v[0] : v);
  const citas: CitaCal[] = ((filasCitas ?? []) as unknown as FilaCita[])
    .filter((c) => c.hora_inicio && c.hora_fin)
    .map((c) => ({
      id: c.id,
      fecha: c.fecha,
      hora_inicio: c.hora_inicio!,
      hora_fin: c.hora_fin!,
      estado: c.estado,
      titulo: uno(c.flashes)?.titulo ?? "Flash",
      cliente: uno(c.cliente)?.nombre ?? null,
    }));

  const previa: Record<number, { hora_inicio: string; hora_fin: string }> = {};
  for (const d of disponibilidad ?? []) {
    previa[d.dia_semana] = { hora_inicio: d.hora_inicio, hora_fin: d.hora_fin };
  }

  const googleConectado = !!conexionGoogle;

  // Próximos 7 días: etiqueta de fecha y nº de personas agendadas por día de la semana.
  const MESES_CORTOS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const proximos: Record<number, ProximoDia> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const f = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const delDia = citas.filter((c) => c.fecha === f);
    proximos[d.getDay() === 0 ? 7 : d.getDay()] = {
      etiqueta: `${i === 0 ? "Hoy · " : ""}${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`,
      aceptadas: delDia.filter((c) => c.estado === "aceptada").length,
      pendientes: delDia.filter((c) => c.estado === "pendiente").length,
    };
  }

  return (
    <>
      <Header />

      <section className="reticula px-4 pb-18 pt-10 sm:px-10">
        <Link href="/panel" className="text-[11px] font-semibold tracking-widest text-gris">
          ← Volver al panel
        </Link>

        <div className="mt-5 flex items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] uppercase leading-[0.9]">
            Tu <span className="text-lima">agenda</span>.
          </h1>
          <BotonAyuda pagina="agenda" />
        </div>

        <Pista pagina="agenda">
          Arriba ves tu agenda real (semana o mes): horario abierto, citas y bloqueos. Debajo marcas
          los días que abres y añades bloqueos. Tus clientes solo verán los huecos libres que quedan.
        </Pista>

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

        {horario && MENSAJES_HORARIO[horario] && (
          <p
            role="status"
            className={`mt-4 max-w-md text-sm font-semibold ${
              MENSAJES_HORARIO[horario].aviso ? "text-[#b3221c]" : "text-lima"
            }`}
          >
            {MENSAJES_HORARIO[horario].texto}
          </p>
        )}

        <CapsulaGoogle conectado={googleConectado} />

        <div className="mt-8">
          <CalendarioAgenda horario={previa} bloqueos={bloqueos ?? []} citas={citas} />
        </div>

        <div className="mt-14">
          <FormularioDisponibilidad previa={previa} proximos={proximos} />
        </div>

        <div className="mt-14 grid items-start gap-8 md:grid-cols-2">
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
      </section>
    </>
  );
}
