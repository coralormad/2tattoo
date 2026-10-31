import type { InputHTMLAttributes } from "react";

type CampoFichaProps = InputHTMLAttributes<HTMLInputElement> & {
  numero: string;
  etiqueta: string;
};

/** Campo de formulario con la numeración tipo "ficha técnica" del diseño. */
export function CampoFicha({ numero, etiqueta, id, ...props }: CampoFichaProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[11px] uppercase tracking-widest text-carbon">
        {numero} — {etiqueta}
      </label>
      <input
        id={id}
        className="border-0 border-b-2 border-carbon bg-transparent py-2 font-mono text-[17px] text-carbon outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lima"
        {...props}
      />
    </div>
  );
}
