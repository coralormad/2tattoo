import Link from "next/link";

export type Artista = {
  nombre: string;
  ciudad: string;
  estilos: string;
};

export function TarjetaArtista({ artista }: { artista: Artista }) {
  return (
    <Link href="/artistas" className="flex flex-col gap-3 text-papel no-underline">
      <div
        role="img"
        aria-label="Retrato del artista"
        className="flex h-[300px] items-end border border-linea bg-[#1C1C1C] p-3.5 text-[11px] tracking-widest text-gris"
      >
        [RETRATO B/N]
      </div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-2xl uppercase">{artista.nombre}</span>
        <span className="text-xs text-gris">{artista.ciudad}</span>
      </div>
      <span className="text-xs text-gris-claro">{artista.estilos}</span>
    </Link>
  );
}
