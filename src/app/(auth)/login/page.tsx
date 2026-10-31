"use client";

import { useActionState } from "react";
import Link from "next/link";
import { iniciarSesion, type EstadoFormulario } from "@/app/auth/actions";
import { AccesoLayout } from "@/components/marca/AccesoLayout";
import { CampoFicha } from "@/components/marca/CampoFicha";

export default function Login() {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    iniciarSesion,
    null,
  );

  return (
    <AccesoLayout numero="000" lugar="acceso" volverA="/" lineas={["2", "Tat", "too."]}>
      <div className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-widest text-gris">
          Ficha de acceso
        </span>
        <h2 className="font-display text-5xl uppercase leading-none text-carbon sm:text-6xl">
          Entra
        </h2>
      </div>

      <form action={accion} className="flex flex-col gap-6" noValidate>
        <CampoFicha
          numero="01"
          etiqueta="Email"
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          required
        />
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label
              htmlFor="login-pass"
              className="text-[11px] uppercase tracking-widest text-carbon"
            >
              02 — Contraseña
            </label>
            <Link href="/recuperar" className="text-[11px] tracking-wider text-carbon">
              ¿La olvidaste?
            </Link>
          </div>
          <input
            id="login-pass"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="border-0 border-b-2 border-carbon bg-transparent py-2 font-mono text-[17px] text-carbon outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lima"
          />
        </div>

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
          <span>{enviando ? "Entrando…" : "Entrar"}</span>
          <span aria-hidden="true">→</span>
        </button>

        <div className="flex justify-between border-t border-dashed border-carbon pt-4 text-xs">
          <span>¿Primera vez?</span>
          <Link href="/registro" className="font-semibold tracking-wider">
            Crear cuenta →
          </Link>
        </div>
      </form>
    </AccesoLayout>
  );
}
