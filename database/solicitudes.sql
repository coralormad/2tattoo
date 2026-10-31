-- 2Tattoo · Ficha de flash + reserva
-- Ejecutar en Supabase → SQL Editor (después de database/flashes-ideas.sql)

create type public.estado_solicitud as enum ('pendiente', 'aceptada', 'rechazada');

create table public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  flash_id uuid not null references public.flashes (id) on delete cascade,
  cliente_id uuid not null references public.perfiles (id) on delete cascade,
  zona text,
  fecha_preferida text,
  nota text,
  estado public.estado_solicitud not null default 'pendiente',
  creado_en timestamptz not null default now()
);

alter table public.solicitudes enable row level security;

create policy "El cliente ve sus propias solicitudes"
  on public.solicitudes for select
  using (auth.uid() = cliente_id);

create policy "El tatuador ve las solicitudes de sus flashes"
  on public.solicitudes for select
  using (exists (
    select 1 from public.flashes
    where flashes.id = solicitudes.flash_id
      and flashes.tatuador_id = auth.uid()
  ));

create policy "El cliente crea sus propias solicitudes"
  on public.solicitudes for insert
  with check (auth.uid() = cliente_id);

-- Bloquea el flash único 48 h (en la práctica, hasta que el tatuador
-- responda) en cuanto llega una solicitud, y evita reservas dobles con
-- un bloqueo de fila (FOR UPDATE) dentro de la misma transacción del insert.
create function public.bloquear_flash_al_solicitar()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  f record;
begin
  select estado, tipo into f from public.flashes where id = new.flash_id for update;

  if f.estado <> 'disponible' then
    raise exception 'Este flash ya no está disponible.';
  end if;

  if f.tipo = 'flash_unico' then
    update public.flashes set estado = 'reservado' where id = new.flash_id;
  end if;

  return new;
end;
$$;

create trigger al_crear_solicitud
  before insert on public.solicitudes
  for each row execute function public.bloquear_flash_al_solicitar();
