-- 2Tattoo · Fase 4 Paso 4: flashes, ideas y datos del perfil de artista
-- Ejecutar en Supabase → SQL Editor (después de database/schema.sql)

-- El Home y el perfil muestran ciudad y estilos del tatuador.
alter table public.perfiles add column ciudad text;
alter table public.perfiles add column estilos text;

create type public.tipo_flash as enum ('flash', 'flash_unico');
create type public.estado_flash as enum ('disponible', 'reservado', 'tatuado');
create type public.estado_idea as enum ('abierta', 'cerrada');
create type public.icono_flash as enum ('snake', 'dagger', 'moon', 'star');

create table public.flashes (
  id uuid primary key default gen_random_uuid(),
  tatuador_id uuid not null references public.perfiles (id) on delete cascade,
  titulo text not null,
  tipo public.tipo_flash not null default 'flash',
  icono public.icono_flash not null default 'star',
  medida_cm numeric,
  precio_desde numeric,
  ciudad text,
  estado public.estado_flash not null default 'disponible',
  creado_en timestamptz not null default now()
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  tatuador_id uuid not null references public.perfiles (id) on delete cascade,
  titulo text not null,
  texto text,
  zona text,
  estado public.estado_idea not null default 'abierta',
  creado_en timestamptz not null default now()
);

alter table public.flashes enable row level security;
alter table public.ideas enable row level security;

create policy "Flashes visibles para todos"
  on public.flashes for select
  using (true);

create policy "El tatuador gestiona sus propios flashes"
  on public.flashes for all
  using (auth.uid() = tatuador_id)
  with check (auth.uid() = tatuador_id);

create policy "Ideas visibles para todos"
  on public.ideas for select
  using (true);

create policy "El tatuador gestiona sus propias ideas"
  on public.ideas for all
  using (auth.uid() = tatuador_id)
  with check (auth.uid() = tatuador_id);
