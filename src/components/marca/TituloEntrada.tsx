"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const letra = {
  oculto: { y: 32, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: 0.1 * i, duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

type TituloEntradaProps = {
  lineas: { texto: ReactNode; sangria?: string }[];
  className?: string;
};

/** Titular grande que entra escalonado al cargar la página (hero). */
export function TituloEntrada({ lineas, className = "" }: TituloEntradaProps) {
  const reducir = useReducedMotion();

  return (
    <h1 className={`font-display uppercase leading-[0.9] ${className}`}>
      {lineas.map((linea, i) => (
        <motion.span
          key={i}
          custom={i}
          initial={reducir ? undefined : "oculto"}
          animate={reducir ? undefined : "visible"}
          variants={letra}
          className="block"
          style={linea.sangria ? { paddingLeft: linea.sangria } : undefined}
        >
          {linea.texto}
        </motion.span>
      ))}
    </h1>
  );
}
