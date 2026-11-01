/**
 * Flecha de "trazo de tinta": línea orgánica que engorda hacia la punta y gota en la cola.
 * Para que se desplace al hacer hover, el elemento padre necesita la clase `group/flecha`.
 */
export function FlechaTinta({ dir = 1, tam = 20 }: { dir?: -1 | 1; tam?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={tam}
      height={tam}
      aria-hidden="true"
      className={`shrink-0 transition-transform ${
        dir === 1 ? "group-hover/flecha:translate-x-0.5" : "-scale-x-100 group-hover/flecha:-translate-x-0.5"
      }`}
    >
      <path d="M3.5 12.6c3.2-.9 7.4-1.3 12.6-.9l-.2 1.5c-4.9-.2-8.9.2-12 .9z" fill="currentColor" />
      <path
        d="M12.8 6.2c2.6 1.9 5 3.8 7.4 5.9-2.3 2-4.7 3.9-7.3 5.7l-.9-1.1c2.1-1.6 4.1-3.1 6-4.6-1.9-1.6-3.9-3.1-6-4.7z"
        fill="currentColor"
      />
      <circle cx="3" cy="13.3" r="1.1" fill="currentColor" />
    </svg>
  );
}
