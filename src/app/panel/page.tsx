import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/marca/Header";
import { FlechaTinta } from "@/components/marca/FlechaTinta";
import { Revelar } from "@/components/efectos/Revelar";
import { FormularioFlash } from "@/components/panel/FormularioFlash";
import { FormularioIdea } from "@/components/panel/FormularioIdea";
import { ListaSolicitudes, type FilaSolicitud } from "@/components/panel/ListaSolicitudes";
import { IntroTinta, BotonRepetirIntro } from "@/components/panel/IntroTinta";
import { Pista, BotonAyuda } from "@/components/panel/Ayuda";
import { Aviso, CabeceraTarjeta, CLASE_TARJETA, TituloSeccion } from "@/components/panel/ui";

const MENSAJES_SOLICITUD: Record<string, string> = {
  aceptada: "Solicitud aceptada. Acuerda la señal con el cliente.",
  rechazada: "Solicitud rechazada. Si era un flash único, vuelve a estar disponible.",
  error: "No se pudo responder a la solicitud. Puede que ya tuviera respuesta.",
};

const DIAS_LARGOS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const ESCALA_INI = 8 * 60;
const ESCALA_FIN = 22 * 60;

const fechaLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const aMin = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return (a || 0) * 60 + (b || 0);
};
const pct = (m: number) =>
  ((Math.min(Math.max(m, ESCALA_INI), ESCALA_FIN) - ESCALA_INI) / (ESCALA_FIN - ESCALA_INI)) * 100;

export default async function Panel({
  searchParams,
}: {
  searchParams: Promise<{ solicitud?: string }>;
}) {
  const { solicitud } = await searchParams;
  const verIntro = !(await cookies()).get("panel_intro");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, nombre, usuario")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "tatuador") redirect("/");

  const [{ data: filas }, { count: totalFlashes }] = await Promise.all([
    supabase
      .from("solicitudes")
      .select(
        "id, estado, zona, nota, fecha, hora_inicio, hora_fin, fecha_preferida, flashes!inner(titulo, tipo, tatuador_id), cliente:perfiles!cliente_id(nombre)",
      )
      .eq("flashes.tatuador_id", user.id)
      .in("estado", ["pendiente", "aceptada"])
      .order("fecha", { ascending: true, nullsFirst: false })
      .order("creado_en", { ascending: true }),
    supabase.from("flashes").select("id", { count: "exact", head: true }).eq("tatuador_id", user.id),
  ]);

  const ahora = new Date();
  const hoy = fechaLocal(ahora);
  const solicitudes = (filas ?? []) as unknown as FilaSolicitud[];
  const pendientes = solicitudes.filter((s) => s.estado === "pendiente");
  const aceptadas = solicitudes.filter((s) => s.estado === "aceptada" && (!s.fecha || s.fecha >= hoy));
  const citasHoy = aceptadas
    .filter((s) => s.fecha === hoy && s.hora_inicio && s.hora_fin)
    .sort((a, b) => a.hora_inicio!.localeCompare(b.hora_inicio!));

  const h = ahora.getHours();
  const nombreCorto = (perfil.nombre ?? "").split(" ")[0];
  const saludo = `${h < 14 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches"}${
    nombreCorto ? `, ${nombreCorto}` : ""
  }`;
  const fechaTexto = `${DIAS_LARGOS[ahora.getDay()]} ${ahora.getDate()} ${MESES_CORTOS[ahora.getMonth()]}`;
  const horaTexto = `${String(h).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;

  const contadores = [
    {
      valor: pendientes.length,
      etiqueta: "Esperan respuesta",
      href: "#solicitudes",
      clase:
        pendientes.length > 0
          ? "border-carbon bg-lima text-tinta"
          : "border-papel/25 bg-transparent text-papel",
    },
    {
      valor: aceptadas.length,
      etiqueta: "Próximas citas",
      href: "#solicitudes",
      clase: "border-carbon bg-papel-claro text-carbon",
    },
    {
      valor: totalFlashes ?? 0,
      etiqueta: "Flashes publicados",
      href: "#publicar",
      clase: "border-papel/25 bg-transparent text-papel [&_strong]:text-lima",
    },
  ];

  return (
    <>
      <IntroTinta inicial={verIntro} saludo={`${saludo} · ${fechaTexto} · ${horaTexto}`} />
      <Header />

      <section className="reticula px-4 pb-18 pt-10 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-widest text-gris">
          <span className="flex flex-wrap items-center gap-3">
            Panel · {saludo}
            <BotonRepetirIntro />
          </span>
          <span>Hoja Nº 002 — {perfil.nombre ?? "Tatuador"}</span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(2.5rem,8vw,6rem)] uppercase leading-[0.9]">
            Tu <span className="text-lima">hoja</span> de trabajo.
          </h1>
          <BotonAyuda pagina="panel" />
        </div>

        <Pista pagina="panel">
          Arriba tienes tu día y tus números. Responde las solicitudes en sus tickets y publica flashes o
          ideas al final. El horario y los bloqueos están en Agenda.
        </Pista>

        {solicitud && MENSAJES_SOLICITUD[solicitud] && (
          <Aviso tipo={solicitud === "error" ? "error" : "ok"}>{MENSAJES_SOLICITUD[solicitud]}</Aviso>
        )}

        {/* Resumen */}
        <Revelar className="mt-10 grid gap-4 sm:grid-cols-3">
          {contadores.map((c) => (
            <a
              key={c.etiqueta}
              href={c.href}
              className={`group flex items-end justify-between gap-3 border-2 p-5 no-underline transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-lima)] ${c.clase}`}
            >
              <span>
                <strong className="font-display block text-6xl font-normal leading-none">{c.valor}</strong>
                <span className="mt-2 block font-mono text-[11px] font-semibold uppercase tracking-widest">
                  {c.etiqueta}
                </span>
              </span>
              <span className="group/flecha opacity-60 transition-opacity group-hover:opacity-100">
                <FlechaTinta tam={24} />
              </span>
            </a>
          ))}
        </Revelar>

        {/* Hoy + accesos */}
        <Revelar retraso={0.1} className="mt-8 grid items-stretch gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className={CLASE_TARJETA}>
            <CabeceraTarjeta
              titulo={<>Hoy · <span className="text-lima">{fechaTexto}</span></>}
              extra={<span className="font-mono text-[11px] tracking-widest text-gris-claro">{horaTexto}</span>}
            />
            <div className="flex flex-col gap-4 p-5">
              {/* Línea del día 08–22 con las citas y la hora actual */}
              <div>
                <div className="relative h-10 border-2 border-carbon bg-papel" aria-hidden="true">
                  {citasHoy.map((c) => {
                    const izq = pct(aMin(c.hora_inicio!));
                    return (
                      <div
                        key={c.id}
                        className="absolute inset-y-0 border-x-2 border-carbon bg-lima"
                        style={{ left: `${izq}%`, width: `${Math.max(pct(aMin(c.hora_fin!)) - izq, 1)}%` }}
                      />
                    );
                  })}
                  {h >= 8 && h < 22 && (
                    <div
                      className="absolute -inset-y-1.5 w-0.5 bg-[#b3221c]"
                      style={{ left: `${pct(h * 60 + ahora.getMinutes())}%` }}
                    >
                      <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#b3221c]" />
                    </div>
                  )}
                </div>
                <div className="mt-1 flex justify-between font-mono text-[10px] text-[#888]" aria-hidden="true">
                  <span>08</span>
                  <span>11</span>
                  <span>15</span>
                  <span>18</span>
                  <span>22</span>
                </div>
              </div>

              {citasHoy.length === 0 ? (
                <p className="font-mono text-[12px] uppercase tracking-widest text-[#666]">
                  Hoy no tienes citas · buen día para dibujar flash
                </p>
              ) : (
                <ul className="flex flex-col">
                  {citasHoy.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-baseline justify-between gap-3 border-t border-dashed border-carbon/30 py-2"
                    >
                      <span className="font-mono text-[13px] font-semibold">
                        {c.hora_inicio!.slice(0, 5)}–{c.hora_fin!.slice(0, 5)}
                      </span>
                      <span className="font-display flex-1 truncate text-xl uppercase leading-none">
                        {c.flashes?.titulo ?? "Flash"}
                      </span>
                      <span className="font-mono text-[12px] text-[#666]">{c.cliente?.nombre ?? "Cliente"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {[
              {
                href: "/panel/agenda",
                titulo: "Agenda",
                sub: "Horario, bloqueos y Google Calendar",
              },
              perfil.usuario
                ? { href: "/panel/perfil", titulo: "Mi perfil", sub: "Edita tu perfil, Instagram y notas" }
                : { href: "/panel/perfil", titulo: "Completa tu perfil", sub: "Aún no tienes URL pública" },
              { href: "/panel/solicitudes", titulo: "Historial", sub: "Solicitudes aceptadas y rechazadas" },
            ].map((a) => (
              <Link
                key={a.titulo}
                href={a.href}
                className="group/flecha flex flex-1 items-center justify-between gap-4 border-2 border-papel/25 p-5 text-papel no-underline transition-all hover:-translate-y-0.5 hover:border-lima hover:bg-lima hover:text-tinta"
              >
                <span>
                  <span className="font-display block text-3xl uppercase leading-none">{a.titulo}</span>
                  <span className="mt-1 block font-mono text-[11px] uppercase tracking-widest opacity-70">{a.sub}</span>
                </span>
                <FlechaTinta tam={28} />
              </Link>
            ))}
            {perfil.usuario && (
              <Link
                href={`/artista/${perfil.usuario}`}
                className="self-end font-mono text-[11px] uppercase tracking-widest text-gris underline decoration-dashed underline-offset-4 hover:text-lima"
              >
                Ver perfil público
              </Link>
            )}
          </div>
        </Revelar>

        {/* Solicitudes */}
        <Revelar className="mt-16">
          <TituloSeccion
            id="solicitudes"
            resaltado="Solicitudes"
            contador={`${pendientes.length} pendientes · ${aceptadas.length} próximas`}
            accion={
              <Link
                href="/panel/solicitudes"
                className="group/flecha flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gris-claro no-underline hover:text-lima"
              >
                Ver historial <FlechaTinta tam={16} />
              </Link>
            }
          />
          <div className="mt-6">
            <ListaSolicitudes pendientes={pendientes} aceptadas={aceptadas} />
          </div>
        </Revelar>

        {/* Publicar */}
        <Revelar className="mt-16">
          <TituloSeccion
            id="publicar"
            resaltado="Publicar"
            contador="Aparecen en el Home en cuanto se guardan"
          />
          <div className="mt-6 grid items-start gap-8 md:grid-cols-2">
            <FormularioFlash />
            <FormularioIdea />
          </div>
        </Revelar>
      </section>
    </>
  );
}
