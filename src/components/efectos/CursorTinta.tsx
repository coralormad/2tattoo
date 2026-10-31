"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/** Cursor circular que sigue al ratón. Solo en escritorio con hover real. */
export function CursorTinta() {
  const reducir = useReducedMotion();
  // Se activa tras montar: en servidor no hay "window" para saber si hay
  // hover real, así que el primer render siempre es null (sin cursor) y
  // coincide con el del cliente antes de esta comprobación.
  const [activo, setActivo] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 400, damping: 35, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 400, damping: 35, mass: 0.4 });

  useEffect(() => {
    if (reducir || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con una API del navegador (matchMedia), no hay forma de leerla antes de montar
    setActivo(true);

    const mover = (e: PointerEvent) => {
      x.set(e.clientX - 18);
      y.set(e.clientY - 18);
    };
    window.addEventListener("pointermove", mover);
    return () => window.removeEventListener("pointermove", mover);
  }, [reducir, x, y]);

  if (!activo) return null;

  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-50 h-9 w-9 rounded-full border border-papel mix-blend-difference"
      style={{ x: sx, y: sy }}
    />
  );
}
