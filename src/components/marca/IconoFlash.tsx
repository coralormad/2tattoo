import type { ReactNode } from "react";

export type TipoIconoFlash = "snake" | "dagger" | "moon" | "star";

const iconos: Record<TipoIconoFlash, { viewBox: string; etiqueta: string; path: ReactNode }> = {
  snake: {
    viewBox: "0 0 200 200",
    etiqueta: "Boceto de serpiente",
    path: (
      <>
        <path
          d="M40 165 C 40 120, 165 135, 150 95 C 138 60, 45 82, 60 45 C 68 25, 102 20, 115 35"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="121" cy="40" r="11" fill="currentColor" />
      </>
    ),
  },
  dagger: {
    viewBox: "0 0 200 140",
    etiqueta: "Boceto de daga",
    path: (
      <>
        <path
          d="M100 10 L112 80 L100 96 L88 80 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path d="M70 96 L130 96" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M100 100 L100 128" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      </>
    ),
  },
  moon: {
    viewBox: "0 0 200 200",
    etiqueta: "Boceto de luna",
    path: <path d="M130 30 A 75 75 0 1 0 130 170 A 58 58 0 1 1 130 30 Z" fill="currentColor" />,
  },
  star: {
    viewBox: "0 0 200 200",
    etiqueta: "Boceto de estrella",
    path: (
      <polygon
        points="100,20 120,78 182,78 132,114 150,174 100,138 50,174 68,114 18,78 80,78"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinejoin="round"
      />
    ),
  },
};

export function IconoFlash({ tipo, className = "h-28 w-28" }: { tipo: TipoIconoFlash; className?: string }) {
  const icono = iconos[tipo];
  return (
    <svg viewBox={icono.viewBox} role="img" aria-label={icono.etiqueta} className={className}>
      {icono.path}
    </svg>
  );
}
