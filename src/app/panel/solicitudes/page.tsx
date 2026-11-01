import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { responderSolicitud } from "./actions";

type Solicitud = {
  id: string;
  zona: string | null;
  fecha_preferida: string | null;
  nota: string | null;
  estado: "pendiente" | "aceptada" | "rechazada";
  creado_en: string;
  flashes: { titulo: string } | null;
  perfiles: { usuario: string } | null;
};

export default async function SolicitudesPage() {
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

  const { data } = await supabase
    .from("solicitudes")
    .select(
      "id, zona, fecha_preferida, nota, estado, creado_en, flashes!inner(titulo, tatuador_id), perfiles(usuario)"
    )
    .eq("flashes.tatuador_id", user.id)
    .order("creado_en", { ascending: false });

  const solicitudes = (data ?? []) as unknown as Solicitud[];
  const pendientes = solicitudes.filter((s) => s.estado === "pendiente");
  const historial = solicitudes.filter((s) => s.estado !== "pendiente");

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 font-mono">
      <Link href="/panel" className="text-xs uppercase opacity-60 hover:opacity-100">
        ← Panel
      </Link>
      <h1 className="mt-4 text-4xl uppercase">Solicitudes</h1>

      <section className="mt-8">
        <h2 className="text-xs uppercase opacity-60">
          Pendientes · {pendientes.length}
        </h2>
        {pendientes.length === 0 && (
          <p className="mt-4 text-sm opacity-60">No tienes solicitudes pendientes.</p>
        )}
        <ul className="mt-4 space-y-4">
          {pendientes.map((s) => (
            <li key={s.id} className="border border-current/20 p-4">
              <Datos s={s} />
              <div className="mt-4 flex gap-3">
                <form action={responderSolicitud}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="estado" value="aceptada" />
                  <button className="bg-[#D4FF3A] px-4 py-2 text-xs uppercase text-black">
                    Aceptar
                  </button>
                </form>
                <form action={responderSolicitud}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="estado" value="rechazada" />
                  <button className="border border-current px-4 py-2 text-xs uppercase">
                    Rechazar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {historial.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xs uppercase opacity-60">Historial</h2>
          <ul className="mt-4 space-y-3">
            {historial.map((s) => (
              <li key={s.id} className="border border-current/10 p-4 opacity-70">
                <Datos s={s} />
                <p className="mt-2 text-xs uppercase">
                  {s.estado === "aceptada" ? "✓ Aceptada" : "✕ Rechazada"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function Datos({ s }: { s: Solicitud }) {
  return (
    <div className="space-y-1 text-sm">
      <p className="text-lg uppercase">{s.flashes?.titulo ?? "Flash"}</p>
      <p className="opacity-70">
        @{s.perfiles?.usuario ?? "cliente"} ·{" "}
        {new Date(s.creado_en).toLocaleDateString("es-ES")}
      </p>
      {s.zona && <p>Zona: {s.zona}</p>}
      {s.fecha_preferida && <p>Fecha preferida: {s.fecha_preferida}</p>}
      {s.nota && <p className="opacity-80">“{s.nota}”</p>}
    </div>
  );
}