import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/marca/Header";
import { PerfilTabs } from "@/components/perfil/PerfilTabs";

export default async function PerfilArtista({
  params,
}: {
  params: Promise<{ usuario: string }>;
}) {
  const { usuario } = await params;
  const supabase = await createClient();

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("id, nombre, usuario, bio, ciudad, estilos")
    .eq("usuario", usuario)
    .eq("rol", "tatuador")
    .single();

  if (!perfil) notFound();

  const [{ data: flashes }, { data: ideas }] = await Promise.all([
    supabase
      .from("flashes")
      .select("id, titulo, tipo, icono, medida_cm, precio_desde")
      .eq("tatuador_id", perfil.id)
      .eq("estado", "disponible")
      .order("creado_en", { ascending: false }),
    supabase
      .from("ideas")
      .select("id, titulo, texto, zona")
      .eq("tatuador_id", perfil.id)
      .eq("estado", "abierta")
      .order("creado_en", { ascending: false }),
  ]);

  const estilos: string[] = (perfil.estilos ?? "")
    .split(",")
    .map((e: string) => e.trim())
    .filter(Boolean);

  return (
    <>
      <Header />

      <section className="flex flex-wrap border-b border-linea">
        <div
          role="img"
          aria-label="Retrato del tatuador"
          className="flex min-h-[320px] flex-1 items-end bg-[#1C1C1C] p-6 text-[11px] tracking-widest text-gris md:min-h-[480px] md:basis-[380px]"
        >
          [RETRATO B/N]
        </div>

        <div className="reticula flex flex-[999] flex-col gap-5 px-4 py-9 sm:px-10 md:min-w-[400px]">
          <div className="flex flex-wrap justify-between gap-2 text-[11px] tracking-widest text-gris">
            <span>@{perfil.usuario}</span>
            {perfil.ciudad && <span>{perfil.ciudad.toUpperCase()}</span>}
          </div>

          <h1 className="font-display text-[clamp(2.75rem,7vw,7rem)] uppercase leading-[0.88]">
            {perfil.nombre ?? perfil.usuario}
          </h1>

          {perfil.bio && (
            <p className="max-w-xl text-[15px] leading-relaxed text-gris-claro">“{perfil.bio}”</p>
          )}

          {estilos.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs font-semibold tracking-widest">
              {estilos.map((e) => (
                <span key={e} className="border border-papel px-3 py-1.5 uppercase">
                  {e}
                </span>
              ))}
            </div>
          )}

          {flashes && flashes.length > 0 && (
            <a
              href="#contenido"
              className="w-fit bg-lima px-6 py-4 text-sm font-semibold tracking-widest text-tinta no-underline"
            >
              VER SU FLASH →
            </a>
          )}
        </div>
      </section>

      <section id="contenido" className="bg-papel px-4 pb-16 pt-8 text-carbon sm:px-10">
        <PerfilTabs flashes={flashes ?? []} ideas={ideas ?? []} />
      </section>
    </>
  );
}
