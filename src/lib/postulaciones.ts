import { createClient } from "@/lib/supabase/server";

export type RolVisitante = "anonimo" | "cliente" | "tatuador";

/** Quién está mirando y a qué ideas se ha postulado ya (para pintar el botón ME POSTULO). */
export async function obtenerContextoPostulacion(): Promise<{
  rol: RolVisitante;
  postuladas: string[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { rol: "anonimo", postuladas: [] };

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol === "tatuador") return { rol: "tatuador", postuladas: [] };

  const { data } = await supabase
    .from("postulaciones")
    .select("idea_id")
    .eq("cliente_id", user.id);

  return {
    rol: "cliente",
    postuladas: (data ?? []).map((p: { idea_id: string }) => p.idea_id),
  };
}
