/** Icono de persona + contador. Relleno = cita aceptada; contorno = pendiente. */
export function Personas({
  aceptadas,
  pendientes,
  max = 4,
  tam = 14,
}: {
  aceptadas: number;
  pendientes: number;
  max?: number;
  tam?: number;
}) {
  const total = aceptadas + pendientes;
  if (total === 0) return null;
  const iconos = [
    ...Array(Math.min(aceptadas, max)).fill(true),
    ...Array(Math.max(0, Math.min(pendientes, max - Math.min(aceptadas, max)))).fill(false),
  ] as boolean[];
  return (
    <span
      className="inline-flex items-center gap-0.5"
      title={`${aceptadas} confirmada${aceptadas === 1 ? "" : "s"} · ${pendientes} pendiente${pendientes === 1 ? "" : "s"}`}
    >
      {iconos.map((lleno, i) => (
        <svg key={i} viewBox="0 0 16 16" width={tam} height={tam} aria-hidden="true">
          <circle cx="8" cy="5" r="3" fill={lleno ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
          <path d="M2.5 15c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5" fill={lleno ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ))}
      {total > max && <span className="ml-0.5 font-mono text-[10px] font-semibold">+{total - max}</span>}
      <span className="sr-only">{total} personas agendadas</span>
    </span>
  );
}
