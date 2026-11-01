-- 2Tattoo · Postulaciones de clientes a ideas ("busco lienzo")
-- Ejecutar en Supabase → SQL Editor (después de database/flashes-ideas.sql)

create type public.estado_postulacion as enum ('pendiente', 'aceptada', 'rechazada');

create table public.postulaciones (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas (id) on delete cascade,
  cliente_id uuid not null references public.perfiles (id) on delete cascade,
  mensaje text not null check (char_length(mensaje) between 10 and 1000),
  estado public.estado_postulacion not null default 'pendiente',
  creado_en timestamptz not null default now(),
  unique (idea_id, cliente_id)
);

alter table public.postulaciones enable row level security;

create policy "El cliente ve sus propias postulaciones"
  on public.postulaciones for select
  using (auth.uid() = cliente_id);

create policy "El tatuador ve las postulaciones a sus ideas"
  on public.postulaciones for select
  using (exists (
    select 1 from public.ideas
    where ideas.id = postulaciones.idea_id
      and ideas.tatuador_id = auth.uid()
  ));

-- Solo clientes, solo a su nombre y solo a ideas abiertas.
create policy "El cliente se postula a ideas abiertas"
  on public.postulaciones for insert
  with check (
    auth.uid() = cliente_id
    and exists (
      select 1 from public.perfiles
      where perfiles.id = auth.uid() and perfiles.rol = 'cliente'
    )
    and exists (
      select 1 from public.ideas
      where ideas.id = postulaciones.idea_id and ideas.estado = 'abierta'
    )
  );
