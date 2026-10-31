import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/marca/Header";
import { FormularioFlash } from "@/components/panel/FormularioFlash";
import { FormularioIdea } from "@/components/panel/FormularioIdea";

export default async function Panel() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, nombre, usuario")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "tatuador") redirect("/");

  return (
    <>
      <Header />

      <section className="reticula px-4 pb-18 pt-10 sm:px-10">
        <div className="flex flex-wrap justify-between gap-2 text-[11px] tracking-widest text-gris">
          <span>PANEL</span>
          <span>HOJA Nº 002 — {perfil.nombre ?? "TATUADOR"}</span>
        </div>

        <h1 className="font-display mt-5 text-[clamp(2.5rem,8vw,6rem)] uppercase leading-[0.9]">
          Tu <span className="text-lima">hoja</span> de trabajo.
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-gris-claro">
          Publica un flash reservable o lanza una idea para que un cliente se
          postule. Aparecerán en el Home en cuanto se guarden.
        </p>

        {perfil.usuario ? (
          <Link
            href={`/artista/${perfil.usuario}`}
            className="mt-4 inline-block w-fit text-xs font-semibold tracking-widest text-lima no-underline"
          >
            VER MI PERFIL PÚBLICO →
          </Link>
        ) : (
          <Link
            href="/panel/perfil"
            className="mt-4 inline-block w-fit text-xs font-semibold tracking-widest text-lima no-underline"
          >
            COMPLETA TU PERFIL PÚBLICO →
          </Link>
        )}

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <FormularioFlash />
          <FormularioIdea />
        </div>
      </section>
    </>
  );
}
