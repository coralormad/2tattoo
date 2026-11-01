import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/marca/Header";
import { FlechaTinta } from "@/components/marca/FlechaTinta";
import { Revelar } from "@/components/efectos/Revelar";
import { TicketSolicitud, type FilaSolicitud } from "@/components/panel/ListaSolicitudes";

const FILTROS = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "aceptada", etiqueta: "Aceptadas" },
  { valor: "rechazada", etiqueta: "Rechazadas" },
] as const;

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default async function Historial({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro: filtroParam } = await searchParams;
  const filtro = FILTROS.some((f) => f.valor === filtroParam) ? filtroParam! : "todas";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
  if (perfil?.rol !== "tatuador") redirect("/");

  const { data } = await supabase
    .from("solicitudes")
    .select(
      "id, estado, zona, nota, fecha, hora_inicio, hora_fin, fecha_preferida, creado_en, flashes!inner(titulo, tipo, tatuador_id), cliente:perfiles!cliente_id(nombre)",
    )
    .eq("flashes.tatuador_id", user.id)
    .in("estado", ["aceptada", "rechazada"])
    .order("fecha", { ascending: false, nullsFirst: false })
    .order("creado_en", { ascending: false });

  const todas = (data ?? []) as unknown as (FilaSolicitud & { creado_en: string })[];
  const cuenta = {
    todas: todas.length,
    aceptada: todas.filter((s) => s.estado === "aceptada").length,
    rechazada: todas.filter((s) => s.estado === "rechazada").length,
  };
  const lista = filtro === "todas" ? todas : todas.filter((s) => s.estado === filtro);

  // Agrupar por mes de la cita (o de la solicitud si no tiene fecha).
  const grupos = new Map<string, typeof lista>();
  for (const s of lista) {
    const clave = (s.fecha ?? s.creado_en).slice(0, 7);
    grupos.set(clave, [...(grupos.get(clave) ?? []), s]);
  }

  return (
    <>
      <Header />

      <section className="reticula px-4 pb-18 pt-10 sm:px-10">
        <Link
          href="/panel"
          className="group/flecha inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-gris no-underline hover:text-lima"
        >
          <FlechaTinta dir={-1} tam={16} /> Volver al panel
        </Link>

        <h1 className="font-display mt-5 text-[clamp(2.5rem,7vw,5rem)] uppercase leading-[0.9]">
          Tu <span className="text-lima">historial</span>.
        </h1>
        <p className="mt-3 max-w-md font-mono text-[12px] uppercase tracking-widest text-gris">
          Solicitudes que ya respondiste. Las pendientes están en el panel.
        </p>

        <nav aria-label="Filtrar historial" className="mt-8 flex flex-wrap gap-2">
          {FILTROS.map((f) => {
            const activo = filtro === f.valor;
            return (
              <Link
                key={f.valor}
                href={f.valor === "todas" ? "/panel/solicitudes" : `/panel/solicitudes?filtro=${f.valor}`}
                aria-current={activo ? "page" : undefined}
                className={`rounded-full border-2 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest no-underline transition-colors ${
                  activo ? "border-lima bg-lima text-tinta" : "border-papel/25 text-gris-claro hover:border-lima hover:text-lima"
                }`}
              >
                {f.etiqueta} · {cuenta[f.valor]}
              </Link>
            );
          })}
        </nav>

        {lista.length === 0 ? (
          <div className="mt-8 grid min-h-[180px] place-items-center border-2 border-dashed border-papel/25 p-8 text-center">
            <div>
              <span className="font-display block text-3xl uppercase leading-none">Nada por aquí</span>
              <span className="mt-2 block font-mono text-[11px] uppercase tracking-widest text-gris">
                Cuando respondas solicitudes, quedarán guardadas aquí
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-10 flex flex-col gap-10">
            {[...grupos.entries()].map(([clave, items], i) => {
              const [anio, mes] = clave.split("-").map(Number);
              return (
                <Revelar key={clave} retraso={Math.min(i * 0.05, 0.2)}>
                  <h2 className="flex items-baseline gap-3 border-b border-dashed border-papel/25 pb-2">
                    <span className="font-display text-3xl uppercase leading-none">{MESES[mes - 1]}</span>
                    <span className="font-mono text-[11px] tracking-widest text-gris">
                      {anio} · {items.length}
                    </span>
                  </h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {items.map((s) => (
                      <TicketSolicitud key={s.id} s={s} />
                    ))}
                  </div>
                </Revelar>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
