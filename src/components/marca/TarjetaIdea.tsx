import { BotonPostular } from "@/components/ideas/BotonPostular";
import type { RolVisitante } from "@/lib/postulaciones";

export type Idea = {
  id?: string;
  artista: string;
  titulo: string;
  texto: string;
  zona: string;
};

export function TarjetaIdea({
  idea,
  rol,
  yaPostulada,
}: {
  idea: Idea;
  rol: RolVisitante;
  yaPostulada: boolean;
}) {
  return (
    <article className="flex flex-col gap-3 border border-dashed border-papel p-6">
      <div className="flex justify-between text-[11px] tracking-widest">
        <span className="text-lima">IDEA</span>
        <span className="text-gris">{idea.artista}</span>
      </div>
      <h3 className="font-display text-3xl uppercase leading-none">{idea.titulo}</h3>
      <p className="text-sm leading-relaxed text-gris-claro">{idea.texto}</p>
      <div className="flex items-center justify-between border-t border-linea pt-3 text-xs">
        <span className="text-gris">{idea.zona}</span>
        <BotonPostular
          ideaId={idea.id}
          titulo={idea.titulo}
          rol={rol}
          yaPostulada={yaPostulada}
          className="font-semibold tracking-widest text-lima no-underline"
        />
      </div>
    </article>
  );
}
