import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { construirUrlAutorizacionGoogle } from "@/lib/google-calendar";

/** Arranca el flujo OAuth: redirige al tatuador a la pantalla de Google. */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "tatuador") return NextResponse.redirect(new URL("/", request.url));

  const origin = new URL(request.url).origin;
  const state = randomBytes(16).toString("hex");

  const response = NextResponse.redirect(construirUrlAutorizacionGoogle(origin, state));
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
