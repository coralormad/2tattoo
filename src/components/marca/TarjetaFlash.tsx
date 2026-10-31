import Link from "next/link";
import { IconoFlash, type TipoIconoFlash } from "./IconoFlash";

export type Flash = {
  numero: string;
  tipo: string;
  titulo: string;
  medida: string;
  artista: string;
  ciudad: string;
  icono: TipoIconoFlash;
};

export function TarjetaFlash({ flash }: { flash: Flash }) {
  return (
    <Link
      href="/flash"
      className="flex flex-col border-b-2 border-r-2 border-carbon bg-papel-claro text-carbon no-underline"
    >
      <div className="flex justify-between border-b border-dashed border-carbon px-3 py-2 text-[11px] font-semibold">
        <span>{flash.numero}</span>
        <span>{flash.tipo}</span>
      </div>
      <div className="flex h-[200px] items-center justify-center text-carbon">
        <IconoFlash tipo={flash.icono} />
      </div>
      <div className="flex flex-col gap-1 border-t border-dashed border-carbon p-3">
        <span className="font-display text-2xl uppercase">{flash.titulo}</span>
        <span className="text-xs">{flash.medida} · desde [PRECIO]</span>
        <span className="text-xs text-[#555]">
          {flash.artista} · {flash.ciudad}
        </span>
      </div>
    </Link>
  );
}
