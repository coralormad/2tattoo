import type { SVGProps } from "react";

const TRAZO_2 =
  "M52 74 C 49 52, 60 30, 84 19 C 102 11, 128 12, 146 24 C 163 36, 170 56, 165 76 C 160 98, 142 112, 124 128 C 112 139, 100 148, 92 156 C 116 154, 148 156, 176 153 C 186 156, 192 168, 190 178 C 188 188, 178 193, 164 194 C 130 192, 80 197, 39 195 C 36 184, 37 172, 41 164 C 62 146, 86 127, 105 109 C 120 95, 131 84, 130 70 C 129 56, 119 47, 106 47 C 92 47, 84 57, 84 72 C 73 75, 62 76, 52 74 Z";

const GOTA =
  "M181 202 C 181 218, 195 226, 195 240 C 195 252, 188 258, 180 258 C 172 258, 165 252, 165 240 C 165 226, 179 218, 181 202 Z";

type SimboloProps = SVGProps<SVGSVGElement> & {
  /** Pizcas de pintura alrededor (desactivar en tamaños pequeños) */
  pizcas?: boolean;
  /** Título accesible */
  titulo?: string;
};

export function Simbolo({
  pizcas = true,
  titulo = "2Tattoo",
  ...props
}: SimboloProps) {
  return (
    <svg
      viewBox="0 0 240 270"
      fill="currentColor"
      role="img"
      aria-label={titulo}
      {...props}
    >
      <path d={TRAZO_2} />
      <path d={GOTA} />
      {pizcas && (
        <g>
          <circle cx="28" cy="58" r="4" />
          <circle cx="198" cy="40" r="3" />
          <ellipse cx="212" cy="120" rx="5" ry="3.5" className="text-lima" fill="currentColor" />
          <circle cx="22" cy="214" r="3" />
          <circle cx="146" cy="232" r="4.5" className="text-lima" fill="currentColor" />
          <circle cx="60" cy="236" r="2.5" />
        </g>
      )}
    </svg>
  );
}

type LogoProps = {
  className?: string;
  pizcas?: boolean;
};

/** Símbolo + palabra "2Tattoo" */
export function Logo({ className = "", pizcas = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Simbolo pizcas={pizcas} className="h-[1.6em] w-auto" titulo="" aria-hidden />
      <span className="font-display uppercase tracking-wide leading-none">
        2Tattoo
      </span>
    </span>
  );
}
