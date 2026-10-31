-- 2Tattoo · Agenda del tatuador (Fase 7a: horario propio, sin Google Calendar)
-- Ejecutar en Supabase → SQL Editor (después de database/solicitudes.sql)

-- Horario semanal recurrente. dia_semana: 1=lunes … 7=domingo (ISO).
create table public.disponibilidad (
  id uuid primary key default gen_random_uuid(),
  tatuador_id uuid not null references public.perfiles (id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 1 and 7),
  hora_inicio time not null,
  hora_fin time not null,
  unique (tatuador_id, dia_semana),
  check (hora_fin > hora_inicio)
);

-- Bloqueos puntuales (vacaciones, convenciones, otro trabajo ese día/hueco
-- concreto). hora_inicio/hora_fin null = bloquea el día entero.
create table public.bloqueos (
  id uuid primary key default gen_random_uuid(),
  tatuador_id uuid not null references public.perfiles (id) on delete cascade,
  fecha date not null,
  hora_inicio time,
  hora_fin time,
  motivo text,
  creado_en timestamptz not null default now()
);

alter table public.disponibilidad enable row level security;
alter table public.bloqueos enable row level security;

-- Visibles para todos: la ficha de flash necesita calcular huecos para
-- cualquier visitante, no solo para el propio tatuador.
create policy "Disponibilidad visible para todos"
  on public.disponibilidad for select
  using (true);

create policy "El tatuador gestiona su propia disponibilidad"
  on public.disponibilidad for all
  using (auth.uid() = tatuador_id)
  with check (auth.uid() = tatuador_id);

create policy "Bloqueos visibles para todos"
  on public.bloqueos for select
  using (true);

create policy "El tatuador gestiona sus propios bloqueos"
  on public.bloqueos for all
  using (auth.uid() = tatuador_id)
  with check (auth.uid() = tatuador_id);

-- La solicitud pasa a guardar un hueco real (fecha + hora) en vez de un
-- texto libre. Se mantiene fecha_preferida por compatibilidad, sin usarla
-- en el código nuevo.
alter table public.solicitudes add column fecha date;
alter table public.solicitudes add column hora_inicio time;
alter table public.solicitudes add column hora_fin time;
