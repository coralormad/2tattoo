"use client";

import { useActionState } from "react";
import { publicarIdea } from "@/app/panel/actions";
import { CampoFicha } from "@/components/marca/CampoFicha";
import { AreaFicha } from "@/components/marca/AreaFicha";

export function FormularioIdea() {
  const [estado, accion, enviando] = useActionState(publicarIdea, null);

  return (
    <form
      action={accion}
      noValidate
      className="flex flex-col gap-5 border-b-2 border-r-2 border-carbon bg-papel-claro p-6 text-carbon"
    >
      <div className="flex justify-between border-b border-dashed border-carbon pb-3 text-[11px] font-semibold uppercase tracking-widest">
        <span>Publicar idea</span>
        <span>Nº 02</span>
      </div>

      <CampoFicha
        numero="01"
        etiqueta="Título"
        id="idea-titulo"
        name="titulo"
        type="text"
        placeholder="Busco lienzo para manga japonesa"
        required
      />

      <AreaFicha
        numero="02"
        etiqueta="Descripción"
        id="idea-texto"
        name="texto"
        rows={3}
        placeholder="¿Qué buscas tatuar?"
      />

      <CampoFicha
        numero="03"
        etiqueta="Zona del cuerpo"
        id="idea-zona"
        name="zona"
        type="text"
        placeholder="Antebrazo"
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
        <span>{enviando ? "Publicando…" : "Publicar idea"}</span>
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
