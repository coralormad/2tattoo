"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerHuecosDisponibles } from "@/lib/disponibilidad";

export type EstadoSolicitud = { error: string } | { ok: true } | null;

export async function solicitarFlash(
  _previo: EstadoSolicitud,
  formData: FormData,
): Promise<EstadoSolicitud> {
  const flashId = String(formData.get("flash_id") ?? "");
  const zona = String(formData.get("zona") ?? "").trim();
  const fecha = String(formData.get("fecha") ?? "").trim();
  const horaInicio = String(formData.get("hora_inicio") ?? "").trim();
  const horaFin = String(formData.get("hora_fin") ?? "").trim();
  const nota = String(formData.get("nota") ?? "").trim();

  if (!flashId) return { error: "Falta el flash." };
  if (!zona) return { error: "Elige una zona del cuerpo." };
  if (!fecha || !horaInicio || !horaFin) return { error: "Elige un hueco en la agenda." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: flash } = await supabase
    .from("flashes")
    .select("tatuador_id, duracion_min")
    .eq("id", flashId)
    .single();

  if (!flash) return { error: "Este flash ya no existe." };

  // Vuelve a calcular los huecos en el servidor: el hueco elegido en el
  // cliente puede estar desactualizado (alguien más lo reservó, o el
  // tatuador cambió su horario) entre que se cargó la página y se envió
  // el formulario.
  const huecosReales = await obtenerHuecosDisponibles(
    supabase,
    flash.tatuador_id,
    flash.duracion_min,
  );
  const huecoValido = huecosReales.some(
    (h) => h.fecha === fecha && h.horaInicio === horaInicio && h.horaFin === horaFin,
  );
  if (!huecoValido) {
    return { error: "Ese hueco ya no está disponible. Elige otro." };
  }

  const { error } = await supabase.from("solicitudes").insert({
    flash_id: flashId,
    cliente_id: user.id,
    zona,
    fecha,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
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
