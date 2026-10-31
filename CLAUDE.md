# 2Tattoo — contexto para Claude Code

## Stack
- Next.js 16.4 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (@tailwindcss/turbopack)
- Supabase (@supabase/ssr, @supabase/supabase-js) — auth y BD
- motion (animaciones)
- ESLint 9 (flat config, eslint.config.mjs)

## Comandos
- `npm run dev` — desarrollo (turbopack)
- `npm run build` — build producción
- `npm run start` — servir build
- `npm run lint` — ESLint

## Estructura
- `src/app/` — rutas (App Router)
  - `(auth)/login/`, `(auth)/registro/`, `(auth)/registro/revisa-tu-email/` — grupo de rutas sin prefijo en URL
  - `auth/actions.ts`, `auth/confirm/`, `auth/auth-code-error/` — callbacks de Supabase Auth (sí en la URL)
- `src/components/marca/` — UI de marca (Header, Logo, PanelAcceso, TarjetaArtista, TarjetaFlash, TarjetaIdea, AccesoLayout, CampoFicha, IconoFlash, TituloEntrada)
- `src/components/efectos/` — efectos visuales (CursorTinta, Revelar)
- `src/lib/supabase/` — `client.ts` (browser), `server.ts` (server), `proxy.ts`
- `src/lib/datos-home.ts`, `datos-prueba.ts` — datos de maqueta, a sustituir por Supabase
- `database/schema.sql`, `database/flashes-ideas.sql` — SQL de referencia (no hay migraciones formales aún)

## Convenciones
- Nombres de componentes y carpetas de dominio en **español** (marca, efectos, ficha, acceso) — mantenerlo así, no traducir a inglés.
- `(auth)` es un route group (no aparece en la URL); `auth/` sí aparece (son los callbacks de Supabase).
- Variables de entorno Supabase en `.env.local` (no commitear; `.env.example` como plantilla).

## Niveles de contexto
1. **Ligero (por defecto):** Grep/Glob dirigido + leer solo el fragmento necesario. No leer el repo completo.
2. **Análisis técnico:** cambios que tocan varios módulos (p. ej. auth + Supabase + UI) — listar archivos afectados antes de leer nada.
3. **Investigación profunda:** rediseños, nueva arquitectura, bugs difíciles — exploración amplia autorizada.

## Reglas
- No releer archivos ya leídos en la misma sesión salvo que hayan cambiado.
- Priorizar precisión sobre ahorro si hay duda real sobre el código.
