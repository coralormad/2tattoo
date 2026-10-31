"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { PanelAcceso } from "./PanelAcceso";

type AccesoLayoutProps = {
  numero: string;
  lugar: string;
  lineas: [string, ReactNode, string];
  volverA?: string;
  children: ReactNode;
};

/**
 * Estructura común de login/registro: panel de marca + ficha en papel.
 * En móvil el panel queda fijo arriba (sticky) y la ficha entra por
 * encima al hacer scroll; en escritorio es un split-screen a pantalla
 * completa con un leve parallax en el borde de tinta.
 */
export function AccesoLayout({ numero, lugar, lineas, volverA, children }: AccesoLayoutProps) {
  const reducir = useReducedMotion();
  const contenedor = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: contenedor, offset: ["start start", "end end"] });
  const parallax = useTransform(scrollYProgress, [0, 1], reducir ? [0, 0] : [0, 60]);

  return (
    <div ref={contenedor} className="flex min-h-dvh flex-col md:h-dvh md:flex-row md:overflow-hidden">
      <motion.div
        style={{ y: parallax }}
        className="sticky top-0 z-10 h-[45dvh] shrink-0 md:static md:h-full md:w-[56%] md:will-change-auto"
      >
        <PanelAcceso numero={numero} lugar={lugar} lineas={lineas} volverA={volverA} />
      </motion.div>

      <div className="relative z-20 flex-1 -mt-6 rounded-t-3xl bg-papel shadow-[0_-24px_48px_rgba(11,11,11,0.35)] md:mt-0 md:rounded-none md:shadow-none md:overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-7 px-6 py-10 sm:px-10 md:py-12">
          {children}
        </div>
      </div>
    </div>
  );
}
