"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";

const TRAZO_BORDE =
  "M120 0 L62 0 C 30 60, 92 112, 52 172 C 12 240, 82 302, 46 382 C 16 452, 96 522, 56 602 C 20 682, 86 742, 50 822 C 36 862, 72 882, 62 900 L120 900 Z";

const letra = {
  oculto: { y: 28, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: 0.12 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

type PanelAccesoProps = {
  numero: string;
  lugar: string;
  lineas: [string, ReactNode, string];
  volverA?: string;
};

/** Panel oscuro del login/registro: titular escalonado + borde de tinta. */
export function PanelAcceso({ numero, lugar, lineas, volverA }: PanelAccesoProps) {
  const reducir = useReducedMotion();

  return (
    <div className="reticula relative flex h-full flex-col justify-between overflow-hidden bg-tinta px-6 py-6 text-papel sm:px-10 sm:py-8">
      <div className="flex justify-between text-[11px] uppercase tracking-widest text-gris">
        {volverA ? (
          <Link href={volverA} className="text-papel no-underline hover:text-lima">
            ← Volver
          </Link>
        ) : (
          <span />
        )}
        <span>Nº {numero} — {lugar}</span>
      </div>

      <h1 className="font-display pointer-events-none select-none text-[clamp(3.5rem,13vw,10rem)] uppercase leading-[0.86]">
        {lineas.map((linea, i) => (
          <motion.span
            key={i}
            custom={i}
            initial={reducir ? undefined : "oculto"}
            animate={reducir ? undefined : "visible"}
            variants={letra}
            className="block"
            style={i === 0 ? {} : { paddingLeft: `${i * 18}%` }}
          >
            {linea}
          </motion.span>
        ))}
      </h1>

      <div className="flex justify-between text-[11px] uppercase tracking-widest text-gris">
        <span>Grid · 8 columnas</span>
        <span className="hidden sm:inline">Lo que está por tatuar</span>
      </div>

      <svg
        viewBox="0 0 120 900"
        aria-hidden="true"
        className="pointer-events-none absolute -right-px top-0 hidden h-full w-[80px] text-papel md:block"
      >
        <motion.path
          d={TRAZO_BORDE}
          fill="currentColor"
          initial={reducir ? undefined : { opacity: 0 }}
          animate={reducir ? undefined : { opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </svg>
    </div>
  );
}
