"use client";

import { useActionState, useState } from "react";
import { crearBloqueo } from "@/app/panel/agenda/actions";

const ESCALA_INI = 8 * 60;
const ESCALA_FIN = 22 * 60;
const RAYAS = "bg-[repeating-linear-gradient(135deg,#b3221c55_0_5px,transparent_5px_10px)]";
const MOTIVOS = ["Vacaciones", "Convención", "Guest", "Personal"];

const fechaLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const aMin = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return (a || 0) * 60 + (b || 0);
};
const pct = (m: number) =>
  ((Math.min(Math.max(m, ESCALA_INI), ESCALA_FIN) - ESCALA_INI) / (ESCALA_FIN - ESCALA_INI)) * 100;

function atajos() {
  const hoy = new Date();
  const manana = new Date();
  manana.setDate(hoy.getDate() + 1);
  const sabado = new Date();
  sabado.setDate(hoy.getDate() + ((6 - hoy.getDay() + 7) % 7));
  return [
    { etiqueta: "Hoy", valor: fechaLocal(hoy) },
    { etiqueta: "Mañana", valor: fechaLocal(manana) },
    { etiqueta: "Este sábado", valor: fechaLocal(sabado) },
  ];
}

const claseChip = (activo: boolean) =>
  `rounded-full border-2 px-3 py-1 font-mono text-[11px] font-semibold uppercase transition-colors ${
    activo ? "border-carbon bg-lima text-tinta" : "border-carbon/30 text-carbon/70 hover:border-carbon hover:text-carbon"
  }`;

const claseHora =
  "w-full border-0 border-b-2 border-carbon bg-transparent py-1 text-center font-mono text-[15px] text-carbon outline-none focus-visible:border-lima focus-visible:bg-lima/20";

export function FormularioBloqueo() {
  const [estado, accion, enviando] = useActionState(crearBloqueo, null);
  const [opciones] = useState(atajos);
  const [fecha, setFecha] = useState("");
  const [diaEntero, setDiaEntero] = useState(true);
  const [inicio, setInicio] = useState("10:00");
  const [fin, setFin] = useState("14:00");
  const [motivo, setMotivo] = useState("");

  const valido = diaEntero || fin > inicio;
  const izq = diaEntero ? 0 : pct(aMin(inicio));
  const ancho = diaEntero ? 100 : Math.max(pct(aMin(fin)) - izq, 0);

  return (
    <form
      action={accion}
      noValidate
      className="border-2 border-carbon bg-papel-claro text-carbon shadow-[8px_8px_0_var(--color-lima)]"
    >
      <div className="flex items-center justify-between border-b-2 border-carbon bg-carbon px-5 py-3 text-papel">
        <span className="font-display text-2xl uppercase leading-none">Añadir bloqueo</span>
        <span className="font-mono text-[11px] tracking-widest text-gris-claro">Nº 02</span>
      </div>

      <div className="flex flex-col gap-6 p-5">
        {/* 01 — Fecha */}
        <div className="flex flex-col gap-2">
          <label htmlFor="bloqueo-fecha" className="text-[11px] uppercase tracking-widest">
            01 — Fecha
          </label>
          <div className="flex flex-wrap gap-1.5">
            {opciones.map((o) => (
              <button
                key={o.etiqueta}
                type="button"
                aria-pressed={fecha === o.valor}
                onClick={() => setFecha(o.valor)}
                className={claseChip(fecha === o.valor)}
              >
                {o.etiqueta}
              </button>
            ))}
          </div>
          <input
            id="bloqueo-fecha"
            type="date"
            name="fecha"
            value={fecha}
            min={opciones[0].valor}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="border-0 border-b-2 border-carbon bg-transparent py-2 font-mono text-[17px] text-carbon outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lima"
          />
        </div>

        {/* 02 — Franja */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest">02 — Franja</span>
            <label className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest">
              Día entero
              <button
                type="button"
                role="switch"
                aria-checked={diaEntero}
                onClick={() => setDiaEntero(!diaEntero)}
                className={`relative h-6 w-11 shrink-0 rounded-full border-2 border-carbon transition-colors ${diaEntero ? "bg-lima" : "bg-papel"}`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-carbon transition-all ${diaEntero ? "left-[22px]" : "left-0.5"}`}
                />
              </button>
            </label>
          </div>
          {diaEntero && <input type="hidden" name="dia_entero" value="on" />}

          <div className="flex flex-col gap-1">
            <div className="relative h-3 overflow-hidden rounded-full bg-carbon/10" aria-hidden="true">
              {valido && (
                <div
                  className={`absolute inset-y-0 rounded-full ring-1 ring-[#b3221c] transition-all ${RAYAS}`}
                  style={{ left: `${izq}%`, width: `${ancho}%` }}
                />
              )}
            </div>
            <div className="flex justify-between font-mono text-[10px] text-[#888]" aria-hidden="true">
              <span>08</span>
              <span>12</span>
              <span>16</span>
              <span>22</span>
            </div>
          </div>

          {!diaEntero && (
            <div className="flex items-center gap-3">
              <input
                type="time"
                name="hora_inicio"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                required
                aria-label="Hora de inicio del bloqueo"
                className={claseHora}
              />
              <span aria-hidden="true">–</span>
              <input
                type="time"
                name="hora_fin"
                value={fin}
                onChange={(e) => setFin(e.target.value)}
                required
                aria-label="Hora de fin del bloqueo"
                className={`${claseHora} ${valido ? "" : "border-[#b3221c] text-[#b3221c]"}`}
              />
            </div>
          )}
        </div>

        {/* 03 — Motivo */}
        <div className="flex flex-col gap-2">
          <label htmlFor="bloqueo-motivo" className="text-[11px] uppercase tracking-widest">
            03 — Motivo (opcional)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {MOTIVOS.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={motivo === m}
                onClick={() => setMotivo(motivo === m ? "" : m)}
                className={claseChip(motivo === m)}
              >
                {m}
              </button>
            ))}
          </div>
          <input
            id="bloqueo-motivo"
            type="text"
            name="motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="O escríbelo tú…"
            className="border-0 border-b-2 border-carbon bg-transparent py-2 font-mono text-[15px] text-carbon outline-none placeholder:text-carbon/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lima"
          />
        </div>

        {estado?.error && (
          <p role="alert" className="text-sm font-semibold text-[#b3221c]">
            {estado.error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="font-display flex items-center justify-between border-2 border-carbon bg-carbon px-5 py-4 text-xl uppercase text-papel shadow-[5px_5px_0_var(--color-lima)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          <span>{enviando ? "Añadiendo…" : "Añadir bloqueo"}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
