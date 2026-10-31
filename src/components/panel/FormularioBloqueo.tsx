"use client";

import { useActionState, useState } from "react";
import { crearBloqueo } from "@/app/panel/agenda/actions";
import { CampoFicha } from "@/components/marca/CampoFicha";

export function FormularioBloqueo() {
  const [estado, accion, enviando] = useActionState(crearBloqueo, null);
  const [diaEntero, setDiaEntero] = useState(true);

  return (
    <form
      action={accion}
      noValidate
      className="flex flex-col gap-4 border-b-2 border-r-2 border-carbon bg-papel-claro p-6 text-carbon"
    >
      <div className="flex justify-between border-b border-dashed border-carbon pb-3 text-[11px] font-semibold uppercase tracking-widest">
        <span>Añadir bloqueo</span>
        <span>Nº 02</span>
      </div>

      <CampoFicha
        numero="01"
        etiqueta="Fecha"
        id="bloqueo-fecha"
        name="fecha"
        type="date"
        min={new Date().toISOString().slice(0, 10)}
        required
      />

      <label className="flex items-center gap-2 text-[13px] font-semibold">
        <input
          type="checkbox"
          name="dia_entero"
          checked={diaEntero}
          onChange={(e) => setDiaEntero(e.target.checked)}
          className="h-4 w-4 accent-carbon"
        />
        Día entero
      </label>

      {!diaEntero && (
        <div className="flex items-center gap-2 text-[13px]">
          <input
            type="time"
            name="hora_inicio"
            required
            className="border-0 border-b-2 border-carbon bg-transparent py-1 font-mono text-carbon outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lima"
          />
          <span>–</span>
          <input
            type="time"
            name="hora_fin"
            required
            className="border-0 border-b-2 border-carbon bg-transparent py-1 font-mono text-carbon outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lima"
          />
        </div>
      )}

      <CampoFicha
        numero="02"
        etiqueta="Motivo (opcional)"
        id="bloqueo-motivo"
        name="motivo"
        type="text"
        placeholder="Convención, vacaciones, otro trabajo…"
      />

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
        <span>{enviando ? "Añadiendo…" : "Añadir bloqueo"}</span>
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
