"use client";

import { useActionState, useState } from "react";
import { guardarDisponibilidad } from "@/app/panel/agenda/actions";

const DIAS = [
  { num: 1, etiqueta: "Lunes" },
  { num: 2, etiqueta: "Martes" },
  { num: 3, etiqueta: "Miércoles" },
  { num: 4, etiqueta: "Jueves" },
  { num: 5, etiqueta: "Viernes" },
  { num: 6, etiqueta: "Sábado" },
  { num: 7, etiqueta: "Domingo" },
];

type DisponibilidadPrevia = Record<number, { hora_inicio: string; hora_fin: string }>;

export function FormularioDisponibilidad({ previa }: { previa: DisponibilidadPrevia }) {
  const [estado, accion, enviando] = useActionState(guardarDisponibilidad, null);
  const [abiertos, setAbiertos] = useState<Record<number, boolean>>(() => {
    const inicial: Record<number, boolean> = {};
    for (const d of DIAS) inicial[d.num] = !!previa[d.num];
    return inicial;
  });

  return (
    <form
      action={accion}
      noValidate
      className="flex flex-col gap-4 border-b-2 border-r-2 border-carbon bg-papel-claro p-6 text-carbon"
    >
      <div className="flex justify-between border-b border-dashed border-carbon pb-3 text-[11px] font-semibold uppercase tracking-widest">
        <span>Horario habitual</span>
        <span>Nº 01</span>
      </div>

      {DIAS.map((d) => {
        const abierto = abiertos[d.num];
        return (
          <div key={d.num} className="flex flex-wrap items-center gap-3 border-b border-dashed border-carbon pb-3">
            <label className="flex w-32 items-center gap-2 text-[13px] font-semibold">
              <input
                type="checkbox"
                name={`abierto_${d.num}`}
                checked={abierto}
                onChange={(e) => setAbiertos((prev) => ({ ...prev, [d.num]: e.target.checked }))}
                className="h-4 w-4 accent-carbon"
              />
              {d.etiqueta}
            </label>
            {abierto ? (
              <div className="flex items-center gap-2 text-[13px]">
                <input
                  type="time"
                  name={`inicio_${d.num}`}
                  defaultValue={previa[d.num]?.hora_inicio?.slice(0, 5) ?? "10:00"}
                  required
                  className="border-0 border-b-2 border-carbon bg-transparent py-1 font-mono text-carbon outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lima"
                />
                <span>–</span>
                <input
                  type="time"
                  name={`fin_${d.num}`}
                  defaultValue={previa[d.num]?.hora_fin?.slice(0, 5) ?? "20:00"}
                  required
                  className="border-0 border-b-2 border-carbon bg-transparent py-1 font-mono text-carbon outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lima"
                />
              </div>
            ) : (
              <span className="text-[13px] text-[#777]">Cerrado</span>
            )}
          </div>
        );
      })}

      {estado?.error && (
        <p role="alert" className="text-sm text-[#b3221c]">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="font-display flex items-center justify-between border-2 border-carbon bg-carbon px-5 py-4 text-xl uppercase text-papel shadow-[6px_6px_0_var(--color-lima)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        <span>{enviando ? "Guardando…" : "Guardar horario"}</span>
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
