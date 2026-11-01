import type { ReactNode } from "react";

/* Piezas comunes del panel del tatuador: tarjeta de papel con cabecera negra,
   títulos de sección, avisos tipo sello y chips. */

export const CLASE_TARJETA =
  "border-2 border-carbon bg-papel-claro text-carbon shadow-[8px_8px_0_var(--color-lima)]";

export const CLASE_BOTON_PRIMARIO =
  "font-display flex items-center justify-between border-2 border-carbon bg-carbon px-5 py-4 text-xl uppercase text-papel shadow-[5px_5px_0_var(--color-lima)] transition-transform hover:-translate-y-0.5 disabled:opacity-60";

export const RAYAS_ROJAS = "bg-[repeating-linear-gradient(135deg,#b3221c55_0_5px,transparent_5px_10px)]";

export const claseChip = (activo: boolean) =>
  `rounded-full border-2 px-3 py-1 font-mono text-[11px] font-semibold uppercase transition-colors ${
    activo ? "border-carbon bg-lima text-tinta" : "border-carbon/30 text-carbon/70 hover:border-carbon hover:text-carbon"
  }`;

export function CabeceraTarjeta({ titulo, numero, extra }: { titulo: ReactNode; numero?: string; extra?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b-2 border-carbon bg-carbon px-5 py-3 text-papel">
      <span className="font-display text-2xl uppercase leading-none">{titulo}</span>
      <span className="flex items-center gap-3">
        {extra}
        {numero && <span className="font-mono text-[11px] tracking-widest text-gris-claro">Nº {numero}</span>}
      </span>
    </div>
  );
}

/** Título de sección: Anton con la palabra resaltada en lima perfilada y contador en mono. */
export function TituloSeccion({
  id,
  antes,
  resaltado,
  contador,
  accion,
}: {
  id?: string;
  antes?: string;
  resaltado: string;
  contador?: ReactNode;
  accion?: ReactNode;
}) {
  return (
    <div id={id} className="flex scroll-mt-24 flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-4xl uppercase leading-none">
          {antes && <>{antes} </>}
          <span className="text-lima [-webkit-text-stroke:1px_var(--color-carbon)]">{resaltado}</span>
        </h2>
        {contador && (
          <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-gris">{contador}</p>
        )}
      </div>
      {accion}
    </div>
  );
}

/** Aviso tipo sello sobre el fondo oscuro. */
export function Aviso({ tipo = "ok", children }: { tipo?: "ok" | "error"; children: ReactNode }) {
  const ok = tipo === "ok";
  return (
    <p
      role="status"
      className={`mt-5 inline-flex max-w-lg -rotate-1 items-start gap-3 border-2 border-dashed px-4 py-3 font-mono text-[12px] font-semibold uppercase leading-relaxed tracking-wide ${
        ok ? "border-lima bg-lima/10 text-lima" : "border-[#ff6b5e] bg-[#ff6b5e]/10 text-[#ff6b5e]"
      }`}
    >
      <span aria-hidden="true" className="text-base leading-none">
        {ok ? "✓" : "!"}
      </span>
      <span>{children}</span>
    </p>
  );
}

/** Chip que es un radio real (accesible, sin JS). */
export function ChipRadio({
  name,
  value,
  defaultChecked,
  children,
}: {
  name: string;
  value: string;
  defaultChecked?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="flex items-center gap-1.5 rounded-full border-2 border-carbon/30 px-3 py-1 font-mono text-[11px] font-semibold uppercase text-carbon/70 transition-colors hover:border-carbon hover:text-carbon peer-checked:border-carbon peer-checked:bg-lima peer-checked:text-tinta peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lima">
        {children}
      </span>
    </label>
  );
}

/** Grupo de chips con etiqueta numerada estilo ficha. */
export function GrupoChips({ numero, etiqueta, children }: { numero: string; etiqueta: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-[11px] uppercase tracking-widest text-carbon">
        {numero} — {etiqueta}
      </legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}
