import type { ReactNode } from "react";
import { responderSolicitud } from "@/app/panel/actions";
import { RAYAS_ROJAS } from "@/components/panel/ui";

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

const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const DIAS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const ES_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function talon(s: FilaSolicitud) {
  const f = s.fecha ?? (s.fecha_preferida && ES_FECHA.test(s.fecha_preferida) ? s.fecha_preferida : null);
  if (!f) return null;
  const d = new Date(`${f}T00:00:00`);
  return { dia: d.getDate(), mes: MESES[d.getMonth()], semana: DIAS[d.getDay()] };
}

function hora(s: FilaSolicitud) {
  if (s.hora_inicio) return `${s.hora_inicio.slice(0, 5)}–${s.hora_fin?.slice(0, 5) ?? ""}`;
  if (s.fecha_preferida && !ES_FECHA.test(s.fecha_preferida)) return s.fecha_preferida;
  return s.fecha ? "Hora a convenir" : "Fecha a convenir";
}

const ESTILO = {
  pendiente: {
    tarjeta: "border-dashed border-carbon bg-papel-claro",
    talon: "bg-papel-claro",
    sello: "border-carbon text-carbon",
    texto: "Pendiente",
  },
  aceptada: {
    tarjeta: "border-solid border-carbon bg-papel-claro",
    talon: "bg-lima",
    sello: "border-carbon bg-carbon text-lima",
    texto: "Aceptada ✓",
  },
  rechazada: {
    tarjeta: "border-solid border-carbon/40 bg-papel-claro/80 text-carbon/70",
    talon: RAYAS_ROJAS,
    sello: "border-[#b3221c] text-[#b3221c]",
    texto: "Rechazada ✕",
  },
} as const;

export function TicketSolicitud({ s, acciones = false }: { s: FilaSolicitud; acciones?: boolean }) {
  const t = talon(s);
  const e = ESTILO[s.estado];

  return (
    <article
      className={`group flex border-2 text-carbon transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-lima)] ${e.tarjeta}`}
    >
      {/* Talón */}
      <div
        className={`flex w-18 shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-carbon py-4 ${e.talon}`}
      >
        {t ? (
          <>
            <span className="font-mono text-[10px] tracking-widest">{t.semana}</span>
            <span className="font-display text-4xl leading-none">{t.dia}</span>
            <span className="font-mono text-[10px] tracking-widest">{t.mes}</span>
          </>
        ) : (
          <span className="font-display text-3xl leading-none">¿?</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl uppercase leading-none">
            {s.flashes?.titulo ?? "Flash"}
            {s.flashes?.tipo === "flash_unico" && (
              <span className="ml-2 align-middle font-mono text-[10px] tracking-widest text-[#666]">· ÚNICO</span>
            )}
          </h3>
          <span
            className={`shrink-0 -rotate-2 border-2 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest ${e.sello}`}
          >
            {e.texto}
          </span>
        </div>

        <p className="font-mono text-[12px] uppercase">
          {hora(s)} · <span className="font-semibold">{s.cliente?.nombre ?? "Cliente"}</span>
          {s.zona && <span className="text-[#666]"> · {s.zona}</span>}
        </p>

        {s.nota && (
          <p className="line-clamp-3 border-l-2 border-lima pl-3 text-[13px] italic leading-relaxed text-[#444]">
            “{s.nota}”
          </p>
        )}

        {acciones && s.estado === "pendiente" && (
          <form action={responderSolicitud} className="mt-1 flex items-center gap-3">
            <input type="hidden" name="id" value={s.id} />
            <button
              type="submit"
              name="estado"
              value="aceptada"
              className="font-display border-2 border-carbon bg-carbon px-4 py-2 text-base uppercase text-papel shadow-[4px_4px_0_var(--color-lima)] transition-transform hover:-translate-y-0.5"
            >
              Aceptar →
            </button>
            <button
              type="submit"
              name="estado"
              value="rechazada"
              className="flex items-center gap-1.5 rounded-full border-2 border-[#b3221c] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#b3221c] transition-colors hover:bg-[#b3221c] hover:text-papel"
            >
              ✕ Rechazar
            </button>
          </form>
        )}
      </div>
    </article>
  );
}

function Vacio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="grid min-h-[140px] place-items-center border-2 border-dashed border-papel/25 p-6 text-center">
      <div>
        <span className="font-display block text-2xl uppercase leading-none">{titulo}</span>
        <span className="mt-2 block font-mono text-[11px] uppercase tracking-widest text-gris">{texto}</span>
      </div>
    </div>
  );
}

function Subtitulo({ children, punto }: { children: ReactNode; punto?: boolean }) {
  return (
    <h3 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-gris-claro">
      {punto && (
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lima opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lima" />
        </span>
      )}
      {children}
    </h3>
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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Subtitulo punto={pendientes.length > 0}>Esperan tu respuesta · {pendientes.length}</Subtitulo>
        {pendientes.length === 0 ? (
          <Vacio titulo="Nada pendiente" texto="Cuando alguien pida un flash, aparecerá aquí" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendientes.map((s) => (
              <TicketSolicitud key={s.id} s={s} acciones />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Subtitulo>Próximas citas · {aceptadas.length}</Subtitulo>
        {aceptadas.length === 0 ? (
          <Vacio titulo="Sin citas a la vista" texto="Las solicitudes que aceptes se colocan aquí" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {aceptadas.map((s) => (
              <TicketSolicitud key={s.id} s={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
