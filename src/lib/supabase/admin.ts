import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con la service role key: salta la RLS.
 *
 * Úsalo SOLO en servidor y SOLO cuando sea estrictamente necesario.
 * Caso real en esta app: al calcular los huecos libres de un tatuador
 * para un visitante que NO es él (ficha de flash), necesitamos leer el
 * token de Google Calendar de ese tatuador, y la tabla conexiones_google
 * no tiene política pública (solo el propio dueño puede leerla con el
 * cliente normal).
 * Segundo uso, SOLO en desarrollo: crear cuentas ya confirmadas en el
 * registro (auth/actions.ts) para no depender del envío de email.
 * Esta key nunca debe exponerse al navegador.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
