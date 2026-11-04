// Integración con Instagram API with Instagram Login (Meta) — NO Basic
// Display, que está deprecada. Solo para que el tatuador importe fotos de
// su cuenta como flashes.

const INSTAGRAM_AUTH_URL = "https://www.instagram.com/oauth/authorize";
const INSTAGRAM_TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const INSTAGRAM_GRAPH_URL = "https://graph.instagram.com";
const SCOPE = "instagram_business_basic";

function redirectUri(origin: string) {
  return process.env.INSTAGRAM_REDIRECT_URI || `${origin}/auth/instagram/callback`;
}

/** URL a la que mandamos al tatuador para que autorice el acceso a su Instagram. */
export function construirUrlAutorizacionInstagram(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: SCOPE,
    state,
  });
  return `${INSTAGRAM_AUTH_URL}?${params.toString()}`;
}

// expira_en: segundos hasta la caducidad (no un timestamp), igual que el
// expires_in que devuelve Instagram, para que el caller decida cómo guardarlo.
type TokenLargoInstagram = { access_token: string; user_id: string; expira_en: number };

/**
 * Cambia el "code" del consentimiento por un token corto y, encadenado,
 * ese token corto por uno de larga duración (60 días): sin este segundo
 * paso el access_token caduca en 1 hora y no sirve para nada útil.
 */
export async function intercambiarCodigoInstagram(
  code: string,
  origin: string,
): Promise<TokenLargoInstagram | null> {
  try {
    const resCorto = await fetch(INSTAGRAM_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: redirectUri(origin),
        code,
      }),
    });
    if (!resCorto.ok) return null;
    const corto = (await resCorto.json()) as { access_token: string; user_id: string };

    const urlLargo = new URL(`${INSTAGRAM_GRAPH_URL}/access_token`);
    urlLargo.searchParams.set("grant_type", "ig_exchange_token");
    urlLargo.searchParams.set("client_secret", process.env.META_APP_SECRET!);
    urlLargo.searchParams.set("access_token", corto.access_token);

    const resLargo = await fetch(urlLargo.toString());
    if (!resLargo.ok) return null;
    const largo = (await resLargo.json()) as { access_token: string; expires_in: number };

    return { access_token: largo.access_token, user_id: corto.user_id, expira_en: largo.expires_in };
  } catch {
    return null;
  }
}

/** Renueva un token de larga duración antes de que caduque (también dura 60 días). */
export async function refrescarTokenInstagram(
  accessToken: string,
): Promise<{ access_token: string; expira_en: number } | null> {
  try {
    const url = new URL(`${INSTAGRAM_GRAPH_URL}/refresh_access_token`);
    url.searchParams.set("grant_type", "ig_refresh_token");
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const datos = (await res.json()) as { access_token: string; expires_in: number };
    return { access_token: datos.access_token, expira_en: datos.expires_in };
  } catch {
    return null;
  }
}

export type MediaInstagram = {
  id: string;
  media_url: string;
  caption: string | null;
  timestamp: string;
};

/**
 * Fotos del usuario conectado. Descarta vídeos (no aplican a flashes) y
 * álbumes sin media_url propio (la API no expone el de portada ahí, solo
 * en sus "children", y no vale la pena complicarlo para esto).
 */
export async function listarMediaInstagram(accessToken: string): Promise<MediaInstagram[]> {
  try {
    const url = new URL(`${INSTAGRAM_GRAPH_URL}/me/media`);
    url.searchParams.set("fields", "id,media_type,media_url,caption,timestamp");
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url.toString());
    if (!res.ok) return [];

    const datos = await res.json();
    const items = (datos.data ?? []) as {
      id: string;
      media_type: string;
      media_url?: string;
      caption?: string;
      timestamp: string;
    }[];

    return items
      .filter((item) => (item.media_type === "IMAGE" || item.media_type === "CAROUSEL_ALBUM") && item.media_url)
      .map((item) => ({
        id: item.id,
        media_url: item.media_url!,
        caption: item.caption ?? null,
        timestamp: item.timestamp,
      }));
  } catch {
    return [];
  }
}
