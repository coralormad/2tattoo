-- 2Tattoo · Paso 8: aceptar/rechazar solicitudes
-- Ejecutar en Supabase → SQL Editor (después de database/disponibilidad.sql)

alter table public.solicitudes add column respondido_en timestamptz;

-- El tatuador responde a una solicitud de uno de sus flashes.
-- Todo en una transacción: comprueba propiedad y estado, cambia el estado
-- y, si se rechaza un flash único, lo vuelve a dejar disponible.
-- security definer: no hace falta abrir una política de UPDATE sobre
-- solicitudes (el tatuador no puede tocar zona/nota/fecha del cliente).
create or replace function public.responder_solicitud(
  p_solicitud uuid,
  p_estado public.estado_solicitud
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  s record;
begin
  if p_estado not in ('aceptada', 'rechazada') then
    raise exception 'Estado no válido.';
  end if;

  select so.estado, so.flash_id, f.tipo, f.tatuador_id
    into s
    from public.solicitudes so
    join public.flashes f on f.id = so.flash_id
   where so.id = p_solicitud
     for update of so, f;

  if not found or s.tatuador_id <> auth.uid() then
    raise exception 'Solicitud no encontrada.';
  end if;

  if s.estado <> 'pendiente' then
    raise exception 'Esta solicitud ya tiene respuesta.';
  end if;

  update public.solicitudes
     set estado = p_estado, respondido_en = now()
   where id = p_solicitud;

  if p_estado = 'rechazada' and s.tipo = 'flash_unico' then
    update public.flashes
       set estado = 'disponible'
     where id = s.flash_id and estado = 'reservado';
  end if;
end;
$$;

revoke all on function public.responder_solicitud(uuid, public.estado_solicitud) from public, anon;
grant execute on function public.responder_solicitud(uuid, public.estado_solicitud) to authenticated;
