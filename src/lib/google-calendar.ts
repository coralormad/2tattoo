// Integración mínima con Google Calendar: solo lectura de franjas
// ocupadas (freeBusy), para restar al horario del tatuador el tiempo que
// ya tiene comprometido en su calendario personal.
import { createAdminClient } from "@/lib/supabase/admin";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_FREEBUSY_URL = "https://www.googleapis.com/calendar/v3/freeBusy";
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

function redirectUri(origin: string) {
  return `${origin}/auth/google/callback`;
}

/** URL a la que mandamos al tatuador para que autorice el acceso. */
export function construirUrlAutorizacionGoogle(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

type RespuestaToken = { access_token: string; refresh_token?: string; expires_in: number };

/** Cambia el "code" que devuelve Google tras el consentimiento por tokens. */
export async function intercambiarCodigoGoogle(
  code: string,
  origin: string,
): Promise<RespuestaToken> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) throw new Error("No se pudo conectar con Google.");  // ← cambia esta línea
  return res.json();
}

async function refrescarAccessToken(refreshToken: string): Promise<RespuestaToken | null> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;
  return res.json();
}

export type Ocupado = { inicio: string; fin: string }; // ISO 8601

/**
 * Franjas ocupadas del calendario "primary" del tatuador entre dos
 * fechas. Devuelve [] si no tiene Google conectado, si falta
 * configuración, o si la llamada a Google falla por cualquier motivo:
 * nunca debe romper el cálculo de huecos, solo dejar de aportar datos.
 */
export async function obtenerOcupacionGoogle(
  tatuadorId: string,
  desde: Date,
  hasta: Date,
): Promise<Ocupado[]> {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

  try {
    const admin = createAdminClient();
    const { data: conexion } = await admin
      .from("conexiones_google")
      .select("access_token, refresh_token, expira_en")
      .eq("tatuador_id", tatuadorId)
      .maybeSingle();

    if (!conexion) return [];

    let accessToken = conexion.access_token as string;
    const expira = new Date(conexion.expira_en as string);

    if (expira.getTime() - Date.now() < 60_000) {
      const refrescado = await refrescarAccessToken(conexion.refresh_token as string);
      if (!refrescado) return [];

      accessToken = refrescado.access_token;
      await admin
        .from("conexiones_google")
        .update({
          access_token: refrescado.access_token,
          expira_en: new Date(Date.now() + refrescado.expires_in * 1000).toISOString(),
        })
        .eq("tatuador_id", tatuadorId);
    }

    const res = await fetch(GOOGLE_FREEBUSY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        timeMin: desde.toISOString(),
        timeMax: hasta.toISOString(),
        items: [{ id: "primary" }],
      }),
    });

    if (!res.ok) return [];

    const datos = await res.json();
    const ocupado = (datos.calendars?.primary?.busy ?? []) as { start: string; end: string }[];
    return ocupado.map((o) => ({ inicio: o.start, fin: o.end }));
  } catch {
    return [];
  }
}
