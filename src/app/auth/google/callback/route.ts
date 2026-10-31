import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { intercambiarCodigoGoogle } from "@/lib/google-calendar";

/** Recibe la vuelta de Google tras el consentimiento y guarda los tokens. */
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
    .find((c) => c.startsWith("google_oauth_state="))
    ?.split("=")[1];

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(new URL("/panel/agenda?google=error", request.url));
  }

  try {
    const tokens = await intercambiarCodigoGoogle(code, origin);

    if (!tokens.refresh_token) {
      // Google solo manda refresh_token la primera vez que se autoriza
      // (o si se fuerza con prompt=consent, que ya hacemos). Si falta,
      // no podemos mantener la conexión viva: pedimos reconectar.
      return NextResponse.redirect(new URL("/panel/agenda?google=sin_refresh", request.url));
    }

    const { error } = await supabase.from("conexiones_google").upsert({
      tatuador_id: user.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expira_en: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    });
    if (error) {
      return NextResponse.redirect(new URL("/panel/agenda?google=error", request.url));
    }

    const response = NextResponse.redirect(
      new URL("/panel/agenda?google=conectado", request.url),
    );
    response.cookies.delete("google_oauth_state");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/panel/agenda?google=error", request.url));
  }
}
