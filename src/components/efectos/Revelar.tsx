"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevelarProps = {
  children: ReactNode;
  retraso?: number;
  className?: string;
};

/**
 * Envuelve una sección y la hace entrar (opacidad + subida sutil) cuando
 * cruza el viewport al hacer scroll, al estilo neuv.fr / landonorris.com.
 * Se anima una sola vez; respeta prefers-reduced-motion.
 */
export function Revelar({ children, retraso = 0, className }: RevelarProps) {
  const reducir = useReducedMotion();

  if (reducir) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.7, delay: retraso, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
