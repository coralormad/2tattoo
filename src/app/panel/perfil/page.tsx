import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/marca/Header";
import { FormularioPerfil } from "@/components/panel/FormularioPerfil";

export default async function PerfilPanel() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, usuario, bio, ciudad, estilos")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "tatuador") redirect("/");

  return (
    <>
      <Header />

      <section className="reticula px-4 pb-18 pt-10 sm:px-10">
        <Link href="/panel" className="text-[11px] font-semibold tracking-widest text-gris">
          ← Volver al panel
        </Link>

        <h1 className="font-display mt-5 text-[clamp(2.5rem,7vw,5rem)] uppercase leading-[0.9]">
          Tu <span className="text-lima">perfil</span>.
        </h1>

        <div className="mt-10">
          <FormularioPerfil
            usuario={perfil.usuario}
            bio={perfil.bio}
            ciudad={perfil.ciudad}
            estilos={perfil.estilos}
          />
        </div>
      </section>
    </>
  );
}
