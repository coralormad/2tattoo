-- Fase 7b: conexión con Google Calendar del tatuador.
-- A diferencia de disponibilidad/bloqueos, esta tabla guarda tokens de
-- acceso reales a la cuenta de Google del tatuador: NO lleva política
-- pública. Solo el propio tatuador (RLS normal) o el servidor con la
-- service role key (que salta RLS, ver src/lib/supabase/admin.ts) pueden
-- leerla.

create table public.conexiones_google (
  tatuador_id uuid primary key references public.perfiles (id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expira_en timestamptz not null,
  creado_en timestamptz not null default now()
);

alter table public.conexiones_google enable row level security;

create policy "El tatuador ve su propia conexion de Google"
  on public.conexiones_google for select
  using (auth.uid() = tatuador_id);

create policy "El tatuador gestiona su propia conexion de Google"
  on public.conexiones_google for all
  using (auth.uid() = tatuador_id)
  with check (auth.uid() = tatuador_id);
