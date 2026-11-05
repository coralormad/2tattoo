import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { intercambiarCodigoInstagram } from "@/lib/instagram";

/** Recibe la vuelta de Instagram tras el consentimiento y guarda los tokens. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const origin = url.origin;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const cookieState = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("instagram_oauth_state="))
    ?.split("=")[1];

  const redirigir = (destino: string) => {
    const res = NextResponse.redirect(new URL(destino, request.url));
    res.cookies.delete("instagram_oauth_state");
    return res;
  };

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "tatuador") return redirigir("/");

  if (url.searchParams.get("error") || !code || !state || state !== cookieState) {
    return redirigir("/panel/perfil?instagram=error");
  }

  const tokens = await intercambiarCodigoInstagram(code, origin);
  if (!tokens) {
    return redirigir("/panel/perfil?instagram=error");
  }

  // El username es solo para mostrarlo en el panel; si esta llamada falla
  // seguimos sin él, no bloquea la conexión.
  let username: string | null = null;
  try {
    const resPerfil = await fetch(
      `https://graph.instagram.com/me?fields=username&access_token=${tokens.access_token}`,
    );
    if (resPerfil.ok) {
      const datos = await resPerfil.json();
      username = datos.username ?? null;
    }
  } catch {
    // Ignorado a propósito: ver comentario de arriba.
  }

  const { error } = await supabase.from("conexiones_instagram").upsert({
    tatuador_id: user.id,
    ig_user_id: tokens.user_id,
    username,
    access_token: tokens.access_token,
    expira_en: new Date(Date.now() + tokens.expira_en * 1000).toISOString(),
  });
  if (error) {
    return redirigir("/panel/perfil?instagram=error");
  }

  return redirigir("/panel/perfil?instagram=conectado");
}
