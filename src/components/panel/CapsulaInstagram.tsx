"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { desconectarInstagram } from "@/app/panel/actions";
import { SelectorInstagram } from "@/components/panel/SelectorInstagram";

const CLAVE_DESCARTE = "2tattoo:capsula-instagram-descartada";
const sinSuscripcion = () => () => {};
const leerDescarte = () => {
  try {
    return sessionStorage.getItem(CLAVE_DESCARTE) === "1";
  } catch {
    return false;
  }
};

function IconoInstagram() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
      <rect x="4" y="4" width="24" height="24" rx="8" fill="#F3EEE4" stroke="#0B0B0B" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="6.5" fill="none" stroke="#0B0B0B" strokeWidth="2" />
      <circle cx="23" cy="9.5" r="1.6" fill="#D4FF3A" />
    </svg>
  );
}

/** Botón redondo flotante para Instagram, mismo lenguaje que CapsulaGoogle.
 *  - Sin conectar: rebota + onda expansiva roja, con burbuja de sugerencia.
 *  - Conectado: halo lima suave; al pulsar deja desconectar o importar fotos. */
export function CapsulaInstagram({ conectado, username }: { conectado: boolean; username: string | null }) {
  const reducir = useReducedMotion();
  const [abierta, setAbierta] = useState(false);
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [descartadaAhora, setDescartadaAhora] = useState(false);
  const descartadaGuardada = useSyncExternalStore(sinSuscripcion, leerDescarte, () => false);
  const descartada = descartadaGuardada || descartadaAhora;

  const descartar = () => {
    setAbierta(false);
    setDescartadaAhora(true);
    try {
      sessionStorage.setItem(CLAVE_DESCARTE, "1");
    } catch {}
  };

  const llamar = !conectado && !descartada && !abierta && !reducir;
  const colorOnda = conectado ? "bg-lima" : "bg-[#ff6b5e]";

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <AnimatePresence>
          {abierta && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9, originX: 1, originY: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              role="dialog"
              aria-label="Instagram"
              className="w-72 rounded-3xl border border-white/15 bg-tinta/75 p-5 text-papel shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-gris-claro">
                  Instagram
                </span>
                <span className={`font-mono text-[10px] uppercase tracking-widest ${conectado ? "text-lima" : "text-[#ff6b5e]"}`}>
                  {conectado ? "● Conectado" : "● Sin conectar"}
                </span>
              </div>
              {conectado ? (
                <>
                  <p className="mt-2 text-[13px] leading-relaxed text-gris-claro">
                    {username ? (
                      <>
                        Conectado como <span className="text-lima">@{username}</span>.{" "}
                      </>
                    ) : null}
                    Importa tus fotos como flashes nuevos.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectorAbierto(true)}
                      className="rounded-full bg-lima px-4 py-2 font-mono text-[11px] font-semibold uppercase text-tinta"
                    >
                      Importar fotos
                    </button>
                    <form action={desconectarInstagram}>
                      <button
                        type="submit"
                        className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#ff6b5e]"
                      >
                        Desconectar
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-2 text-[13px] leading-relaxed text-gris-claro">
                    <span className="text-lima">Sugerencia:</span> conecta tu Instagram y convierte tus
                    fotos en flashes sin subirlas una a una.
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <a
                      href="/auth/instagram/conectar"
                      className="rounded-full bg-lima px-4 py-2 font-mono text-[11px] font-semibold uppercase text-tinta no-underline"
                    >
                      Conectar →
                    </a>
                    <button
                      type="button"
                      onClick={descartar}
                      className="font-mono text-[11px] uppercase text-gris-claro underline decoration-dashed underline-offset-2"
                    >
                      Ahora no
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="group relative flex items-center">
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full border border-white/15 bg-tinta/75 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-papel opacity-0 backdrop-blur-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            Instagram · {conectado ? "on" : "off"}
          </span>

          {!reducir && (llamar || conectado) && (
            <motion.span
              aria-hidden="true"
              className={`absolute inset-0 rounded-full ${colorOnda}`}
              initial={{ scale: 1, opacity: 0.45 }}
              animate={{ scale: conectado ? 1.35 : 1.8, opacity: 0 }}
              transition={{ duration: conectado ? 2.4 : 1.6, repeat: Infinity, repeatDelay: conectado ? 3 : 1.2, ease: "easeOut" }}
            />
          )}

          <motion.button
            type="button"
            onClick={() => setAbierta((v) => !v)}
            aria-expanded={abierta}
            aria-label={`Instagram: ${conectado ? "conectado" : "sin conectar"}`}
            animate={llamar ? { y: [0, -14, 0, -5, 0], rotate: [0, -6, 4, 0, 0] } : { y: 0, rotate: 0 }}
            transition={llamar ? { duration: 1, ease: "easeOut", repeat: Infinity, repeatDelay: 3.5 } : { duration: 0.2 }}
            whileHover={reducir ? undefined : { scale: 1.08 }}
            whileTap={reducir ? undefined : { scale: 0.94 }}
            className="relative grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-tinta/70 shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl"
          >
            <IconoInstagram />
            <span
              aria-hidden="true"
              className={`absolute right-1 top-1 h-3.5 w-3.5 rounded-full border-2 border-tinta ${conectado ? "bg-lima" : "bg-[#ff6b5e]"}`}
            />
          </motion.button>
        </div>
      </div>

      {selectorAbierto && <SelectorInstagram onCerrar={() => setSelectorAbierto(false)} />}
    </>
  );
}
