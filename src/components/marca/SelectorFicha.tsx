import type { SelectHTMLAttributes, ReactNode } from "react";

type SelectorFichaProps = SelectHTMLAttributes<HTMLSelectElement> & {
  numero: string;
  etiqueta: string;
  children: ReactNode;
};

/** Selector con la numeración tipo "ficha técnica", a juego con CampoFicha. */
export function SelectorFicha({ numero, etiqueta, id, children, ...props }: SelectorFichaProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[11px] uppercase tracking-widest text-carbon">
        {numero} — {etiqueta}
      </label>
      <select
        id={id}
        className="border-0 border-b-2 border-carbon bg-transparent py-2 font-mono text-[17px] text-carbon outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lima"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
