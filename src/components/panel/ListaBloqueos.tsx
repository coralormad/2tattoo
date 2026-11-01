import { eliminarBloqueo } from "@/app/panel/agenda/actions";

export type Bloqueo = {
  id: string;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  motivo: string | null;
};

const ESCALA_INI = 8 * 60;
const ESCALA_FIN = 22 * 60;
const RAYAS = "bg-[repeating-linear-gradient(135deg,#b3221c55_0_5px,transparent_5px_10px)]";
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

const aMin = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return (a || 0) * 60 + (b || 0);
};
const pct = (m: number) =>
  ((Math.min(Math.max(m, ESCALA_INI), ESCALA_FIN) - ESCALA_INI) / (ESCALA_FIN - ESCALA_INI)) * 100;

export function ListaBloqueos({ bloqueos }: { bloqueos: Bloqueo[] }) {
  if (bloqueos.length === 0) {
    return (
      <div className="grid min-h-[220px] place-items-center border-2 border-dashed border-carbon/30 bg-papel-claro/60 p-8 text-center text-carbon">
        <div>
          <span className="font-display block text-3xl uppercase leading-none">Sin bloqueos</span>
          <span className="mt-2 block font-mono text-[11px] uppercase tracking-widest text-[#666]">
            Tu agenda está abierta
          </span>
        </div>
      </div>
    );
  }

  // Agrupar por mes (AAAA-MM), respetando el orden por fecha que ya trae la consulta.
  const grupos = new Map<string, Bloqueo[]>();
  for (const b of bloqueos) {
    const clave = b.fecha.slice(0, 7);
    grupos.set(clave, [...(grupos.get(clave) ?? []), b]);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...grupos.entries()].map(([clave, lista]) => {
        const [anio, mes] = clave.split("-").map(Number);
        return (
          <section key={clave} className="flex flex-col gap-3">
            <h3 className="flex items-baseline gap-2 border-b border-dashed border-carbon/40 pb-1 text-carbon">
              <span className="font-display text-xl uppercase leading-none">{MESES[mes - 1]}</span>
              <span className="font-mono text-[11px] tracking-widest text-[#666]">{anio}</span>
            </h3>

            {lista.map((b) => {
              const d = new Date(`${b.fecha}T00:00:00`);
              const entero = !b.hora_inicio || !b.hora_fin;
              const izq = entero ? 0 : pct(aMin(b.hora_inicio!));
              const ancho = entero ? 100 : Math.max(pct(aMin(b.hora_fin!)) - izq, 0);
              const franja = entero ? "Día entero" : `${b.hora_inicio!.slice(0, 5)}–${b.hora_fin!.slice(0, 5)}`;

              return (
                <article
                  key={b.id}
                  className="group flex border-2 border-carbon bg-papel-claro text-carbon transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-lima)]"
                >
                  {/* Talón */}
                  <div className="flex w-16 shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-carbon py-3">
                    <span className="font-display text-3xl leading-none">{d.getDate()}</span>
                    <span className="mt-1 font-mono text-[10px] tracking-widest text-[#666]">{DIAS[d.getDay()]}</span>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-mono text-[13px] font-semibold uppercase">
                        {franja}
                        {b.motivo && <span className="font-normal normal-case text-[#666]"> · {b.motivo}</span>}
                      </span>
                      <form action={eliminarBloqueo}>
                        <input type="hidden" name="id" value={b.id} />
                        <button
                          type="submit"
                          aria-label={`Quitar bloqueo del ${d.getDate()} de ${MESES[mes - 1].toLowerCase()}`}
                          title="Quitar bloqueo"
                          className="grid h-7 w-7 place-items-center rounded-full border-2 border-carbon text-sm font-bold transition-all hover:border-[#b3221c] hover:bg-[#b3221c] hover:text-papel focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </form>
                    </div>
                    <div className="relative h-2.5 overflow-hidden rounded-full bg-carbon/10" aria-hidden="true">
                      <div
                        className={`absolute inset-y-0 rounded-full ring-1 ring-[#b3221c] ${RAYAS}`}
                        style={{ left: `${izq}%`, width: `${ancho}%` }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
