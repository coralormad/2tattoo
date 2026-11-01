"use client";

import { useActionState } from "react";
import { publicarFlash } from "@/app/panel/actions";
import { CampoFicha } from "@/components/marca/CampoFicha";
import { IconoFlash, type TipoIconoFlash } from "@/components/marca/IconoFlash";
import {
  CabeceraTarjeta,
  ChipRadio,
  CLASE_BOTON_PRIMARIO,
  CLASE_TARJETA,
  GrupoChips,
} from "@/components/panel/ui";

const ICONOS: { valor: TipoIconoFlash; etiqueta: string }[] = [
  { valor: "star", etiqueta: "Estrella" },
  { valor: "moon", etiqueta: "Luna" },
  { valor: "dagger", etiqueta: "Daga" },
  { valor: "snake", etiqueta: "Serpiente" },
];

const DURACIONES = [
  { valor: "30", etiqueta: "30 min" },
  { valor: "60", etiqueta: "1 h" },
  { valor: "90", etiqueta: "1 h 30" },
  { valor: "120", etiqueta: "2 h" },
  { valor: "180", etiqueta: "3 h" },
  { valor: "240", etiqueta: "4 h" },
];

export function FormularioFlash() {
  const [estado, accion, enviando] = useActionState(publicarFlash, null);

  return (
    <form action={accion} noValidate className={CLASE_TARJETA}>
      <CabeceraTarjeta titulo="Publicar flash" numero="01" />

      <div className="flex flex-col gap-6 p-5">
        <CampoFicha
          numero="01"
          etiqueta="Título"
          id="flash-titulo"
          name="titulo"
          type="text"
          placeholder="Golondrina pequeña"
          required
        />

        <GrupoChips numero="02" etiqueta="Tipo">
          <ChipRadio name="tipo" value="flash" defaultChecked>
            Repetible
          </ChipRadio>
          <ChipRadio name="tipo" value="flash_unico">
            Único
          </ChipRadio>
        </GrupoChips>

        <GrupoChips numero="03" etiqueta="Icono">
          {ICONOS.map((i, n) => (
            <ChipRadio key={i.valor} name="icono" value={i.valor} defaultChecked={n === 0}>
              <IconoFlash tipo={i.valor} className="h-4 w-4" />
              {i.etiqueta}
            </ChipRadio>
          ))}
        </GrupoChips>

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

        <CampoFicha numero="06" etiqueta="Ciudad" id="flash-ciudad" name="ciudad" type="text" placeholder="Sevilla" />

        <GrupoChips numero="07" etiqueta="Duración aprox.">
          {DURACIONES.map((d) => (
            <ChipRadio key={d.valor} name="duracion_min" value={d.valor} defaultChecked={d.valor === "60"}>
              {d.etiqueta}
            </ChipRadio>
          ))}
        </GrupoChips>

        {estado?.error && (
          <p role="alert" className="text-sm font-semibold text-[#b3221c]">
            {estado.error}
          </p>
        )}

        <button type="submit" disabled={enviando} className={CLASE_BOTON_PRIMARIO}>
          <span>{enviando ? "Publicando…" : "Publicar flash"}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
