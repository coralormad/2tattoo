"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { solicitarFlash } from "@/app/flash/[id]/actions";
import type { Hueco } from "@/lib/disponibilidad";

const ZONAS = ["Antebrazo", "Pantorrilla", "Muslo", "Costilla"] as const;

type SolicitudFlashProps = {
  flashId: string;
  titulo: string;
  esUnico: boolean;
  haySesion: boolean;
  huecos: Hueco[];
};

/** Formulario de reserva de la ficha de flash: zona + hueco real de agenda + nota. */
export function SolicitudFlash({ flashId, titulo, esUnico, haySesion, huecos }: SolicitudFlashProps) {
  const [zona, setZona] = useState<string | null>(null);
  const [huecoElegido, setHuecoElegido] = useState<Hueco | null>(null);
  const [estado, accion, enviando] = useActionState(solicitarFlash, null);

  if (!haySesion) {
    return (
      <div className="flex flex-col gap-4 border-t-2 border-carbon pt-6">
        <p className="text-sm leading-relaxed text-[#444]">
          Inicia sesión para solicitar este {esUnico ? "flash único" : "flash"}.
        </p>
        <Link
          href="/login"
          className="font-display flex w-fit items-center gap-2 border-2 border-carbon bg-carbon px-5 py-3 text-xl uppercase text-papel no-underline shadow-[6px_6px_0_var(--color-lima)]"
        >
          Entrar <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  if (estado && "ok" in estado) {
    return (
      <div role="status" className="relative flex flex-col gap-3 bg-tinta p-7 text-papel">
        <span className="absolute -top-3 right-5 -rotate-3 bg-lima px-3 py-1 font-display text-lg uppercase text-tinta">
          Pendiente
        </span>
        <span className="font-display text-3xl uppercase leading-none">Solicitud enviada</span>
        <span className="text-sm leading-relaxed text-gris-claro">
          {titulo}
          {esUnico ? " · queda bloqueado 48 h mientras el tatuador responde." : "."} Te avisaremos
          por email.
        </span>
      </div>
    );
  }

  return (
    <form action={accion} noValidate className="flex flex-col gap-6 border-t-2 border-carbon pt-6">
      <input type="hidden" name="flash_id" value={flashId} />
      <input type="hidden" name="zona" value={zona ?? ""} />
      <input type="hidden" name="fecha" value={huecoElegido?.fecha ?? ""} />
      <input type="hidden" name="hora_inicio" value={huecoElegido?.horaInicio ?? ""} />
      <input type="hidden" name="hora_fin" value={huecoElegido?.horaFin ?? ""} />

      {esUnico && (
        <p className="text-xs leading-relaxed text-[#444]">
          Flash único: al enviar la solicitud queda bloqueado 48 h para ti. Si el tatuador no
          responde, vuelve a estar disponible.
        </p>
      )}

      <fieldset className="flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-1 text-[11px] font-semibold uppercase tracking-widest">
          01 — Zona del cuerpo
        </legend>
        <div className="flex flex-wrap gap-2">
          {ZONAS.map((z) => {
            const activo = zona === z;
            return (
              <button
                key={z}
                type="button"
                aria-pressed={activo}
                onClick={() => setZona(z)}
                className={`border-2 border-carbon px-4 py-3 font-mono text-[13px] font-semibold ${
                  activo ? "bg-carbon text-papel" : "bg-transparent text-carbon"
                }`}
              >
                {z.toUpperCase()}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-1 text-[11px] font-semibold uppercase tracking-widest">
          02 — Hueco en su agenda
        </legend>
        {huecos.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
            {huecos.map((h) => {
              const activo =
                huecoElegido?.fecha === h.fecha &&
                huecoElegido?.horaInicio === h.horaInicio &&
                huecoElegido?.horaFin === h.horaFin;
              return (
                <button
                  key={`${h.fecha}-${h.horaInicio}`}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => setHuecoElegido(h)}
                  className={`flex flex-col gap-0.5 border-2 border-carbon px-3 py-3 text-left font-mono text-[13px] ${
                    activo ? "bg-lima text-carbon" : "bg-papel-claro text-carbon"
                  }`}
                >
                  <span className="font-semibold">{h.diaLabel}</span>
                  <span>
                    {h.horaInicio}–{h.horaFin}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#444]">
            El tatuador todavía no ha configurado su horario. No hay huecos para reservar por
            ahora.
          </p>
        )}
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="nota" className="text-[11px] font-semibold uppercase tracking-widest">
          03 — Nota para el tatuador (opcional)
        </label>
        <textarea
          id="nota"
          name="nota"
          rows={3}
          placeholder="Es mi primer tatuaje, ¿podría ir un poco más pequeño?"
          className="border-0 border-b-2 border-carbon bg-transparent py-2 font-mono text-[14px] text-carbon outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lima"
        />
      </div>

      {estado && "error" in estado && (
        <p role="alert" className="text-sm text-[#b3221c]">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={!zona || !huecoElegido || enviando}
        className="font-display flex items-center justify-between border-2 border-carbon bg-carbon px-5 py-4 text-2xl uppercase text-papel shadow-[6px_6px_0_var(--color-lima)] transition-transform hover:-translate-y-0.5 disabled:opacity-40"
      >
        <span>{enviando ? "Enviando…" : "Enviar solicitud"}</span>
        <span aria-hidden="true">→</span>
      </button>
      <span className="text-xs text-[#444]">
        {zona && huecoElegido ? "Revisa tus datos y envía." : "Elige zona y hueco para continuar."}
      </span>
    </form>
  );
}
