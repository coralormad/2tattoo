import { responderSolicitud } from "@/app/panel/actions";

export type FilaSolicitud = {
  id: string;
  estado: "pendiente" | "aceptada" | "rechazada";
  zona: string | null;
  nota: string | null;
  fecha: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  fecha_preferida: string | null;
  flashes: { titulo: string; tipo: "flash" | "flash_unico" } | null;
  cliente: { nombre: string | null } | null;
};

function cuando(s: FilaSolicitud) {
  if (s.fecha && s.hora_inicio) {
    return `${s.fecha} · ${s.hora_inicio.slice(0, 5)}–${s.hora_fin?.slice(0, 5) ?? ""}`;
  }
  return s.fecha_preferida ?? "Sin fecha";
}

function Tarjeta({ s, numero }: { s: FilaSolicitud; numero: number }) {
  const pendiente = s.estado === "pendiente";

  return (
    <article className="flex flex-col gap-3 border-b-2 border-r-2 border-carbon bg-papel-claro p-5 text-carbon">
      <div className="flex justify-between border-b border-dashed border-carbon pb-2 text-[11px] font-semibold uppercase tracking-widest">
        <span>{s.flashes?.titulo ?? "Flash"}{s.flashes?.tipo === "flash_unico" ? " · único" : ""}</span>
        <span>Nº {String(numero).padStart(2, "0")}</span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
        <dt className="text-[#666]">Cliente</dt>
        <dd className="font-semibold">{s.cliente?.nombre ?? "—"}</dd>
        <dt className="text-[#666]">Cuándo</dt>
        <dd className="font-mono">{cuando(s)}</dd>
        <dt className="text-[#666]">Zona</dt>
        <dd>{s.zona ?? "—"}</dd>
        {s.nota && (
          <>
            <dt className="text-[#666]">Nota</dt>
            <dd className="whitespace-pre-line">{s.nota}</dd>
          </>
        )}
      </dl>

      {pendiente ? (
        <form action={responderSolicitud} className="mt-1 flex items-center gap-4">
          <input type="hidden" name="id" value={s.id} />
          <button
            type="submit"
            name="estado"
            value="aceptada"
            className="font-display border-2 border-carbon bg-carbon px-4 py-2 text-sm uppercase text-papel shadow-[4px_4px_0_var(--color-lima)] transition-transform hover:-translate-y-0.5"
          >
            Aceptar →
          </button>
          <button
            type="submit"
            name="estado"
            value="rechazada"
            className="text-xs font-semibold tracking-widest text-[#b3221c]"
          >
            RECHAZAR
          </button>
        </form>
      ) : (
        <span className="text-[11px] font-semibold uppercase tracking-widest">Aceptada ✓</span>
      )}
    </article>
  );
}

export function ListaSolicitudes({
  pendientes,
  aceptadas,
}: {
  pendientes: FilaSolicitud[];
  aceptadas: FilaSolicitud[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gris">
          Solicitudes pendientes · {pendientes.length}
        </h2>
        {pendientes.length === 0 ? (
          <p className="mt-3 text-sm text-gris-claro">Nada pendiente. Cuando alguien pida un flash, aparecerá aquí.</p>
        ) : (
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {pendientes.map((s, i) => (
              <Tarjeta key={s.id} s={s} numero={i + 1} />
            ))}
          </div>
        )}
      </div>

      {aceptadas.length > 0 && (
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gris">
            Próximas citas · {aceptadas.length}
          </h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {aceptadas.map((s, i) => (
              <Tarjeta key={s.id} s={s} numero={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
