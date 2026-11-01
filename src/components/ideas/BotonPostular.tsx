"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { postularIdea } from "@/app/ideas/actions";
import type { RolVisitante } from "@/lib/postulaciones";

type BotonPostularProps = {
  ideaId?: string;
  titulo: string;
  rol: RolVisitante;
  yaPostulada: boolean;
  className: string;
};

/** ME POSTULO: login si no hay sesión, modal con mensaje si eres cliente, nada si eres tatuador. */
export function BotonPostular({ ideaId, titulo, rol, yaPostulada, className }: BotonPostularProps) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [estado, accion, enviando] = useActionState(postularIdea, null);
  const enviada = yaPostulada || (estado !== null && "ok" in estado);

  useEffect(() => {
    if (estado && "ok" in estado) dialogo.current?.close();
  }, [estado]);

  if (rol === "tatuador") return null;

  if (rol === "anonimo") {
    return (
      <Link href="/login" className={className}>
        ME POSTULO →
      </Link>
    );
  }

  if (!ideaId) {
    return (
      <span className={`${className} opacity-50`} title="Idea de ejemplo">
        EJEMPLO
      </span>
    );
  }

  if (enviada) {
    return <span className={className}>✓ POSTULADA</span>;
  }

  return (
    <>
      <button type="button" onClick={() => dialogo.current?.showModal()} className={className}>
        ME POSTULO →
      </button>

      <dialog
        ref={dialogo}
        aria-labelledby={`postular-${ideaId}`}
        className="m-auto w-[min(92vw,520px)] border-2 border-carbon bg-papel p-0 text-carbon shadow-[8px_8px_0_var(--color-lima)] backdrop:bg-tinta/70"
      >
        <form action={accion} noValidate className="flex flex-col gap-5 p-6">
          <input type="hidden" name="idea_id" value={ideaId} />

          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest">
                Idea · busco lienzo
              </span>
              <h3
                id={`postular-${ideaId}`}
                className="font-display text-3xl uppercase leading-none"
              >
                {titulo}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => dialogo.current?.close()}
              aria-label="Cerrar"
              className="font-mono text-lg font-semibold"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor={`mensaje-${ideaId}`}
              className="text-[11px] font-semibold uppercase tracking-widest"
            >
              01 — Cuéntale por qué tú
            </label>
            <textarea
              id={`mensaje-${ideaId}`}
              name="mensaje"
              rows={4}
              minLength={10}
              maxLength={1000}
              required
              placeholder="Zona que tienes libre, tamaño aproximado, disponibilidad…"
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
            disabled={enviando}
            className="font-display flex items-center justify-between border-2 border-carbon bg-carbon px-5 py-4 text-2xl uppercase text-papel disabled:opacity-40"
          >
            <span>{enviando ? "Enviando…" : "Enviar postulación"}</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>
      </dialog>
    </>
  );
}
