"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoSolicitud = { error: string } | { ok: true } | null;

export async function solicitarFlash(
  _previo: EstadoSolicitud,
  formData: FormData,
): Promise<EstadoSolicitud> {
  const flashId = String(formData.get("flash_id") ?? "");
  const zona = String(formData.get("zona") ?? "").trim();
  const fechaPreferida = String(formData.get("fecha_preferida") ?? "").trim();
  const nota = String(formData.get("nota") ?? "").trim();

  if (!flashId) return { error: "Falta el flash." };
  if (!zona) return { error: "Elige una zona del cuerpo." };
  if (!fechaPreferida) return { error: "Indica una fecha preferida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.from("solicitudes").insert({
    flash_id: flashId,
    cliente_id: user.id,
    zona,
    fecha_preferida: fechaPreferida,
    nota: nota || null,
  });

  if (error) {
    return {
      error:
        error.message === "Este flash ya no está disponible."
          ? error.message
          : "No se pudo enviar la solicitud. Inténtalo de nuevo.",
    };
  }

  return { ok: true };
}
