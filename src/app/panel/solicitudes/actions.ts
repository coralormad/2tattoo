"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";

export async function responderSolicitud(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const estado = String(formData.get("estado") ?? "");
  if (!id || (estado !== "aceptada" && estado !== "rechazada")) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("responder_solicitud", {
    p_id: id,
    p_estado: estado,
  });
  if (error) console.error("responderSolicitud:", error.message);

  revalidatePath("/panel/solicitudes");
}