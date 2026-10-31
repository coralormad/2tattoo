import type { TextareaHTMLAttributes } from "react";

type AreaFichaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  numero: string;
  etiqueta: string;
};

/** Área de texto con la numeración tipo "ficha técnica", a juego con CampoFicha. */
export function AreaFicha({ numero, etiqueta, id, ...props }: AreaFichaProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[11px] uppercase tracking-widest text-carbon">
        {numero} — {etiqueta}
      </label>
      <textarea
        id={id}
        className="border-0 border-b-2 border-carbon bg-transparent py-2 font-mono text-[17px] leading-snug text-carbon outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lima"
        {...props}
      />
    </div>
  );
}
