// Página TEMPORAL de verificación de marca — se sustituirá por el Home real.
import { Logo, Simbolo } from "@/components/marca/Logo";

const colores = [
  ["tinta", "bg-tinta", "#0B0B0B"],
  ["carbon", "bg-carbon", "#111111"],
  ["linea", "bg-linea", "#2A2A2A"],
  ["papel", "bg-papel", "#F3EEE4"],
  ["papel-claro", "bg-papel-claro", "#FFFDF8"],
  ["piedra", "bg-piedra", "#E3DCCD"],
  ["gris", "bg-gris", "#8C8C8C"],
  ["gris-claro", "bg-gris-claro", "#CFCAC0"],
  ["lima", "bg-lima", "#D4FF3A"],
] as const;

export default function Home() {
  return (
    <main className="reticula flex-1 px-6 py-10 md:px-16">
      <header className="flex items-center justify-between border-b border-linea pb-6">
        <Logo className="text-2xl" />
        <span className="text-xs uppercase tracking-widest text-gris">
          [ 00 — prueba de marca ]
        </span>
      </header>

      <section className="grid gap-12 py-16 md:grid-cols-[1fr_auto] md:items-center">
        <h1 className="font-display uppercase leading-[0.9] text-[clamp(3.5rem,11vw,9rem)]">
          <span className="block">Lo que está</span>
          <span className="block pl-[12%] text-lima">por</span>
          <span className="block pl-[4%]">tatuar.</span>
        </h1>
        <Simbolo className="h-56 w-auto text-papel md:h-72" />
      </section>

      <section className="border-t border-linea py-10">
        <p className="mb-6 text-xs uppercase tracking-widest text-gris">
          [ 01 — paleta ]
        </p>
        <ul className="grid grid-cols-3 gap-3 md:grid-cols-9">
          {colores.map(([nombre, clase, hex]) => (
            <li key={nombre} className="text-xs">
              <div className={`${clase} mb-2 h-16 border border-linea`} />
              <p>{nombre}</p>
              <p className="text-gris">{hex}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-linea py-10">
        <a
          href="#"
          className="inline-block bg-lima px-6 py-3 text-sm font-bold uppercase tracking-widest text-tinta transition-transform hover:-translate-y-0.5"
        >
          Reservar flash →
        </a>
      </section>
    </main>
  );
}
