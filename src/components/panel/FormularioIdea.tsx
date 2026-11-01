"use client";

import { useActionState, useState } from "react";
import { publicarIdea } from "@/app/panel/actions";
import { CampoFicha } from "@/components/marca/CampoFicha";
import { AreaFicha } from "@/components/marca/AreaFicha";
import { CabeceraTarjeta, claseChip, CLASE_BOTON_PRIMARIO, CLASE_TARJETA } from "@/components/panel/ui";

const ZONAS = ["Antebrazo", "Brazo", "Espalda", "Pierna", "Costillas", "Mano"];

export function FormularioIdea() {
  const [estado, accion, enviando] = useActionState(publicarIdea, null);
  const [zona, setZona] = useState("");

  return (
    <form action={accion} noValidate className={CLASE_TARJETA}>
      <CabeceraTarjeta
        titulo="Publicar idea"
        numero="02"
        extra={
          <span className="-rotate-2 border border-lima px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-lima">
            Busco lienzo
          </span>
        }
      />

      <div className="flex flex-col gap-6 p-5">
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

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {ZONAS.map((z) => (
              <button
                key={z}
                type="button"
                aria-pressed={zona === z}
                onClick={() => setZona(zona === z ? "" : z)}
                className={claseChip(zona === z)}
              >
                {z}
              </button>
            ))}
          </div>
          <CampoFicha
            numero="03"
            etiqueta="Zona del cuerpo"
            id="idea-zona"
            name="zona"
            type="text"
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            placeholder="O escríbela tú…"
          />
        </div>

        {estado?.error && (
          <p role="alert" className="text-sm font-semibold text-[#b3221c]">
            {estado.error}
          </p>
        )}

        <button type="submit" disabled={enviando} className={CLASE_BOTON_PRIMARIO}>
          <span>{enviando ? "Publicando…" : "Publicar idea"}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
