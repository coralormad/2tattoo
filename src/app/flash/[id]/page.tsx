import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/marca/Header";
import { IconoFlash } from "@/components/marca/IconoFlash";
import { SolicitudFlash } from "@/components/flash/SolicitudFlash";
import { obtenerHuecosDisponibles } from "@/lib/disponibilidad";

export default async function FichaFlash({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: flash }, { data: sesion }] = await Promise.all([
    supabase
      .from("flashes")
      .select(
        "id, titulo, tipo, icono, medida_cm, precio_desde, ciudad, estado, tatuador_id, duracion_min, perfiles(usuario, nombre)",
      )
      .eq("id", id)
      .single(),
    supabase.auth.getUser(),
  ]);

  if (!flash) notFound();

  const huecos = await obtenerHuecosDisponibles(supabase, flash.tatuador_id, flash.duracion_min);

  const perfilArtista = Array.isArray(flash.perfiles) ? flash.perfiles[0] : flash.perfiles;
  const nombreArtista = perfilArtista?.usuario
    ? `@${perfilArtista.usuario}`
    : (perfilArtista?.nombre ?? "Artista");
  const esUnico = flash.tipo === "flash_unico";
  const disponible = flash.estado === "disponible";

  return (
    <>
      <Header />

      <div className="flex flex-wrap bg-papel text-carbon">
        <section className="flex flex-1 flex-col gap-4 border-b-2 border-carbon p-6 sm:p-10 md:min-w-[380px] md:max-w-[480px] md:border-b-0 md:border-r-2">
          <span className="text-xs font-semibold tracking-widest text-[#444]">
            HOJA DE {nombreArtista.toUpperCase()}
          </span>
          <div className="flex flex-col border-2 border-carbon bg-papel-claro">
            <div className="flex justify-between border-b border-dashed border-carbon px-3.5 py-2.5 text-xs font-semibold">
              <span>Nº {flash.id.slice(0, 4).toUpperCase()}</span>
              <span>{esUnico ? "FLASH ÚNICO" : "FLASH"}</span>
            </div>
            <div className="flex h-[300px] items-center justify-center">
              <IconoFlash tipo={flash.icono} className="h-56 w-56" />
            </div>
          </div>
          {esUnico && (
            <p className="text-xs leading-relaxed text-[#444]">
              Flash único: al enviar la solicitud queda bloqueado 48 h para ti. Si el tatuador no
              responde, vuelve a estar disponible.
            </p>
          )}
        </section>

        <section className="flex flex-[999] flex-col gap-6 p-6 sm:p-10 md:min-w-[400px]">
          <div>
            <h1 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] uppercase leading-[0.9]">
              {flash.titulo}
            </h1>
            <div className="mt-4 grid grid-cols-2 border-t-2 border-carbon text-[13px]">
              <div className="border-b border-dashed border-carbon py-2.5">TAMAÑO</div>
              <div className="border-b border-dashed border-carbon py-2.5 font-semibold">
                {flash.medida_cm ? `${flash.medida_cm} cm` : "—"}
              </div>
              <div className="border-b border-dashed border-carbon py-2.5">PRECIO</div>
              <div className="border-b border-dashed border-carbon py-2.5 font-semibold">
                {flash.precio_desde ? `desde ${flash.precio_desde} €` : "A consultar"}
              </div>
              <div className="border-b border-dashed border-carbon py-2.5">SEÑAL</div>
              <div className="border-b border-dashed border-carbon py-2.5 font-semibold">
                Se acuerda con el tatuador
              </div>
            </div>
          </div>

          {disponible ? (
            <SolicitudFlash
              flashId={flash.id}
              titulo={flash.titulo}
              esUnico={esUnico}
              haySesion={!!sesion.user}
              huecos={huecos}
            />
          ) : (
            <p className="border-t-2 border-carbon pt-6 text-sm text-[#444]">
              Este flash ya no está disponible.
            </p>
          )}

          <Link href="/" className="text-xs font-semibold tracking-widest">
            ← Volver al Home
          </Link>
        </section>
      </div>
    </>
  );
}
