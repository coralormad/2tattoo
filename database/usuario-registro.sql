-- 2Tattoo · Perfil público del artista: captura el "usuario" (handle) al
-- registrarse. Reemplaza la función del trigger de schema.sql (mismo
-- trigger, solo cambia qué columnas rellena).
-- Ejecutar en Supabase → SQL Editor.

create or replace function public.gestionar_nuevo_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, rol, nombre, usuario)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'rol')::public.rol_usuario, 'cliente'),
    new.raw_user_meta_data ->> 'nombre',
    new.raw_user_meta_data ->> 'usuario'
  );
  return new;
end;
$$;
