// Integración con Instagram vía "inicio de sesión unificado" de Meta
// (Facebook Login for Business con config_id). Meta bloquea el flujo de
// Instagram Login para apps nuevas. Se usan el App ID / App Secret de
// "Información básica" y un config_id (META_CONFIG_ID) creado en el panel
// de Meta, que define los permisos. Solo para que el tatuador importe fotos
// de su cuenta como flashes.
//
// Requisitos de la configuración en Meta: permisos pages_show_list e
// instagram_basic (y pages_read_engagement), cuenta de Instagram profesional
// vinculada a una Página de Facebook.

const GRAPH_VERSION = "v23.0";
const FACEBOOK_AUTH_URL = "https://www.facebook.com/dialog/oauth";
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;
const DURACION_LARGA_POR_DEFECTO = 60 * 24 * 3600; // 60 días, si Meta no devuelve expires_in

/** Registra el error de Meta (sin secretos: solo message/type/code/fbtrace_id). */
async function registrarErrorMeta(paso: string, res: Response) {
  try {
    const cuerpo = await res.json();
    console.error(`[instagram] ${paso} -> HTTP ${res.status}`, cuerpo?.error ?? "sin detalle");
  } catch {
    console.error(`[instagram] ${paso} -> HTTP ${res.status}`);
  }
}

function redirectUri(origin: string) {
  return process.env.INSTAGRAM_REDIRECT_URI || `${origin}/auth/instagram/callback`;
}

/** URL a la que mandamos al tatuador para que autorice el acceso a su Instagram. */
export function construirUrlAutorizacionInstagram(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    config_id: process.env.META_CONFIG_ID!,
    display: "popup",
    redirect_uri: redirectUri(origin),
    response_type: "code",
    override_default_response_type: "true",
    state,
  });
  return `${FACEBOOK_AUTH_URL}?${params.toString()}`;
}

// expira_en: segundos hasta la caducidad (no un timestamp), para que el
// caller decida cómo guardarlo. user_id es el id de la cuenta de Instagram.
type TokenLargoInstagram = {
  access_token: string;
  user_id: string;
  username: string | null;
  expira_en: number;
};

/**
 * Cambia el "code" por un token corto, ese por uno largo (60 días) y, con él,
 * localiza la cuenta de Instagram profesional vinculada a las Páginas del
 * usuario (id y username).
 */
export async function intercambiarCodigoInstagram(
  code: string,
  origin: string,
): Promise<TokenLargoInstagram | null> {
  try {
    const urlCorto = new URL(`${GRAPH_URL}/oauth/access_token`);
    urlCorto.searchParams.set("client_id", process.env.META_APP_ID!);
    urlCorto.searchParams.set("client_secret", process.env.META_APP_SECRET!);
    urlCorto.searchParams.set("redirect_uri", redirectUri(origin));
    urlCorto.searchParams.set("code", code);

    const resCorto = await fetch(urlCorto.toString());
    if (!resCorto.ok) {
      await registrarErrorMeta("oauth/access_token (code)", resCorto);
      return null;
    }
    const corto = (await resCorto.json()) as { access_token: string };

    const largo = await cambiarPorTokenLargo(corto.access_token);
    if (!largo) return null;

    const cuenta = await buscarCuentaInstagram(largo.access_token);
    if (!cuenta) return null;

    return {
      access_token: largo.access_token,
      user_id: cuenta.id,
      username: cuenta.username,
      expira_en: largo.expira_en,
    };
  } catch (e) {
    console.error("[instagram] excepción en el intercambio", e instanceof Error ? e.message : e);
    return null;
  }
}

async function cambiarPorTokenLargo(
  accessToken: string,
): Promise<{ access_token: string; expira_en: number } | null> {
  const url = new URL(`${GRAPH_URL}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", process.env.META_APP_ID!);
  url.searchParams.set("client_secret", process.env.META_APP_SECRET!);
  url.searchParams.set("fb_exchange_token", accessToken);

  const res = await fetch(url.toString());
  if (!res.ok) {
    await registrarErrorMeta("oauth/access_token (fb_exchange_token)", res);
    return null;
  }

  const datos = (await res.json()) as { access_token: string; expires_in?: number };
  return { access_token: datos.access_token, expira_en: datos.expires_in ?? DURACION_LARGA_POR_DEFECTO };
}

/** Primera Página del usuario que tenga una cuenta de Instagram profesional vinculada. */
async function buscarCuentaInstagram(
  accessToken: string,
): Promise<{ id: string; username: string | null } | null> {
  const url = new URL(`${GRAPH_URL}/me/accounts`);
  url.searchParams.set("fields", "instagram_business_account{id,username}");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  if (!res.ok) {
    await registrarErrorMeta("me/accounts", res);
    return null;
  }

  const datos = (await res.json()) as {
    data?: { instagram_business_account?: { id: string; username?: string } }[];
  };
  const cuenta = datos.data?.find((p) => p.instagram_business_account)?.instagram_business_account;
  if (!cuenta) console.error("[instagram] me/accounts: ninguna Página con instagram_business_account vinculado");
  return cuenta ? { id: cuenta.id, username: cuenta.username ?? null } : null;
}

/** Renueva el token de larga duración antes de que caduque (nuevo cambio por token largo). */
export async function refrescarTokenInstagram(
  accessToken: string,
): Promise<{ access_token: string; expira_en: number } | null> {
  try {
    return await cambiarPorTokenLargo(accessToken);
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
 * Fotos de la cuenta de Instagram conectada. Descarta vídeos (no aplican a
 * flashes) y álbumes sin media_url propio (la API no expone el de portada ahí,
 * solo en sus "children", y no vale la pena complicarlo para esto).
 */
export async function listarMediaInstagram(
  accessToken: string,
  igUserId: string,
): Promise<MediaInstagram[]> {
  try {
    const url = new URL(`${GRAPH_URL}/${encodeURIComponent(igUserId)}/media`);
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
