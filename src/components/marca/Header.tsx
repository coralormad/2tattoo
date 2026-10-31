import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cerrarSesion } from "@/app/auth/actions";
import { Logo } from "./Logo";

const enlaces = [
  { href: "/flash", texto: "FLASH" },
  { href: "#ideas", texto: "IDEAS" },
  { href: "/artistas", texto: "ARTISTAS" },
];

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nombre: string | null = null;
  let esTatuador = false;
  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("nombre, rol")
      .eq("id", user.id)
      .single();
    nombre = perfil?.nombre ?? null;
    esTatuador = perfil?.rol === "tatuador";
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-linea px-4 py-4 sm:px-10">
      <Link href="/" aria-label="2Tattoo, inicio" className="text-papel no-underline">
        <Logo />
      </Link>
      <nav
        aria-label="Principal"
        className="flex flex-wrap items-center gap-4 text-xs tracking-widest sm:gap-8"
      >
        {enlaces.map((e) => (
          <Link key={e.href} href={e.href} className="text-papel no-underline hover:text-lima">
            {e.texto}
          </Link>
        ))}
        {esTatuador && (
          <Link href="/panel" className="text-papel no-underline hover:text-lima">
            PANEL
          </Link>
        )}
        {user ? (
          <form action={cerrarSesion} className="flex items-center gap-4">
            {nombre && <span className="hidden text-gris sm:inline">{nombre}</span>}
            <button
              type="submit"
              className="border border-papel px-4 py-2 font-semibold text-papel"
            >
              SALIR
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="bg-lima px-4 py-2 font-semibold text-tinta no-underline"
          >
            ENTRAR
          </Link>
        )}
      </nav>
    </header>
  );
}
