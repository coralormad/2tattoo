"use client";

import { useActionState, useState } from "react";
import { actualizarPerfil } from "@/app/panel/actions";
import { CampoFicha } from "@/components/marca/CampoFicha";
import { AreaFicha } from "@/components/marca/AreaFicha";
import { CabeceraTarjeta, CLASE_BOTON_PRIMARIO, CLASE_TARJETA } from "@/components/panel/ui";

type FormularioPerfilProps = {
  nombre: string | null;
  usuario: string | null;
  bio: string | null;
  ciudad: string | null;
  estilos: string | null;
  notas: string | null;
};

export function FormularioPerfil({ nombre, usuario, bio, ciudad, estilos, notas }: FormularioPerfilProps) {
  const [estado, accion, enviando] = useActionState(actualizarPerfil, null);
  const [v, setV] = useState({
    usuario: usuario ?? "",
    ciudad: ciudad ?? "",
    estilos: estilos ?? "",
    bio: bio ?? "",
    notas: notas ?? "",
  });
  const cambiar = (campo: keyof typeof v) => (e: { target: { value: string } }) =>
    setV((p) => ({ ...p, [campo]: e.target.value }));

  const usuarioValido = /^[a-z0-9_.-]{3,30}$/.test(v.usuario);
  const listaEstilos = v.estilos
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
      <form action={accion} noValidate className={CLASE_TARJETA}>
        <CabeceraTarjeta titulo="Tu perfil público" numero="00" />

        <div className="flex flex-col gap-6 p-5">
          <div className="flex flex-col gap-2">
            <CampoFicha
              numero="01"
              etiqueta="Usuario"
              id="perfil-usuario"
              name="usuario"
              type="text"
              value={v.usuario}
              onChange={cambiar("usuario")}
              placeholder="lucia.lineas"
              pattern="[a-z0-9_.-]{3,30}"
              required
            />
            <span
              className={`font-mono text-[11px] ${
                v.usuario && !usuarioValido ? "text-[#b3221c]" : "text-[#555]"
              }`}
            >
              2tattoo.com/artista/
              <span className={`px-0.5 ${usuarioValido ? "bg-lima text-tinta" : ""}`}>
                {v.usuario || "tu-usuario"}
              </span>
              {v.usuario && !usuarioValido && " · solo minúsculas, números, . _ - (3–30)"}
            </span>
          </div>

          <CampoFicha
            numero="02"
            etiqueta="Ciudad"
            id="perfil-ciudad"
            name="ciudad"
            type="text"
            value={v.ciudad}
            onChange={cambiar("ciudad")}
            placeholder="Sevilla"
          />

          <CampoFicha
            numero="03"
            etiqueta="Estilos (separados por coma)"
            id="perfil-estilos"
            name="estilos"
            type="text"
            value={v.estilos}
            onChange={cambiar("estilos")}
            placeholder="Línea fina, Botánico"
          />

          <AreaFicha
            numero="04"
            etiqueta="Bio"
            id="perfil-bio"
            name="bio"
            rows={3}
            value={v.bio}
            onChange={cambiar("bio")}
            placeholder="Dibujo plantas que encuentro paseando…"
          />

          <div className="flex flex-col gap-2">
            <AreaFicha
              numero="05"
              etiqueta="Notas (privadas)"
              id="perfil-notas"
              name="notas"
              rows={3}
              value={v.notas}
              onChange={cambiar("notas")}
              placeholder="Recordatorios, condiciones, cosas que solo tú necesitas ver…"
            />
            <span className="font-mono text-[11px] text-[#555]">
              Solo las ves tú · no aparecen en tu perfil público.
            </span>
          </div>

          {estado?.error && (
            <p role="alert" className="text-sm font-semibold text-[#b3221c]">
              {estado.error}
            </p>
          )}

          <button type="submit" disabled={enviando} className={CLASE_BOTON_PRIMARIO}>
            <span>{enviando ? "Guardando…" : "Guardar perfil"}</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>

      {/* Vista previa en directo */}
      <aside aria-label="Vista previa de tu perfil" className="lg:sticky lg:top-24">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-gris">Así te verán</p>
        <div className="rotate-1 border-2 border-papel/20 bg-tinta p-6 shadow-[8px_8px_0_var(--color-lima)] transition-transform hover:rotate-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="font-display block text-4xl uppercase leading-none text-papel">
                {nombre ?? "Tu nombre"}
              </span>
              <span className="mt-1 block font-mono text-[12px] text-lima">@{v.usuario || "tu-usuario"}</span>
            </div>
            <span className="shrink-0 border border-papel/30 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-gris-claro">
              {v.ciudad || "Ciudad"}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {(listaEstilos.length ? listaEstilos : ["Tus estilos"]).map((e) => (
              <span
                key={e}
                className="rounded-full border border-lima/60 px-3 py-1 font-mono text-[11px] uppercase text-lima"
              >
                {e}
              </span>
            ))}
          </div>

          <p className="mt-5 whitespace-pre-line border-t border-dashed border-papel/20 pt-4 text-[13px] leading-relaxed text-gris-claro">
            {v.bio || "Cuenta quién hay detrás de la aguja."}
          </p>

          <div className="mt-5 flex gap-2 font-mono text-[10px] uppercase tracking-widest text-gris">
            <span className="border-b-2 border-lima pb-1 text-papel">Flash</span>
            <span className="pb-1">Ideas</span>
            <span className="pb-1">Tatuado</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
