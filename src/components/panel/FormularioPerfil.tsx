"use client";

import { useActionState } from "react";
import { actualizarPerfil } from "@/app/panel/actions";
import { CampoFicha } from "@/components/marca/CampoFicha";
import { AreaFicha } from "@/components/marca/AreaFicha";

type FormularioPerfilProps = {
  usuario: string | null;
  bio: string | null;
  ciudad: string | null;
  estilos: string | null;
};

export function FormularioPerfil({ usuario, bio, ciudad, estilos }: FormularioPerfilProps) {
  const [estado, accion, enviando] = useActionState(actualizarPerfil, null);

  return (
    <form
      action={accion}
      noValidate
      className="flex max-w-md flex-col gap-5 border-b-2 border-r-2 border-carbon bg-papel-claro p-6 text-carbon"
    >
      <div className="flex justify-between border-b border-dashed border-carbon pb-3 text-[11px] font-semibold uppercase tracking-widest">
        <span>Tu perfil público</span>
        <span>Nº 00</span>
      </div>

      <div className="flex flex-col gap-2">
        <CampoFicha
          numero="01"
          etiqueta="Usuario"
          id="perfil-usuario"
          name="usuario"
          type="text"
          defaultValue={usuario ?? ""}
          placeholder="lucia.lineas"
          pattern="[a-z0-9_.-]{3,30}"
          required
        />
        <span className="-mt-1 text-[11px] text-[#555]">
          Tu URL pública: 2tattoo.com/artista/tu-usuario. Solo minúsculas, números, puntos y
          guiones.
        </span>
      </div>

      <CampoFicha
        numero="02"
        etiqueta="Ciudad"
        id="perfil-ciudad"
        name="ciudad"
        type="text"
        defaultValue={ciudad ?? ""}
        placeholder="Sevilla"
      />
      <CampoFicha
        numero="03"
        etiqueta="Estilos (separados por coma)"
        id="perfil-estilos"
        name="estilos"
        type="text"
        defaultValue={estilos ?? ""}
        placeholder="Línea fina, Botánico"
      />
      <AreaFicha
        numero="04"
        etiqueta="Bio"
        id="perfil-bio"
        name="bio"
        rows={3}
        defaultValue={bio ?? ""}
        placeholder="Dibujo plantas que encuentro paseando…"
      />

      {estado?.error && (
        <p role="alert" className="text-sm text-[#b3221c]">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="font-display flex items-center justify-between border-2 border-carbon bg-carbon px-5 py-4 text-xl uppercase text-papel shadow-[6px_6px_0_var(--color-lima)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        <span>{enviando ? "Guardando…" : "Guardar perfil"}</span>
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
