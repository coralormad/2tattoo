import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { construirUrlAutorizacionInstagram } from "@/lib/instagram";

/** Arranca el flujo OAuth: redirige al tatuador a la pantalla de Instagram. */
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

  const response = NextResponse.redirect(construirUrlAutorizacionInstagram(origin, state));
  response.cookies.set("instagram_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
