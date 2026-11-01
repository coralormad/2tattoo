"use client";

import { useEffect, useState, type ReactNode } from "react";

// Pistas de primera visita: se ven la primera vez que el tatuador entra en una
// pantalla; al pulsar "Entendido" desaparecen. El botón "?" las vuelve a mostrar.
// Se guarda en localStorage (por navegador). Si algún día se quiere por cuenta,
// mover a una columna en `perfiles`.
const CLAVE_VISTA = (pagina: string) => `2tattoo:pistas-vistas:${pagina}`;
const CLAVE_MODO = "2tattoo:modo-ayuda";
const EVENTO = "2tattoo:ayuda";

function leer(clave: string) {
  try {
    return localStorage.getItem(clave) === "1";
  } catch {
    return false;
  }
}
function escribir(clave: string, valor: boolean) {
  try {
    if (valor) localStorage.setItem(clave, "1");
    else localStorage.removeItem(clave);
  } catch {}
  window.dispatchEvent(new Event(EVENTO));
}

function useAyuda(pagina: string) {
  const [estado, setEstado] = useState({ listo: false, vista: true, modo: false });
  useEffect(() => {
    const actualizar = () =>
      setEstado({ listo: true, vista: leer(CLAVE_VISTA(pagina)), modo: leer(CLAVE_MODO) });
    actualizar();
    window.addEventListener(EVENTO, actualizar);
    return () => window.removeEventListener(EVENTO, actualizar);
  }, [pagina]);
  return estado;
}

export function Pista({ pagina, children }: { pagina: string; children: ReactNode }) {
  const { listo, vista, modo } = useAyuda(pagina);
  if (!listo || (vista && !modo)) return null;

  return (
    <div className="relative mt-4 flex max-w-md items-start gap-3 rounded-2xl border border-white/10 border-l-4 border-l-lima bg-tinta/60 p-4 text-[13px] leading-relaxed text-gris-claro backdrop-blur-md">
      <span aria-hidden="true" className="font-mono text-[10px] uppercase tracking-widest text-lima">
        Pista
      </span>
      <div className="flex-1">{children}</div>
      {!vista && (
        <button
          type="button"
          onClick={() => escribir(CLAVE_VISTA(pagina), true)}
          className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-widest text-lima underline decoration-dashed underline-offset-2"
        >
          Entendido
        </button>
      )}
    </div>
  );
}

export function BotonAyuda({ pagina }: { pagina: string }) {
  const { modo } = useAyuda(pagina);
  return (
    <button
      type="button"
      onClick={() => escribir(CLAVE_MODO, !modo)}
      aria-pressed={modo}
      aria-label={modo ? "Ocultar pistas" : "Mostrar pistas"}
      title={modo ? "Ocultar pistas" : "Mostrar pistas"}
      className={`grid h-9 w-9 place-items-center rounded-full border font-mono text-sm font-bold transition-colors ${
        modo ? "border-lima bg-lima text-tinta" : "border-white/25 bg-tinta/60 text-papel backdrop-blur-md hover:border-lima"
      }`}
    >
      ?
    </button>
  );
}
