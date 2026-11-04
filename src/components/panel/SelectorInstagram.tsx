"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import type { MediaInstagram } from "@/lib/instagram";
import { importarFlashesInstagram, listarMediaInstagramAction } from "@/app/panel/actions";
import { CLASE_BOTON_PRIMARIO } from "@/components/panel/ui";

type ResultadoImportar = { error: string } | { ok: true; importados: number } | null;

async function accionImportar(_previo: ResultadoImportar, formData: FormData): Promise<ResultadoImportar> {
  return importarFlashesInstagram(formData);
}

/** Modal con la grid de fotos del Instagram conectado, para elegir cuáles subir como flashes nuevos. */
export function SelectorInstagram({ onCerrar }: { onCerrar: () => void }) {
  const reducir = useReducedMotion();
  const router = useRouter();
  const [media, setMedia] = useState<MediaInstagram[] | null>(null);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [estado, accion, enviando] = useActionState(accionImportar, null);

  useEffect(() => {
    let activo = true;
    listarMediaInstagramAction().then((datos) => {
      if (activo) setMedia(datos);
    });
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (estado && "ok" in estado) router.refresh();
  }, [estado, router]);

  const alternar = (id: string) => {
    setSeleccion((previa) => {
      const siguiente = new Set(previa);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  };

  const jsonSeleccion = JSON.stringify([...seleccion].map((id) => ({ ig_media_id: id })));

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Importar fotos de Instagram"
      initial={reducir ? undefined : { opacity: 0 }}
      animate={reducir ? undefined : { opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/80 p-4 backdrop-blur-sm"
    >
      <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto border-2 border-carbon bg-papel-claro p-6 text-carbon shadow-[8px_8px_0_var(--color-lima)]">
        <div className="flex items-center justify-between gap-4 border-b-2 border-carbon pb-4">
          <h2 className="font-display text-2xl uppercase">Importar de Instagram</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="font-mono text-[11px] uppercase tracking-widest text-carbon/70 hover:text-carbon"
          >
            Cerrar ✕
          </button>
        </div>

        {media === null && (
          <p className="mt-6 font-mono text-[12px] uppercase tracking-widest text-carbon/60">
            Cargando fotos…
          </p>
        )}

        {media !== null && media.length === 0 && (
          <p className="mt-6 font-mono text-[12px] uppercase tracking-widest text-carbon/60">
            No se encontraron fotos para importar.
          </p>
        )}

        {media !== null && media.length > 0 && (
          <form action={accion} className="mt-6">
            <input type="hidden" name="seleccion" value={jsonSeleccion} />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
              {media.map((m) => {
                const marcada = seleccion.has(m.id);
                return (
                  <label key={m.id} className="relative block cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marcada}
                      onChange={() => alternar(m.id)}
                      className="peer sr-only"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.media_url}
                      alt={m.caption ?? "Foto de Instagram"}
                      className="aspect-square w-full border-2 border-carbon/20 object-cover peer-checked:border-lima"
                    />
                    <span
                      aria-hidden="true"
                      className={`absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-carbon font-mono text-[11px] font-bold ${
                        marcada ? "bg-lima text-tinta" : "bg-papel-claro text-carbon/40"
                      }`}
                    >
                      {marcada ? "✓" : ""}
                    </span>
                  </label>
                );
              })}
            </div>

            {estado && "error" in estado && (
              <p role="alert" className="mt-4 text-sm font-semibold text-[#b3221c]">
                {estado.error}
              </p>
            )}
            {estado && "ok" in estado && (
              <p role="status" className="mt-4 text-sm font-semibold text-lima">
                Importados {estado.importados} flashes.
              </p>
            )}

            <button
              type="submit"
              disabled={enviando || seleccion.size === 0}
              className={`${CLASE_BOTON_PRIMARIO} mt-6 w-full`}
            >
              <span>{enviando ? "Importando…" : `Importar seleccionadas (${seleccion.size})`}</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
