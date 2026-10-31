"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registrarse, type EstadoFormulario } from "@/app/auth/actions";
import { AccesoLayout } from "@/components/marca/AccesoLayout";
import { CampoFicha } from "@/components/marca/CampoFicha";

export default function Registro() {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    registrarse,
    null,
  );
  const [rol, setRol] = useState<"cliente" | "tatuador">("cliente");

  return (
    <AccesoLayout numero="001" lugar="alta" volverA="/login" lineas={["Crear", "cuen", "ta."]}>
      <div className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-widest text-gris">
          Ficha de alta
        </span>
        <h2 className="font-display text-5xl uppercase leading-none text-carbon sm:text-6xl">
          Únete
        </h2>
      </div>

      <form action={accion} className="flex flex-col gap-6" noValidate>
        <div
          role="radiogroup"
          aria-label="Tipo de cuenta"
          className="grid grid-cols-2 border-2 border-carbon"
        >
          {(["cliente", "tatuador"] as const).map((opcion, i) => {
            const activo = rol === opcion;
            return (
              <button
                key={opcion}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => setRol(opcion)}
                className={`py-3.5 font-mono text-[13px] font-semibold uppercase tracking-widest ${
                  i === 0 ? "border-r-2 border-carbon" : ""
                } ${activo ? "bg-carbon text-papel" : "bg-transparent text-carbon"}`}
              >
                {opcion}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="rol" value={rol} />

        <CampoFicha
          numero="01"
          etiqueta="Nombre"
          id="registro-nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          placeholder={rol === "tatuador" ? "Tu nombre de artista" : "Tu nombre"}
          required
        />
        <CampoFicha
          numero="02"
          etiqueta="Email"
          id="registro-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          required
        />
        <CampoFicha
          numero="03"
          etiqueta="Contraseña"
          id="registro-pass"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="-mt-3 text-[11px] text-gris">Mínimo 8 caracteres.</p>

        {estado?.error && (
          <p role="alert" className="text-sm text-[#b3221c]">
            {estado.error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="font-display flex items-center justify-between border-2 border-carbon bg-carbon px-5 py-4 text-2xl uppercase text-papel shadow-[6px_6px_0_var(--color-lima)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          <span>{enviando ? "Creando…" : "Crear cuenta"}</span>
          <span aria-hidden="true">→</span>
        </button>

        <div className="flex justify-between border-t border-dashed border-carbon pt-4 text-xs">
          <span>¿Ya tienes cuenta?</span>
          <Link href="/login" className="font-semibold tracking-wider">
            Entrar →
          </Link>
        </div>
      </form>
    </AccesoLayout>
  );
}
