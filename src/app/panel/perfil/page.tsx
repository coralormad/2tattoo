import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/marca/Header";
import { FlechaTinta } from "@/components/marca/FlechaTinta";
import { Revelar } from "@/components/efectos/Revelar";
import { FormularioPerfil } from "@/components/panel/FormularioPerfil";
import { Pista, BotonAyuda } from "@/components/panel/Ayuda";

export default async function PerfilPanel() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, nombre, usuario, bio, ciudad, estilos")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "tatuador") redirect("/");

  return (
    <>
      <Header />

      <section className="reticula px-4 pb-18 pt-10 sm:px-10">
        <Link
          href="/panel"
          className="group/flecha inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-gris no-underline hover:text-lima"
        >
          <FlechaTinta dir={-1} tam={16} /> Volver al panel
        </Link>

        <div className="mt-5 flex items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] uppercase leading-[0.9]">
            Tu <span className="text-lima">perfil</span>.
          </h1>
          <BotonAyuda pagina="perfil" />
        </div>

        <Pista pagina="perfil">
          Lo que escribas aquí se ve a la derecha tal como lo verán tus clientes. El usuario es tu URL
          pública: elígelo corto y fácil de recordar.
        </Pista>

        <Revelar className="mt-10">
          <FormularioPerfil
            nombre={perfil.nombre}
            usuario={perfil.usuario}
            bio={perfil.bio}
            ciudad={perfil.ciudad}
            estilos={perfil.estilos}
          />
        </Revelar>
      </section>
    </>
  );
}
