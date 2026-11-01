"use client";

import { useMemo, useState } from "react";
import { Personas } from "@/components/panel/IconoPersona";

export type HorarioSemanal = Record<number, { hora_inicio: string; hora_fin: string }>;
export type BloqueoCal = { fecha: string; hora_inicio: string | null; hora_fin: string | null; motivo: string | null };
export type CitaCal = {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  titulo: string;
  cliente: string | null;
  estado: "pendiente" | "aceptada";
};

const DIAS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const H_INICIO = 8;
const H_FIN = 22;
const ALTO_HORA = 30;
const RAYAS = "bg-[repeating-linear-gradient(135deg,#b3221c33_0_5px,transparent_5px_10px)]";

const min = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return a * 60 + (b || 0);
};
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const diaIso = (d: Date) => (d.getDay() === 0 ? 7 : d.getDay());
const lunesDe = (d: Date) => {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() - (diaIso(r) - 1));
  return r;
};
const sumarDias = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
const top = (m: number) => ((Math.max(m, H_INICIO * 60) - H_INICIO * 60) / 60) * ALTO_HORA;
const alto = (a: number, b: number) =>
  ((Math.min(b, H_FIN * 60) - Math.max(a, H_INICIO * 60)) / 60) * ALTO_HORA;

const CLASE_FLECHA =
  "group/flecha grid h-9 w-9 place-items-center border-2 border-papel/40 text-papel transition-all hover:-translate-y-0.5 hover:border-lima hover:bg-lima hover:text-tinta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lima";

/** Flecha de "trazo de tinta": línea orgánica que engorda hacia la punta y gota al final. */
function FlechaTinta({ dir }: { dir: -1 | 1 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      className={`transition-transform ${dir === 1 ? "group-hover/flecha:translate-x-0.5" : "-scale-x-100 group-hover/flecha:-translate-x-0.5"}`}
    >
      <path d="M3.5 12.6c3.2-.9 7.4-1.3 12.6-.9l-.2 1.5c-4.9-.2-8.9.2-12 .9z" fill="currentColor" />
      <path d="M12.8 6.2c2.6 1.9 5 3.8 7.4 5.9-2.3 2-4.7 3.9-7.3 5.7l-.9-1.1c2.1-1.6 4.1-3.1 6-4.6-1.9-1.6-3.9-3.1-6-4.7z" fill="currentColor" />
      <circle cx="3" cy="13.3" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function CalendarioAgenda({
  horario,
  bloqueos,
  citas,
}: {
  horario: HorarioSemanal;
  bloqueos: BloqueoCal[];
  citas: CitaCal[];
}) {
  const [vista, setVista] = useState<"semana" | "mes">("semana");
  const [cursor, setCursor] = useState(() => new Date());
  const [citaAbierta, setCitaAbierta] = useState<CitaCal | null>(null);
  const hoyIso = iso(new Date());

  const bloqueosPorDia = useMemo(() => {
    const m = new Map<string, BloqueoCal[]>();
    for (const b of bloqueos) m.set(b.fecha, [...(m.get(b.fecha) ?? []), b]);
    return m;
  }, [bloqueos]);
  const citasPorDia = useMemo(() => {
    const m = new Map<string, CitaCal[]>();
    for (const c of citas) m.set(c.fecha, [...(m.get(c.fecha) ?? []), c]);
    return m;
  }, [citas]);

  const contar = (f: string) => {
    const cs = citasPorDia.get(f) ?? [];
    return { aceptadas: cs.filter((c) => c.estado === "aceptada").length, pendientes: cs.filter((c) => c.estado === "pendiente").length };
  };

  const mover = (dir: -1 | 1) =>
    setCursor((c) => (vista === "semana" ? sumarDias(c, 7 * dir) : new Date(c.getFullYear(), c.getMonth() + dir, 1)));

  const semana = Array.from({ length: 7 }, (_, i) => sumarDias(lunesDe(cursor), i));
  const titulo =
    vista === "semana"
      ? `${semana[0].getDate()}–${semana[6].getDate()} ${MESES[semana[6].getMonth()].slice(0, 3)}`
      : MESES[cursor.getMonth()];

  return (
    <section className="relative border-2 border-carbon bg-papel-claro text-carbon shadow-[8px_8px_0_var(--color-lima)]">
      {/* Cabecera tipo ficha */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-carbon bg-carbon px-4 py-3 text-papel sm:px-6">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-3xl uppercase leading-none sm:text-4xl">{titulo}</h2>
          <span className="font-mono text-[11px] tracking-widest text-gris-claro">{semana[6].getFullYear()}</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => mover(-1)} aria-label={vista === "semana" ? "Semana anterior" : "Mes anterior"} className={CLASE_FLECHA}>
            <FlechaTinta dir={-1} />
          </button>
          <button type="button" onClick={() => mover(1)} aria-label={vista === "semana" ? "Semana siguiente" : "Mes siguiente"} className={CLASE_FLECHA}>
            <FlechaTinta dir={1} />
          </button>
          <div role="tablist" className="ml-2 flex rounded-full bg-papel/10 p-1">
            {(["semana", "mes"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                type="button"
                aria-selected={vista === v}
                onClick={() => setVista(v)}
                className={`rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                  vista === v ? "bg-lima text-tinta" : "text-gris-claro hover:text-papel"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="p-3 sm:p-5"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0b0b0b0d 1px, transparent 1px), linear-gradient(to bottom, #0b0b0b0d 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {vista === "semana" ? (
          <div className="grid grid-cols-[30px_repeat(7,minmax(0,1fr))] gap-x-1">
            <div />
            {semana.map((d, i) => {
              const f = iso(d);
              const esHoy = f === hoyIso;
              const n = contar(f);
              return (
                <div key={i} className="flex flex-col items-center gap-1 pb-2">
                  <span className="font-mono text-[10px] font-semibold tracking-widest text-[#555]">{DIAS[i]}</span>
                  <span className={`font-display grid h-9 w-9 place-items-center rounded-full text-xl leading-none ${esHoy ? "bg-lima" : ""}`}>
                    {d.getDate()}
                  </span>
                  <span className="h-3.5 text-carbon">
                    <Personas aceptadas={n.aceptadas} pendientes={n.pendientes} max={3} tam={12} />
                  </span>
                </div>
              );
            })}

            <div className="relative" style={{ height: (H_FIN - H_INICIO) * ALTO_HORA }}>
              {Array.from({ length: H_FIN - H_INICIO }, (_, i) =>
                i > 0 && i % 2 === 0 ? (
                  <span key={i} className="absolute right-1 -translate-y-1/2 font-mono text-[9px] text-[#777]" style={{ top: i * ALTO_HORA }}>
                    {H_INICIO + i}
                  </span>
                ) : null,
              )}
            </div>

            {semana.map((d, i) => {
              const f = iso(d);
              const h = horario[i + 1];
              const bls = bloqueosPorDia.get(f) ?? [];
              const diaEntero = bls.some((b) => !b.hora_inicio);
              return (
                <div key={f} className={`relative overflow-hidden border border-carbon/15 bg-papel ${f === hoyIso ? "ring-2 ring-carbon" : ""}`} style={{ height: (H_FIN - H_INICIO) * ALTO_HORA }}>
                  {Array.from({ length: (H_FIN - H_INICIO) / 2 - 1 }, (_, k) => (
                    <div key={k} className="absolute inset-x-0 border-t border-dashed border-carbon/10" style={{ top: (k + 1) * 2 * ALTO_HORA }} />
                  ))}
                  {h && !diaEntero && (
                    <div className="absolute inset-x-0 bg-lima/35" style={{ top: top(min(h.hora_inicio)), height: alto(min(h.hora_inicio), min(h.hora_fin)) }} />
                  )}
                  {diaEntero && <div className={`absolute inset-0 ${RAYAS}`} title="Día bloqueado" />}
                  {bls.filter((b) => b.hora_inicio && b.hora_fin).map((b, k) => (
                    <div key={k} title={b.motivo ?? "Bloqueo"} className={`absolute inset-x-0 ${RAYAS}`} style={{ top: top(min(b.hora_inicio!)), height: alto(min(b.hora_inicio!), min(b.hora_fin!)) }} />
                  ))}
                  {(citasPorDia.get(f) ?? []).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCitaAbierta(c)}
                      className={`absolute inset-x-0.5 overflow-hidden px-1 py-0.5 text-left text-[10px] leading-tight transition-transform hover:z-10 hover:scale-[1.04] ${
                        c.estado === "aceptada" ? "bg-carbon text-lima" : "border-2 border-dashed border-carbon bg-papel-claro text-carbon"
                      }`}
                      style={{ top: top(min(c.hora_inicio)), height: Math.max(alto(min(c.hora_inicio), min(c.hora_fin)), 18) }}
                    >
                      <span className="font-mono font-semibold">{c.hora_inicio.slice(0, 5)}</span>
                      <span className="hidden md:block md:truncate">{c.titulo}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-7 gap-1.5 pb-1.5">
              {DIAS.map((d) => (
                <div key={d} className="text-center font-mono text-[10px] font-semibold tracking-widest text-[#555]">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 42 }, (_, i) => {
                const d = sumarDias(lunesDe(new Date(cursor.getFullYear(), cursor.getMonth(), 1)), i);
                const f = iso(d);
                const delMes = d.getMonth() === cursor.getMonth();
                const h = horario[diaIso(d)];
                const diaEntero = (bloqueosPorDia.get(f) ?? []).some((b) => !b.hora_inicio);
                const abierto = !!h && !diaEntero;
                const n = contar(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setCursor(d);
                      setVista("semana");
                    }}
                    title="Ver esta semana"
                    className={`group flex min-h-[70px] flex-col justify-between border p-1.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--color-carbon)] sm:min-h-[92px] ${
                      abierto ? "border-carbon/40 bg-papel" : "border-carbon/10 bg-transparent"
                    } ${diaEntero ? RAYAS : ""} ${delMes ? "" : "opacity-35"}`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`font-display grid h-7 w-7 place-items-center rounded-full text-lg leading-none ${f === hoyIso ? "bg-lima" : ""}`}>
                        {d.getDate()}
                      </span>
                      {abierto && <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 rounded-full bg-lima ring-1 ring-carbon" />}
                    </div>
                    {abierto && (
                      <span className="hidden font-mono text-[9px] text-[#666] md:block">
                        {h.hora_inicio.slice(0, 5)}–{h.hora_fin.slice(0, 5)}
                      </span>
                    )}
                    <span className="text-carbon">
                      <Personas aceptadas={n.aceptadas} pendientes={n.pendientes} max={3} tam={13} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Leyenda */}
        <div className="mt-4 flex flex-wrap gap-4 border-t border-dashed border-carbon/30 pt-3 font-mono text-[10px] uppercase tracking-widest text-[#555]">
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 bg-lima/35 ring-1 ring-carbon/20" />Abierto</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 bg-carbon" />Confirmada</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 border-2 border-dashed border-carbon" />Pendiente</span>
          <span className="flex items-center gap-1.5"><i className={`h-3 w-3 ${RAYAS} ring-1 ring-carbon/20`} />Bloqueo</span>
        </div>
      </div>

      {/* Detalle de cita */}
      {citaAbierta && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-carbon/30 p-4" onClick={() => setCitaAbierta(null)}>
          <div
            role="dialog"
            aria-label="Detalle de la cita"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xs border-2 border-carbon bg-papel-claro p-5 shadow-[6px_6px_0_var(--color-lima)]"
          >
            <span className={`absolute -top-3 right-4 -rotate-3 px-2 py-0.5 font-display text-sm uppercase ${citaAbierta.estado === "aceptada" ? "bg-lima" : "bg-papel border-2 border-dashed border-carbon"}`}>
              {citaAbierta.estado === "aceptada" ? "Confirmada" : "Pendiente"}
            </span>
            <p className="font-display text-2xl uppercase leading-none">{citaAbierta.titulo}</p>
            <p className="mt-2 font-mono text-[12px]">
              {citaAbierta.fecha} · {citaAbierta.hora_inicio.slice(0, 5)}–{citaAbierta.hora_fin.slice(0, 5)}
            </p>
            {citaAbierta.cliente && <p className="mt-1 text-[13px] text-[#444]">Cliente: {citaAbierta.cliente}</p>}
            <div className="mt-4 flex items-center justify-between">
              {citaAbierta.estado === "pendiente" ? (
                <a href="/panel" className="font-mono text-[11px] font-semibold uppercase tracking-widest underline decoration-lima decoration-2 underline-offset-4">
                  Responder en el panel →
                </a>
              ) : <span />}
              <button type="button" onClick={() => setCitaAbierta(null)} className="font-mono text-[11px] uppercase text-[#555]">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
