"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EstadoPostulacion = { error: string } | { ok: true } | null;

export async function postularIdea(
  _previo: EstadoPostulacion,
  formData: FormData,
): Promise<EstadoPostulacion> {
  const ideaId = String(formData.get("idea_id") ?? "");
  const mensaje = String(formData.get("mensaje") ?? "").trim();

  if (!ideaId) return { error: "Falta la idea." };
  if (mensaje.length < 10) return { error: "Cuéntale un poco más (mínimo 10 caracteres)." };
  if (mensaje.length > 1000) return { error: "Máximo 1000 caracteres." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("postulaciones")
    .insert({ idea_id: ideaId, cliente_id: user.id, mensaje });

  if (error) {
    console.error("[postulación] falló:", error.code, error.message);
    if (error.code === "23505") return { error: "Ya te has postulado a esta idea." };
    if (error.code === "42501") {
      return { error: "Solo los clientes pueden postularse a ideas abiertas." };
    }
    return { error: "No se pudo enviar la postulación. Inténtalo de nuevo." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
