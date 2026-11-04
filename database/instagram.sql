-- 2Tattoo · Integración con Instagram: importar fotos de la cuenta del
-- tatuador como flashes dentro de la app.
-- Ejecutar en Supabase → SQL Editor (después de database/flashes-ideas.sql
-- y database/google-calendar.sql, cuyos patrones se reutilizan aquí).

-- 1) Conexión del tatuador con Instagram Graph API --------------------------
-- Mismo patrón que conexiones_google: guarda un access_token real de larga
-- duración, por eso NO lleva política pública. Solo el propio tatuador
-- (RLS normal) o el servidor con la service role key (que salta RLS, ver
-- src/lib/supabase/admin.ts) pueden leerla o escribirla.
create table public.conexiones_instagram (
  tatuador_id uuid primary key references public.perfiles (id) on delete cascade,
  ig_user_id text not null,
  username text,
  access_token text not null,
  expira_en timestamptz not null,
  creado_en timestamptz not null default now()
);

alter table public.conexiones_instagram enable row level security;

create policy "El tatuador ve su propia conexion de Instagram"
  on public.conexiones_instagram for select
  using (auth.uid() = tatuador_id);

create policy "El tatuador gestiona su propia conexion de Instagram"
  on public.conexiones_instagram for all
  using (auth.uid() = tatuador_id)
  with check (auth.uid() = tatuador_id);

-- 2) Flashes: foto importada ------------------------------------------------
-- imagen_url: URL pública del archivo ya subido al bucket de Storage
-- "flashes" (ver más abajo). ig_media_id: id del media en Instagram, para
-- no poder importar dos veces el mismo post del mismo tatuador.
-- Ambas columnas quedan nullables porque un flash puede seguir creándose
-- a mano, solo con icono, sin pasar por Instagram.
alter table public.flashes add column imagen_url text;
alter table public.flashes add column ig_media_id text;

-- Postgres permite múltiples NULL en una columna unique, así que esta
-- restricción solo bloquea reimportar el mismo media_id del mismo tatuador,
-- sin afectar a los flashes que no vienen de Instagram.
alter table public.flashes
  add constraint flashes_tatuador_ig_media_unique unique (tatuador_id, ig_media_id);

-- 3) Storage: bucket público donde viven las fotos importadas --------------
-- "public" solo afecta a la lectura (URL pública sin firmar); subir y
-- borrar sigue exigiendo las políticas de storage.objects de abajo.
insert into storage.buckets (id, name, public)
values ('flashes', 'flashes', true)
on conflict (id) do nothing;

-- Lectura pública del bucket (cualquiera puede ver los flashes, igual que
-- la política "Flashes visibles para todos" de la tabla flashes).
create policy "Lectura publica de fotos de flashes"
  on storage.objects for select
  using (bucket_id = 'flashes');

-- Cada tatuador solo puede subir/borrar dentro de su propia carpeta
-- {tatuador_id}/archivo.jpg: el primer segmento de la ruta debe ser su uid.
create policy "El tatuador sube fotos solo en su propia carpeta"
  on storage.objects for insert
  with check (
    bucket_id = 'flashes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "El tatuador borra solo sus propias fotos"
  on storage.objects for delete
  using (
    bucket_id = 'flashes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
