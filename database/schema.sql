-- 2Tattoo · esquema inicial (Fase 4 Paso 3)
-- Ejecutar en Supabase → SQL Editor

create type public.rol_usuario as enum ('cliente', 'tatuador');

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rol public.rol_usuario not null default 'cliente',
  nombre text,
  usuario text unique,
  bio text,
  avatar_url text,
  creado_en timestamptz not null default now()
);

alter table public.perfiles enable row level security;

create policy "Perfiles visibles para todos"
  on public.perfiles for select
  using (true);

create policy "Cada usuario edita su propio perfil"
  on public.perfiles for update
  using (auth.uid() = id);

-- Crea el perfil automáticamente al registrarse,
-- leyendo el rol elegido en el formulario de registro.
create function public.gestionar_nuevo_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, rol, nombre)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'rol')::public.rol_usuario, 'cliente'),
    new.raw_user_meta_data ->> 'nombre'
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.gestionar_nuevo_usuario();
