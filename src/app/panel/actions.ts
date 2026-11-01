"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoFormulario = { error: string } | null;

const ICONOS_VALIDOS = ["snake", "dagger", "moon", "star"] as const;
const USUARIO_VALIDO = /^[a-z0-9_.-]{3,30}$/;

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
  const duracionEnviada = Number(formData.get("duracion_min"));
  const duracionMin =
    Number.isFinite(duracionEnviada) && duracionEnviada > 0 ? duracionEnviada : 60;

  const { error } = await supabase.from("flashes").insert({
    tatuador_id: tatuadorId,
    titulo,
    tipo,
    icono,
    medida_cm: medida ? Number(medida) : null,
    precio_desde: precio ? Number(precio) : null,
    ciudad: ciudad || null,
    duracion_min: duracionMin,
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

export async function responderSolicitud(formData: FormData) {
  const { supabase } = await requerirTatuador();

  const id = String(formData.get("id") ?? "");
  const estado = String(formData.get("estado") ?? "");
  if (!id || (estado !== "aceptada" && estado !== "rechazada")) {
    redirect("/panel?solicitud=error");
  }

  // La función SQL comprueba que el flash es de este tatuador y que la
  // solicitud sigue pendiente, y libera el flash único si se rechaza.
  const { error } = await supabase.rpc("responder_solicitud", {
    p_solicitud: id,
    p_estado: estado,
  });

  redirect(error ? "/panel?solicitud=error" : `/panel?solicitud=${estado}`);
}

export async function actualizarPerfil(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const { supabase, tatuadorId } = await requerirTatuador();

  const usuario = String(formData.get("usuario") ?? "").trim().toLowerCase();
  const bio = String(formData.get("bio") ?? "").trim();
  const ciudad = String(formData.get("ciudad") ?? "").trim();
  const estilos = String(formData.get("estilos") ?? "").trim();

  if (!USUARIO_VALIDO.test(usuario)) {
    return {
      error:
        "El usuario debe tener 3-30 caracteres: minúsculas, números, puntos, guiones o guiones bajos.",
    };
  }

  const { data: ocupado } = await supabase
    .from("perfiles")
    .select("id")
    .eq("usuario", usuario)
    .neq("id", tatuadorId)
    .maybeSingle();

  if (ocupado) return { error: "Ese usuario ya está en uso." };

  const { error } = await supabase
    .from("perfiles")
    .update({ usuario, bio: bio || null, ciudad: ciudad || null, estilos: estilos || null })
    .eq("id", tatuadorId);

  if (error) return { error: "No se pudo guardar el perfil. Inténtalo de nuevo." };

  redirect("/panel");
}
