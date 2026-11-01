"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoFormulario = { error: string } | null;

const HORA_VALIDA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Comprueba sesión + rol de tatuador; redirige si no se cumple. */
async function requerirTatuador() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "tatuador") redirect("/");

  return { supabase, tatuadorId: user.id };
}

export async function guardarDisponibilidad(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const { supabase, tatuadorId } = await requerirTatuador();

  const filas: { tatuador_id: string; dia_semana: number; hora_inicio: string; hora_fin: string }[] = [];
  const diasAbiertos: number[] = [];

  for (let dia = 1; dia <= 7; dia++) {
    if (formData.get(`abierto_${dia}`) !== "on") continue;

    const horaInicio = String(formData.get(`inicio_${dia}`) ?? "");
    const horaFin = String(formData.get(`fin_${dia}`) ?? "");

    if (!HORA_VALIDA.test(horaInicio) || !HORA_VALIDA.test(horaFin)) {
      return { error: "Revisa las horas: formato HH:MM." };
    }
    if (horaFin <= horaInicio) {
      return { error: "La hora de fin debe ser posterior a la de inicio." };
    }

    diasAbiertos.push(dia);
    filas.push({ tatuador_id: tatuadorId, dia_semana: dia, hora_inicio: horaInicio, hora_fin: horaFin });
  }

  // Sustituye el horario completo: borra los días que ya no están
  // marcados como abiertos y sube (upsert) los que sí.
  const { error: errorBorrar } = await supabase
    .from("disponibilidad")
    .delete()
    .eq("tatuador_id", tatuadorId)
    .not("dia_semana", "in", `(${diasAbiertos.length ? diasAbiertos.join(",") : "0"})`);

  if (errorBorrar) return { error: "No se pudo guardar el horario. Inténtalo de nuevo." };

  if (filas.length > 0) {
    const { error } = await supabase
      .from("disponibilidad")
      .upsert(filas, { onConflict: "tatuador_id,dia_semana" });

    if (error) return { error: "No se pudo guardar el horario. Inténtalo de nuevo." };
  }

  redirect(`/panel/agenda?horario=${filas.length > 0 ? "guardado" : "vacio"}`);
}

export async function crearBloqueo(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const { supabase, tatuadorId } = await requerirTatuador();

  const fecha = String(formData.get("fecha") ?? "");
  const diaEntero = formData.get("dia_entero") === "on";
  const horaInicio = String(formData.get("hora_inicio") ?? "");
  const horaFin = String(formData.get("hora_fin") ?? "");
  const motivo = String(formData.get("motivo") ?? "").trim();

  if (!fecha) return { error: "Indica una fecha." };

  if (!diaEntero) {
    if (!HORA_VALIDA.test(horaInicio) || !HORA_VALIDA.test(horaFin)) {
      return { error: "Revisa las horas: formato HH:MM, o marca \"día entero\"." };
    }
    if (horaFin <= horaInicio) {
      return { error: "La hora de fin debe ser posterior a la de inicio." };
    }
  }

  const { error } = await supabase.from("bloqueos").insert({
    tatuador_id: tatuadorId,
    fecha,
    hora_inicio: diaEntero ? null : horaInicio,
    hora_fin: diaEntero ? null : horaFin,
    motivo: motivo || null,
  });

  if (error) return { error: "No se pudo crear el bloqueo. Inténtalo de nuevo." };

  redirect("/panel/agenda");
}

export async function eliminarBloqueo(formData: FormData) {
  const { supabase, tatuadorId } = await requerirTatuador();
  const id = String(formData.get("id") ?? "");

  await supabase.from("bloqueos").delete().eq("id", id).eq("tatuador_id", tatuadorId);

  redirect("/panel/agenda");
}

export async function desconectarGoogle() {
  const { supabase, tatuadorId } = await requerirTatuador();

  await supabase.from("conexiones_google").delete().eq("tatuador_id", tatuadorId);

  redirect("/panel/agenda");
}
