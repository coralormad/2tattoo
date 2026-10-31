import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/marca/Header";
import { FormularioFlash } from "@/components/panel/FormularioFlash";
import { FormularioIdea } from "@/components/panel/FormularioIdea";
import { ListaSolicitudes, type FilaSolicitud } from "@/components/panel/ListaSolicitudes";

const MENSAJES_SOLICITUD: Record<string, string> = {
  aceptada: "Solicitud aceptada. Acuerda la señal con el cliente.",
  rechazada: "Solicitud rechazada. Si era un flash único, vuelve a estar disponible.",
  error: "No se pudo responder a la solicitud. Puede que ya tuviera respuesta.",
};

export default async function Panel({
  searchParams,
}: {
  searchParams: Promise<{ solicitud?: string }>;
}) {
  const { solicitud } = await searchParams;
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

  const { data: filas } = await supabase
    .from("solicitudes")
    .select(
      "id, estado, zona, nota, fecha, hora_inicio, hora_fin, fecha_preferida, flashes!inner(titulo, tipo, tatuador_id), cliente:perfiles!cliente_id(nombre)",
    )
    .eq("flashes.tatuador_id", user.id)
    .in("estado", ["pendiente", "aceptada"])
    .order("fecha", { ascending: true, nullsFirst: false })
    .order("creado_en", { ascending: true });

  const solicitudes = (filas ?? []) as unknown as FilaSolicitud[];
  const hoy = new Date().toISOString().slice(0, 10);
  const pendientes = solicitudes.filter((s) => s.estado === "pendiente");
  const aceptadas = solicitudes.filter(
    (s) => s.estado === "aceptada" && (!s.fecha || s.fecha >= hoy),
  );

  return (
    <>
      <Header />

      <section className="reticula px-4 pb-18 pt-10 sm:px-10">
        <div className="flex flex-wrap justify-between gap-2 text-[11px] tracking-widest text-gris">
          <span>PANEL</span>
          <span>HOJA Nº 002 — {perfil.nombre ?? "TATUADOR"}</span>
        </div>

        <h1 className="font-display mt-5 text-[clamp(2.5rem,8vw,6rem)] uppercase leading-[0.9]">
          Tu <span className="text-lima">hoja</span> de trabajo.
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-gris-claro">
          Publica un flash reservable o lanza una idea para que un cliente se
          postule. Aparecerán en el Home en cuanto se guarden.
        </p>

        <div className="mt-4 flex flex-wrap gap-6">
          {perfil.usuario ? (
            <Link
              href={`/artista/${perfil.usuario}`}
              className="text-xs font-semibold tracking-widest text-lima no-underline"
            >
              VER MI PERFIL PÚBLICO →
            </Link>
          ) : (
            <Link
              href="/panel/perfil"
              className="text-xs font-semibold tracking-widest text-lima no-underline"
            >
              COMPLETA TU PERFIL PÚBLICO →
            </Link>
          )}
          <Link
            href="/panel/agenda"
            className="text-xs font-semibold tracking-widest text-lima no-underline"
          >
            CONFIGURAR AGENDA →
          </Link>
        </div>

        {solicitud && MENSAJES_SOLICITUD[solicitud] && (
          <p
            role="status"
            className={`mt-6 max-w-md text-sm font-semibold ${
              solicitud === "error" ? "text-[#b3221c]" : "text-lima"
            }`}
          >
            {MENSAJES_SOLICITUD[solicitud]}
          </p>
        )}

        <div className="mt-10">
          <ListaSolicitudes pendientes={pendientes} aceptadas={aceptadas} />
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <FormularioFlash />
          <FormularioIdea />
        </div>
      </section>
    </>
  );
}
