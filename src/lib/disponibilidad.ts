// Calcula los huecos reales de un tatuador: horario semanal recurrente
// menos bloqueos puntuales, y además menos lo que ya tenga ocupado en su
// Google Calendar (si lo ha conectado). No descuenta citas ya
// confirmadas todavía (eso llega con la Fase 7c, cuando una solicitud
// aceptada se convierta en cita real en vez de solo bloquear el flash
// único).
import type { SupabaseClient } from "@supabase/supabase-js";
import { obtenerOcupacionGoogle } from "@/lib/google-calendar";

export type Hueco = {
  fecha: string; // YYYY-MM-DD
  diaLabel: string; // "LUN 3 NOV"
  horaInicio: string; // "11:00"
  horaFin: string; // "13:00"
};

type FilaDisponibilidad = { dia_semana: number; hora_inicio: string; hora_fin: string };
type FilaBloqueo = { fecha: string; hora_inicio: string | null; hora_fin: string | null };

const DIAS_ES = ["", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MESES_ES = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

const DURACION_HUECO_POR_DEFECTO_MIN = 120; // si el flash no trae duracion_min
const DIAS_A_MIRAR = 14;

function aMinutos(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function aHoraTexto(minutos: number) {
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function diaIso(fecha: Date) {
  const js = fecha.getDay(); // 0=domingo..6=sábado
  return js === 0 ? 7 : js;
}

function fechaISO(fecha: Date) {
  // Fecha local (no UTC): toISOString() daba el día anterior entre 00:00 y 01:00 en Madrid.
  const m = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const d = fecha.getDate().toString().padStart(2, "0");
  return `${fecha.getFullYear()}-${m}-${d}`;
}

export async function obtenerHuecosDisponibles(
  supabase: SupabaseClient,
  tatuadorId: string,
  duracionMin: number = DURACION_HUECO_POR_DEFECTO_MIN,
): Promise<Hueco[]> {
  const [{ data: disponibilidad }, { data: bloqueos }] = await Promise.all([
    supabase
      .from("disponibilidad")
      .select("dia_semana, hora_inicio, hora_fin")
      .eq("tatuador_id", tatuadorId),
    supabase
      .from("bloqueos")
      .select("fecha, hora_inicio, hora_fin")
      .eq("tatuador_id", tatuadorId)
      .gte("fecha", fechaISO(new Date())),
  ]);

  const porDia = new Map<number, FilaDisponibilidad>();
  for (const d of (disponibilidad ?? []) as FilaDisponibilidad[]) {
    porDia.set(d.dia_semana, d);
  }

  const bloqueosPorFecha = new Map<string, FilaBloqueo[]>();
  for (const b of (bloqueos ?? []) as FilaBloqueo[]) {
    const lista = bloqueosPorFecha.get(b.fecha) ?? [];
    lista.push(b);
    bloqueosPorFecha.set(b.fecha, lista);
  }

  const huecos: Hueco[] = [];
  const hoy = new Date();

  // Sin tope total: antes se cortaba en 24 huecos y los últimos días
  // laborables (p. ej. jueves y viernes) nunca llegaban a la lista.
  for (let i = 0; i < DIAS_A_MIRAR; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    const fechaStr = fechaISO(fecha);
    const diario = porDia.get(diaIso(fecha));
    if (!diario) continue;

    const diaBloqueado = bloqueosPorFecha.get(fechaStr) ?? [];
    if (diaBloqueado.some((b) => !b.hora_inicio && !b.hora_fin)) continue; // día entero bloqueado

    const inicio = aMinutos(diario.hora_inicio);
    const fin = aMinutos(diario.hora_fin);

    for (let cursor = inicio; cursor + duracionMin <= fin; cursor += duracionMin) {
      const bloqueInicio = cursor;
      const bloqueFin = cursor + duracionMin;
      if (i === 0 && bloqueInicio <= hoy.getHours() * 60 + hoy.getMinutes()) continue; // hoy, ya pasado

      const chocaConBloqueo = diaBloqueado.some((b) => {
        if (!b.hora_inicio || !b.hora_fin) return false;
        const bi = aMinutos(b.hora_inicio);
        const bf = aMinutos(b.hora_fin);
        return bloqueInicio < bf && bloqueFin > bi;
      });
      if (chocaConBloqueo) continue;

      huecos.push({
        fecha: fechaStr,
        diaLabel: `${DIAS_ES[diaIso(fecha)]} ${fecha.getDate()} ${MESES_ES[fecha.getMonth()]}`,
        horaInicio: aHoraTexto(bloqueInicio),
        horaFin: aHoraTexto(bloqueFin),
      });
    }
  }

  if (huecos.length === 0) return huecos;

  // Si el tatuador tiene Google Calendar conectado, quitamos los huecos
  // que choquen con algo que ya tenga ahí metido (otro trabajo, una cita
  // personal, etc.). Nota: comparamos horas locales del servidor contra
  // los horarios de Google tal cual; si la app se despliega en un
  // servidor con otra zona horaria (p. ej. Vercel en UTC), habrá que
  // fijar TZ=Europe/Madrid en las variables de entorno de producción.
  const desde = new Date(`${huecos[0].fecha}T00:00:00`);
  const hasta = new Date(`${huecos[huecos.length - 1].fecha}T23:59:59`);
  const ocupadoGoogle = await obtenerOcupacionGoogle(tatuadorId, desde, hasta);
  if (ocupadoGoogle.length === 0) return huecos;

  return huecos.filter((h) => {
    const inicio = new Date(`${h.fecha}T${h.horaInicio}:00`).getTime();
    const fin = new Date(`${h.fecha}T${h.horaFin}:00`).getTime();
    return !ocupadoGoogle.some((o) => {
      const oi = new Date(o.inicio).getTime();
      const of = new Date(o.fin).getTime();
      return inicio < of && fin > oi;
    });
  });
}
