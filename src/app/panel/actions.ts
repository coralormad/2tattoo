"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoFormulario = { error: string } | null;

const ICONOS_VALIDOS = ["snake", "dagger", "moon", "star"] as const;

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

export async function publicarFlash(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const { supabase, tatuadorId } = await requerirTatuador();

  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) return { error: "El título es obligatorio." };

  const tipo = formData.get("tipo") === "flash_unico" ? "flash_unico" : "flash";
  const iconoEnviado = String(formData.get("icono") ?? "");
  const icono = (ICONOS_VALIDOS as readonly string[]).includes(iconoEnviado)
    ? iconoEnviado
    : "star";
  const medida = formData.get("medida_cm");
  const precio = formData.get("precio_desde");
  const ciudad = String(formData.get("ciudad") ?? "").trim();

  const { error } = await supabase.from("flashes").insert({
    tatuador_id: tatuadorId,
    titulo,
    tipo,
    icono,
    medida_cm: medida ? Number(medida) : null,
    precio_desde: precio ? Number(precio) : null,
    ciudad: ciudad || null,
  });

  if (error) return { error: "No se pudo publicar el flash. Inténtalo de nuevo." };

  redirect("/panel");
}

export async function publicarIdea(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const { supabase, tatuadorId } = await requerirTatuador();

  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) return { error: "El título es obligatorio." };

  const texto = String(formData.get("texto") ?? "").trim();
  const zona = String(formData.get("zona") ?? "").trim();

  const { error } = await supabase.from("ideas").insert({
    tatuador_id: tatuadorId,
    titulo,
    texto: texto || null,
    zona: zona || null,
  });

  if (error) return { error: "No se pudo publicar la idea. Inténtalo de nuevo." };

  redirect("/panel");
}
