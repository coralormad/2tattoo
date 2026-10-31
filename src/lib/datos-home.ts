import { createClient } from "@/lib/supabase/server";
import type { Flash } from "@/components/marca/TarjetaFlash";
import type { Idea } from "@/components/marca/TarjetaIdea";
import type { Artista } from "@/components/marca/TarjetaArtista";
import { flashesDeMuestra, ideasDeMuestra, artistasDeMuestra } from "@/lib/datos-prueba";

type PerfilEmbebido = { usuario: string | null; nombre: string | null } | null;

// Supabase devuelve la relación embebida como objeto o como array según el
// tipado disponible; esto admite las dos formas.
const nombreArtista = (p: PerfilEmbebido | PerfilEmbebido[]) => {
  const perfil = Array.isArray(p) ? (p[0] ?? null) : p;
  return perfil?.usuario ? `@${perfil.usuario}` : (perfil?.nombre ?? "Artista");
};

export async function obtenerDatosHome() {
  const supabase = await createClient();

  const [flashesRes, ideasRes, artistasRes] = await Promise.all([
    supabase
      .from("flashes")
      .select("id, titulo, tipo, icono, medida_cm, ciudad, perfiles(usuario, nombre)")
      .eq("estado", "disponible")
      .order("creado_en", { ascending: false })
      .limit(4),
    supabase
      .from("ideas")
      .select("titulo, texto, zona, perfiles(usuario, nombre)")
      .eq("estado", "abierta")
      .order("creado_en", { ascending: false })
      .limit(3),
    supabase
      .from("perfiles")
      .select("nombre, ciudad, estilos")
      .eq("rol", "tatuador")
      .order("creado_en", { ascending: false })
      .limit(3),
  ]);

  const flashes: Flash[] = (flashesRes.data ?? []).map((f, i) => ({
    id: f.id,
    numero: `Nº ${String(i + 1).padStart(3, "0")}`,
    tipo: f.tipo === "flash_unico" ? "FLASH ÚNICO" : "FLASH",
    titulo: f.titulo,
    medida: f.medida_cm ? `${f.medida_cm} cm` : "",
    artista: nombreArtista(f.perfiles ?? { usuario: null, nombre: null }),
    ciudad: f.ciudad ?? "",
    icono: f.icono,
  }));

  const ideas: Idea[] = (ideasRes.data ?? []).map((i) => ({
    artista: nombreArtista(i.perfiles ?? { usuario: null, nombre: null }),
    titulo: i.titulo,
    texto: i.texto ?? "",
    zona: i.zona ?? "",
  }));

  const artistas: Artista[] = (artistasRes.data ?? [])
    .filter((a) => a.nombre)
    .map((a) => ({
      nombre: a.nombre!,
      ciudad: a.ciudad ?? "",
      estilos: a.estilos ?? "",
    }));

  return {
    flashes: flashes.length ? flashes : flashesDeMuestra,
    ideas: ideas.length ? ideas : ideasDeMuestra,
    artistas: artistas.length ? artistas : artistasDeMuestra,
  };
}
