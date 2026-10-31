"use client";

import { useState } from "react";
import { IconoFlash, type TipoIconoFlash } from "@/components/marca/IconoFlash";

type FlashResumen = {
  id: string;
  titulo: string;
  tipo: string;
  icono: TipoIconoFlash;
  medida_cm: number | null;
  precio_desde: number | null;
};

type IdeaResumen = {
  id: string;
  titulo: string;
  texto: string | null;
  zona: string | null;
};

type PerfilTabsProps = {
  flashes: FlashResumen[];
  ideas: IdeaResumen[];
};

type Pestaña = "flash" | "ideas" | "tatuado";

/** Pestañas Flash / Ideas / Tatuado del perfil público, a juego con el prototipo aprobado. */
export function PerfilTabs({ flashes, ideas }: PerfilTabsProps) {
  const [tab, setTab] = useState<Pestaña>("flash");

  const pestañas: { id: Pestaña; etiqueta: string }[] = [
    { id: "flash", etiqueta: `FLASH · ${flashes.length}` },
    { id: "ideas", etiqueta: `IDEAS · ${ideas.length}` },
    { id: "tatuado", etiqueta: "TATUADO" },
  ];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Contenido del perfil"
        className="mb-7 flex w-fit flex-wrap border-2 border-carbon"
      >
        {pestañas.map((p, i) => {
          const activo = tab === p.id;
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={activo}
              onClick={() => setTab(p.id)}
              className={`px-5 py-3.5 font-mono text-[13px] font-semibold tracking-widest ${
                i < pestañas.length - 1 ? "border-r-2 border-carbon" : ""
              } ${activo ? "bg-carbon text-papel" : "bg-transparent text-carbon"}`}
            >
              {p.etiqueta}
            </button>
          );
        })}
      </div>

      {tab === "flash" &&
        (flashes.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] border-l-2 border-t-2 border-carbon">
            {flashes.map((f) => (
              <a
                key={f.id}
                href={`/flash/${f.id}`}
                className="flex flex-col border-b-2 border-r-2 border-carbon bg-papel-claro text-carbon no-underline"
              >
                <div className="flex justify-between border-b border-dashed border-carbon px-3 py-2 text-[11px] font-semibold">
                  <span>{f.tipo === "flash_unico" ? "ÚNICO" : "REPETIBLE"}</span>
                </div>
                <div className="flex h-[180px] items-center justify-center">
                  <IconoFlash tipo={f.icono} className="h-24 w-24" />
                </div>
                <div className="flex flex-col gap-1 border-t border-dashed border-carbon p-3">
                  <span className="font-display text-2xl uppercase">{f.titulo}</span>
                  <span className="text-xs">
                    {f.medida_cm ? `${f.medida_cm} cm` : ""} ·{" "}
                    {f.precio_desde ? `desde ${f.precio_desde} €` : "a consultar"}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#555]">Sin flash disponible por ahora.</p>
        ))}

      {tab === "ideas" &&
        (ideas.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {ideas.map((i) => (
              <article
                key={i.id}
                className="flex flex-col gap-3 border-2 border-dashed border-carbon bg-papel-claro p-5"
              >
                <span className="text-[11px] font-semibold tracking-widest">
                  IDEA · BUSCO LIENZO
                </span>
                <h3 className="font-display text-3xl uppercase leading-none">{i.titulo}</h3>
                {i.texto && <p className="text-[13px] leading-relaxed">{i.texto}</p>}
                <div className="flex items-center justify-between border-t border-dashed border-carbon pt-3 text-xs">
                  <span>{i.zona ?? ""}</span>
                  <a
                    href="/login"
                    className="bg-tinta px-3 py-2 font-semibold tracking-widest text-lima no-underline"
                  >
                    ME POSTULO →
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#555]">Sin ideas abiertas por ahora.</p>
        ))}

      {tab === "tatuado" && (
        <p className="text-sm text-[#555]">
          Próximamente: portfolio de tatuajes terminados. Necesita Supabase Storage y una tabla de
          portfolio, todavía pendientes de construir.
        </p>
      )}
    </div>
  );
}
