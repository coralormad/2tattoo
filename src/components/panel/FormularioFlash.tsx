"use client";

import { useActionState } from "react";
import { publicarFlash } from "@/app/panel/actions";
import { CampoFicha } from "@/components/marca/CampoFicha";
import { SelectorFicha } from "@/components/marca/SelectorFicha";

export function FormularioFlash() {
  const [estado, accion, enviando] = useActionState(publicarFlash, null);

  return (
    <form
      action={accion}
      noValidate
      className="flex flex-col gap-5 border-b-2 border-r-2 border-carbon bg-papel-claro p-6 text-carbon"
    >
      <div className="flex justify-between border-b border-dashed border-carbon pb-3 text-[11px] font-semibold uppercase tracking-widest">
        <span>Publicar flash</span>
        <span>Nº 01</span>
      </div>

      <CampoFicha
        numero="01"
        etiqueta="Título"
        id="flash-titulo"
        name="titulo"
        type="text"
        placeholder="Golondrina pequeña"
        required
      />

      <SelectorFicha numero="02" etiqueta="Tipo" id="flash-tipo" name="tipo" defaultValue="flash">
        <option value="flash">Flash (repetible)</option>
        <option value="flash_unico">Flash único</option>
      </SelectorFicha>

      <SelectorFicha numero="03" etiqueta="Icono" id="flash-icono" name="icono" defaultValue="star">
        <option value="star">Estrella</option>
        <option value="moon">Luna</option>
        <option value="dagger">Daga</option>
        <option value="snake">Serpiente</option>
      </SelectorFicha>

      <div className="grid grid-cols-2 gap-4">
        <CampoFicha
          numero="04"
          etiqueta="Medida (cm)"
          id="flash-medida"
          name="medida_cm"
          type="number"
          min="1"
          step="0.5"
        />
        <CampoFicha
          numero="05"
          etiqueta="Precio desde (€)"
          id="flash-precio"
          name="precio_desde"
          type="number"
          min="0"
          step="1"
        />
      </div>

      <CampoFicha
        numero="06"
        etiqueta="Ciudad"
        id="flash-ciudad"
        name="ciudad"
        type="text"
        placeholder="Sevilla"
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
        <span>{enviando ? "Publicando…" : "Publicar flash"}</span>
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
