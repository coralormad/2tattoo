type OlaInkProps = {
  color?: string;
  className?: string;
};

/** Divisor ondulado de tinta entre secciones, del diseño aprobado. */
export function OlaInk({ color = "var(--color-papel)", className = "" }: OlaInkProps) {
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      width="100%"
      height="70"
      aria-hidden="true"
      className={`block -mb-px ${className}`}
    >
      <path
        d="M0 90 L0 60 C 60 30, 110 85, 170 52 C 230 18, 262 74, 330 48 C 420 14, 470 82, 560 44 C 640 10, 700 64, 780 40 C 860 16, 930 78, 1010 50 C 1090 22, 1150 70, 1230 36 C 1300 8, 1370 54, 1440 30 L1440 90 Z"
        fill={color}
      />
    </svg>
  );
}
