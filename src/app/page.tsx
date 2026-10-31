import Link from "next/link";
import { Header } from "@/components/marca/Header";
import { OlaInk } from "@/components/marca/OlaInk";
import { TituloEntrada } from "@/components/marca/TituloEntrada";
import { Revelar } from "@/components/efectos/Revelar";
import { TarjetaFlash } from "@/components/marca/TarjetaFlash";
import { TarjetaIdea } from "@/components/marca/TarjetaIdea";
import { TarjetaArtista } from "@/components/marca/TarjetaArtista";
import { obtenerDatosHome } from "@/lib/datos-home";

export default async function Home() {
  const { flashes, ideas, artistas } = await obtenerDatosHome();

  return (
    <>
      <Header />

      <section className="reticula relative px-4 pb-18 pt-10 sm:px-10">
        <div className="flex flex-wrap justify-between gap-2 text-[11px] tracking-widest text-gris">
          <span>COL 01</span>
          <span>HOJA Nº 001 — ESPAÑA</span>
          <span>COL 12</span>
        </div>

        <TituloEntrada
          className="mt-5 text-[clamp(2.75rem,10.5vw,10rem)]"
          lineas={[
            { texto: "Lo que está", sangria: "4%" },
            { texto: "por", sangria: "40%" },
            { texto: <span className="text-lima">tatuar.</span>, sangria: "18%" },
          ]}
        />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <p className="max-w-md text-sm leading-relaxed text-gris-claro">
            Flash disponible para reservar, ideas que buscan lienzo y el
            trabajo de quien te va a tatuar. Conoce a la persona antes de la
            aguja.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/flash"
              className="bg-lima px-6 py-4 text-sm font-semibold tracking-widest text-tinta no-underline"
            >
              EXPLORAR FLASH →
            </Link>
            <Link
              href="/registro"
              className="border border-papel px-6 py-4 text-sm font-semibold tracking-widest text-papel no-underline"
            >
              TATÚO · ABRIR MI HOJA
            </Link>
          </div>
        </div>
      </section>

      <OlaInk />

      <section className="bg-papel px-4 pb-16 pt-6 text-carbon sm:px-10">
        <Revelar>
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] uppercase">
              Flash disponible
            </h2>
            <Link href="/flash" className="text-xs font-semibold tracking-widest text-carbon">
              VER TODA LA HOJA →
            </Link>
          </div>
        </Revelar>
        <Revelar retraso={0.1}>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] border-l-2 border-t-2 border-carbon">
            {flashes.map((flash) => (
              <TarjetaFlash key={flash.numero} flash={flash} />
            ))}
          </div>
        </Revelar>
      </section>

      <section id="ideas" className="reticula px-4 py-16 sm:px-10">
        <Revelar>
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] uppercase">
              Busco <span className="text-lima">lienzo</span>
            </h2>
            <span className="text-xs tracking-widest text-gris">
              IDEAS QUE LOS ARTISTAS QUIEREN HACER
            </span>
          </div>
        </Revelar>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {ideas.map((idea, i) => (
            <Revelar key={idea.titulo} retraso={i * 0.08}>
              <TarjetaIdea idea={idea} />
            </Revelar>
          ))}
        </div>
      </section>

      <section className="bg-papel px-4 py-16 text-carbon sm:px-10">
        <Revelar>
          <h2 className="mb-6 font-display text-[clamp(2.25rem,4vw,3.5rem)] uppercase">
            Cada tatuaje tiene una historia
          </h2>
        </Revelar>
        <Revelar retraso={0.1}>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] border-2 border-carbon">
            <div className="flex flex-col gap-2.5 border-r-2 border-carbon p-6">
              <span className="text-[11px] font-semibold tracking-widest">Nº 01 — IDEA</span>
              <span className="font-display text-2xl uppercase">El artista la imagina</span>
              <span className="text-sm leading-relaxed">
                Publica lo que quiere tatuar y busca a la persona que lo lleve.
              </span>
            </div>
            <div className="flex flex-col gap-2.5 border-r-2 border-carbon p-6 max-[720px]:border-r-0">
              <span className="text-[11px] font-semibold tracking-widest">Nº 02 — FLASH</span>
              <span className="font-display text-2xl uppercase">Tú lo reservas</span>
              <span className="text-sm leading-relaxed">
                Eliges diseño, zona y hueco en su agenda. Sin mensajes perdidos.
              </span>
            </div>
            <div className="flex flex-col gap-2.5 bg-tinta p-6 text-papel">
              <span className="text-[11px] font-semibold tracking-widest text-lima">
                Nº 03 — TATUADO
              </span>
              <span className="font-display text-2xl uppercase">Pasa a la piel</span>
              <span className="text-sm leading-relaxed text-gris-claro">
                Y al portfolio del artista, con la historia completa.
              </span>
            </div>
          </div>
        </Revelar>
      </section>

      <section className="px-4 py-16 sm:px-10">
        <Revelar>
          <h2 className="mb-6 font-display text-[clamp(2.25rem,4vw,3.5rem)] uppercase">
            Artistas
          </h2>
        </Revelar>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {artistas.map((artista, i) => (
            <Revelar key={artista.nombre} retraso={i * 0.08}>
              <TarjetaArtista artista={artista} />
            </Revelar>
          ))}
        </div>
      </section>

      <footer className="flex flex-col gap-8 border-t border-linea px-4 py-12 sm:px-10">
        <Revelar>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <span className="font-display text-[clamp(2.5rem,7vw,6.5rem)] uppercase leading-[0.9]">
              ¿Tatúas?
              <br />
              <span className="text-lima">Abre tu hoja.</span>
            </span>
            <Link
              href="/registro"
              className="bg-lima px-6 py-4 text-sm font-semibold tracking-widest text-tinta no-underline"
            >
              CREAR PERFIL DE ARTISTA →
            </Link>
          </div>
        </Revelar>
        <div className="flex flex-wrap justify-between gap-3 text-[11px] tracking-widest text-gris">
          <span>2TATTOO · LO QUE ESTÁ POR TATUAR</span>
          <span>AVISO LEGAL · PRIVACIDAD · CONTACTO</span>
        </div>
      </footer>
    </>
  );
}
