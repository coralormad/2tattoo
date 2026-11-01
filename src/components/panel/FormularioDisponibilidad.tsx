"use client";

import { useActionState, useState } from "react";
import { guardarDisponibilidad } from "@/app/panel/agenda/actions";
import { Personas } from "@/components/panel/IconoPersona";

const DIAS = [
  { num: 1, corto: "LUN" },
  { num: 2, corto: "MAR" },
  { num: 3, corto: "MIÉ" },
  { num: 4, corto: "JUE" },
  { num: 5, corto: "VIE" },
  { num: 6, corto: "SÁB" },
  { num: 7, corto: "DOM" },
];

const PRESETS = [
  { etiqueta: "Lun–Vie", dias: [1, 2, 3, 4, 5] },
  { etiqueta: "Mar–Sáb", dias: [2, 3, 4, 5, 6] },
  { etiqueta: "Lun–Sáb", dias: [1, 2, 3, 4, 5, 6] },
  { etiqueta: "Todos", dias: [1, 2, 3, 4, 5, 6, 7] },
];

const ESCALA_INI = 8 * 60;
const ESCALA_FIN = 22 * 60;

export type ProximoDia = { etiqueta: string; aceptadas: number; pendientes: number };
type DisponibilidadPrevia = Record<number, { hora_inicio: string; hora_fin: string }>;
type Dia = { abierto: boolean; inicio: string; fin: string };

const aMin = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return (a || 0) * 60 + (b || 0);
};
const pct = (m: number) =>
  ((Math.min(Math.max(m, ESCALA_INI), ESCALA_FIN) - ESCALA_INI) / (ESCALA_FIN - ESCALA_INI)) * 100;

const claseHora =
  "w-full border-0 border-b-2 border-carbon bg-transparent py-1 text-center font-mono text-[13px] text-carbon outline-none focus-visible:border-lima focus-visible:bg-lima/20";

export function FormularioDisponibilidad({
  previa,
  proximos,
}: {
  previa: DisponibilidadPrevia;
  proximos: Record<number, ProximoDia>;
}) {
  const [estado, accion, enviando] = useActionState(guardarDisponibilidad, null);
  const [dias, setDias] = useState<Record<number, Dia>>(() => {
    const inicial: Record<number, Dia> = {};
    for (const d of DIAS) {
      inicial[d.num] = {
        abierto: !!previa[d.num],
        inicio: previa[d.num]?.hora_inicio?.slice(0, 5) ?? "10:00",
        fin: previa[d.num]?.hora_fin?.slice(0, 5) ?? "20:00",
      };
    }
    return inicial;
  });

  const cambiar = (num: number, cambios: Partial<Dia>) =>
    setDias((prev) => ({ ...prev, [num]: { ...prev[num], ...cambios } }));
  const aplicarPreset = (lista: number[]) =>
    setDias((prev) => {
      const nuevo = { ...prev };
      for (const d of DIAS) nuevo[d.num] = { ...prev[d.num], abierto: lista.includes(d.num) };
      return nuevo;
    });
  const copiarATodos = (num: number) =>
    setDias((prev) => {
      const { inicio, fin } = prev[num];
      const nuevo = { ...prev };
      for (const d of DIAS) if (nuevo[d.num].abierto) nuevo[d.num] = { ...nuevo[d.num], inicio, fin };
      return nuevo;
    });

  const horasSemana = DIAS.reduce((acc, d) => {
    const x = dias[d.num];
    return x.abierto && x.fin > x.inicio ? acc + (aMin(x.fin) - aMin(x.inicio)) / 60 : acc;
  }, 0);

  return (
    <form action={accion} noValidate className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-4xl uppercase leading-none">
            Horario <span className="text-lima [-webkit-text-stroke:1px_var(--color-carbon)]">habitual</span>
          </h2>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-gris">
            {horasSemana.toLocaleString("es-ES", { maximumFractionDigits: 1 })} h / semana
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => {
            const activo = DIAS.every((d) => dias[d.num].abierto === p.dias.includes(d.num));
            return (
              <button
                key={p.etiqueta}
                type="button"
                aria-pressed={activo}
                onClick={() => aplicarPreset(p.dias)}
                className={`rounded-full border-2 px-3 py-1 font-mono text-[11px] font-semibold uppercase transition-colors ${
                  activo ? "border-lima bg-lima text-tinta" : "border-gris text-gris hover:border-lima hover:text-lima"
                }`}
              >
                {p.etiqueta}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {DIAS.map((d) => {
          const dia = dias[d.num];
          const valido = dia.fin > dia.inicio;
          const prox = proximos[d.num];
          return (
            <div
              key={d.num}
              className={`group flex flex-col gap-3 border-2 p-3 text-carbon transition-all ${
                dia.abierto
                  ? "border-carbon bg-papel-claro hover:-translate-y-1 hover:shadow-[5px_5px_0_var(--color-lima)]"
                  : "border-carbon/20 bg-papel-claro/60"
              }`}
            >
              {dia.abierto && <input type="hidden" name={`abierto_${d.num}`} value="on" />}

              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`font-display block text-3xl uppercase leading-none ${dia.abierto ? "" : "text-carbon/40"}`}>
                    {d.corto}
                  </span>
                  {prox && <span className="font-mono text-[10px] uppercase tracking-widest text-[#666]">{prox.etiqueta}</span>}
                </div>
                {/* Interruptor */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={dia.abierto}
                  aria-label={`${d.corto} ${dia.abierto ? "abierto" : "cerrado"}`}
                  onClick={() => cambiar(d.num, { abierto: !dia.abierto })}
                  className={`relative h-6 w-11 shrink-0 rounded-full border-2 border-carbon transition-colors ${dia.abierto ? "bg-lima" : "bg-papel"}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-carbon transition-all ${dia.abierto ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>

              {/* Mini línea de tiempo 08–22 */}
              <div className="relative h-2.5 rounded-full bg-carbon/10" aria-hidden="true">
                {dia.abierto && valido && (
                  <div
                    className="absolute inset-y-0 rounded-full bg-lima ring-1 ring-carbon transition-all"
                    style={{ left: `${pct(aMin(dia.inicio))}%`, width: `${pct(aMin(dia.fin)) - pct(aMin(dia.inicio))}%` }}
                  />
                )}
              </div>

              {dia.abierto ? (
                <div className="flex flex-col gap-1.5">
                  <input type="time" name={`inicio_${d.num}`} value={dia.inicio} onChange={(e) => cambiar(d.num, { inicio: e.target.value })} required aria-label={`${d.corto} apertura`} className={claseHora} />
                  <input type="time" name={`fin_${d.num}`} value={dia.fin} onChange={(e) => cambiar(d.num, { fin: e.target.value })} required aria-label={`${d.corto} cierre`} className={`${claseHora} ${valido ? "" : "border-[#b3221c] text-[#b3221c]"}`} />
                </div>
              ) : (
                <span className="py-4 text-center font-mono text-[11px] uppercase tracking-widest text-carbon/40">Cerrado</span>
              )}

              <div className="mt-auto flex items-center justify-between border-t border-dashed border-carbon/30 pt-2">
                <span className="min-h-[14px] text-carbon">
                  {prox && (prox.aceptadas + prox.pendientes > 0) ? (
                    <Personas aceptadas={prox.aceptadas} pendientes={prox.pendientes} max={3} tam={14} />
                  ) : (
                    <span className="font-mono text-[10px] text-[#888]">libre</span>
                  )}
                </span>
                {dia.abierto && (
                  <button
                    type="button"
                    onClick={() => copiarATodos(d.num)}
                    title="Copiar este horario a todos los días abiertos"
                    className="font-mono text-[10px] uppercase text-[#666] opacity-0 transition-opacity hover:text-carbon group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    ⧉ copiar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {estado?.error && (
        <p role="alert" className="text-sm text-[#ff6b5e]">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="font-display flex items-center gap-3 self-end border-2 border-carbon bg-lima px-6 py-3 text-xl uppercase text-tinta shadow-[5px_5px_0_var(--color-papel)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {enviando ? "Guardando…" : "Guardar horario"} <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
