"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  type MediaInstagram,
  listarMediaInstagram,
  refrescarTokenInstagram,
} from "@/lib/instagram";

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
  const notas = String(formData.get("notas") ?? "").trim();

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
    .update({
      usuario,
      bio: bio || null,
      ciudad: ciudad || null,
      estilos: estilos || null,
      notas: notas || null,
    })
    .eq("id", tatuadorId);

  if (error) return { error: "No se pudo guardar el perfil. Inténtalo de nuevo." };

  redirect("/panel");
}

export async function desconectarInstagram() {
  const { supabase, tatuadorId } = await requerirTatuador();

  await supabase.from("conexiones_instagram").delete().eq("tatuador_id", tatuadorId);

  redirect("/panel/perfil");
}

/**
 * Access token vigente del tatuador, refrescándolo si está a punto de
 * caducar. Devuelve null si no hay conexión o el refresco falla.
 */
async function obtenerAccessTokenInstagram(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tatuadorId: string,
): Promise<string | null> {
  const { data: conexion } = await supabase
    .from("conexiones_instagram")
    .select("access_token, expira_en")
    .eq("tatuador_id", tatuadorId)
    .maybeSingle();

  if (!conexion) return null;

  let accessToken = conexion.access_token as string;
  const expira = new Date(conexion.expira_en as string);

  if (expira.getTime() - Date.now() < 60_000) {
    const refrescado = await refrescarTokenInstagram(accessToken);
    if (!refrescado) return null;

    accessToken = refrescado.access_token;
    await supabase
      .from("conexiones_instagram")
      .update({
        access_token: refrescado.access_token,
        expira_en: new Date(Date.now() + refrescado.expira_en * 1000).toISOString(),
      })
      .eq("tatuador_id", tatuadorId);
  }

  return accessToken;
}

/**
 * Trae la media de Instagram del tatuador conectado para que un
 * componente de cliente la muestre en un selector. No redirige: si no
 * hay conexión o falla la llamada, simplemente no hay nada que elegir.
 */
export async function listarMediaInstagramAction(): Promise<MediaInstagram[]> {
  const { supabase, tatuadorId } = await requerirTatuador();

  const accessToken = await obtenerAccessTokenInstagram(supabase, tatuadorId);
  if (!accessToken) return [];

  return listarMediaInstagram(accessToken);
}

type SeleccionInstagram = { ig_media_id: string };

/**
 * Sube a Storage e inserta en flashes cada foto seleccionada. La
 * constraint unique (tatuador_id, ig_media_id) hace que reintentar una
 * importación sea seguro: con ignoreDuplicates los posts ya importados
 * se omiten en vez de romper el resto del lote.
 *
 * El cliente solo manda los `ig_media_id` elegidos: `media_url` y
 * `caption` se vuelven a pedir aquí a la API de Instagram con el token
 * del propio tatuador, en vez de confiar en lo que venga en el
 * formulario — si no, cualquiera podría editar el campo oculto y poner
 * una media_url arbitraria y el servidor la descargaría y publicaría
 * igualmente (SSRF).
 */
export async function importarFlashesInstagram(
  formData: FormData,
): Promise<{ error: string } | { ok: true; importados: number }> {
  const { supabase, tatuadorId } = await requerirTatuador();

  let seleccion: SeleccionInstagram[];
  try {
    seleccion = JSON.parse(String(formData.get("seleccion") ?? "[]"));
  } catch {
    return { error: "Selección inválida." };
  }

  if (!Array.isArray(seleccion) || seleccion.length === 0) {
    return { error: "No hay fotos seleccionadas." };
  }

  const accessToken = await obtenerAccessTokenInstagram(supabase, tatuadorId);
  if (!accessToken) return { error: "Tu conexión con Instagram no está disponible. Reconéctala." };

  const idsElegidos = new Set(seleccion.map((item) => item.ig_media_id));
  const mediaReal = await listarMediaInstagram(accessToken);
  const mediaElegida = mediaReal.filter((m) => idsElegidos.has(m.id));

  const filas: {
    tatuador_id: string;
    titulo: string;
    tipo: "flash";
    icono: "star";
    imagen_url: string;
    ig_media_id: string;
  }[] = [];

  for (const item of mediaElegida) {
    try {
      // Anti-SSRF: solo https y solo CDNs de Instagram/Meta, sin seguir redirecciones.
      const urlImagen = new URL(item.media_url);
      const host = urlImagen.hostname;
      const hostPermitido = ["cdninstagram.com", "fbcdn.net"].some(
        (d) => host === d || host.endsWith(`.${d}`),
      );
      if (urlImagen.protocol !== "https:" || !hostPermitido) continue;

      const MAX_BYTES = 8 * 1024 * 1024;
      const resImagen = await fetch(urlImagen, {
        redirect: "manual",
        signal: AbortSignal.timeout(10000),
      });
      if (!resImagen.ok) continue;
      if (!(resImagen.headers.get("content-type") ?? "").startsWith("image/")) continue;
      const largo = Number(resImagen.headers.get("content-length") ?? 0);
      if (largo > MAX_BYTES) continue;

      const bytes = await resImagen.arrayBuffer();
      if (bytes.byteLength > MAX_BYTES) continue;
      const ruta = `${tatuadorId}/${item.id}.jpg`;

      const { error: errorSubida } = await supabase.storage
        .from("flashes")
        .upload(ruta, bytes, { contentType: "image/jpeg", upsert: true });
      if (errorSubida) continue;

      const {
        data: { publicUrl },
      } = supabase.storage.from("flashes").getPublicUrl(ruta);

      const caption = (item.caption ?? "").trim();
      filas.push({
        tatuador_id: tatuadorId,
        titulo: caption ? caption.slice(0, 80) : "Importado de Instagram",
        tipo: "flash",
        icono: "star",
        imagen_url: publicUrl,
        ig_media_id: item.id,
      });
    } catch {
      // Un fallo en una foto no debe tirar el resto del lote.
    }
  }

  if (filas.length === 0) return { error: "No se pudo importar ninguna foto." };

  const { error, count } = await supabase
    .from("flashes")
    .upsert(filas, { onConflict: "tatuador_id,ig_media_id", ignoreDuplicates: true, count: "exact" });

  if (error) return { error: "No se pudieron guardar los flashes importados." };

  return { ok: true, importados: count ?? filas.length };
}
