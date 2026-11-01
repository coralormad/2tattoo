"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

// Intro "Hora de tatuar" al entrar al panel: el texto se traza en tinta, cae una
// gota y una mancha lima cubre la pantalla y descubre el panel.
// Se ve una vez por sesión (cookie de sesión `panel_intro`, la lee el servidor),
// se salta con clic o Esc y no aparece con prefers-reduced-motion (motion-reduce:hidden).
const T = { texto: 0.75, cola: 0.18, gota: 0.25, mancha: 0.5 };
const INI_COLA = T.texto;
const INI_GOTA = INI_COLA + T.cola;
const INI_MANCHA = INI_GOTA + T.gota;

const marcarVista = () => {
  document.cookie = "panel_intro=1; path=/; SameSite=Lax";
};

const EVENTO_REPETIR = "2tattoo:repetir-intro";

// Cápsula para volver a ver la intro (dispara un evento que escucha IntroTinta).
export function BotonRepetirIntro() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(EVENTO_REPETIR))}
      className="group inline-flex items-center gap-2 rounded-full border border-papel/25 bg-papel/5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-gris-claro backdrop-blur-md transition-colors hover:border-lima hover:text-lima motion-reduce:hidden"
    >
      <svg
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-[300deg]"
        aria-hidden="true"
      >
        <path d="M13 8a5 5 0 1 1-1.6-3.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12.6 1.6v3.2H9.4z" fill="currentColor" />
      </svg>
      Hora de tatuar
      <span className="sr-only">: repetir la animación de entrada</span>
    </button>
  );
}

export function IntroTinta({ saludo, inicial = true }: { saludo: string; inicial?: boolean }) {
  const [visible, setVisible] = useState(inicial);
  const [vuelta, setVuelta] = useState(0);

  const terminar = () => {
    marcarVista();
    setVisible(false);
  };

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      marcarVista();
      setVisible(false);
    };
    const alRepetir = () => {
      setVuelta((v) => v + 1);
      setVisible(true);
    };
    window.addEventListener("keydown", alPulsar);
    window.addEventListener(EVENTO_REPETIR, alRepetir);
    return () => {
      window.removeEventListener("keydown", alPulsar);
      window.removeEventListener(EVENTO_REPETIR, alRepetir);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`intro-${vuelta}`}
          onClick={terminar}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="reticula fixed inset-0 z-[80] grid cursor-pointer place-items-center overflow-hidden bg-papel text-carbon motion-reduce:hidden"
        >
          <div className="relative w-[min(92vw,900px)]">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-carbon/60 sm:text-[13px]"
            >
              {saludo}
            </motion.p>

            <svg viewBox="0 0 900 260" className="block w-full overflow-visible" aria-hidden="true">
              <motion.text
                x="20"
                y="170"
                textLength="780"
                lengthAdjust="spacingAndGlyphs"
                className="font-display uppercase"
                fontSize="150"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="2600"
                initial={{ strokeDashoffset: 2600, fillOpacity: 0 }}
                animate={{ strokeDashoffset: 0, fillOpacity: 1 }}
                transition={{
                  strokeDashoffset: { duration: T.texto, ease: "easeInOut" },
                  fillOpacity: { delay: T.texto * 0.7, duration: 0.3 },
                }}
                fill="currentColor"
              >
                Hora de tatuar
              </motion.text>

              {/* Cola del trazo que sube hasta donde nace la gota */}
              <motion.path
                d="M806 168 C 830 170, 848 160, 852 138"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: INI_COLA, duration: T.cola, ease: "easeOut" }}
              />

              {/* Gota */}
              <motion.path
                d="M852 0 c 0 0 -9 12 -9 19 a 9 9 0 0 0 18 0 c 0 -7 -9 -19 -9 -19 z"
                fill="currentColor"
                initial={{ y: 132, opacity: 0, scaleY: 1 }}
                animate={{ y: [132, 132, 236], opacity: [0, 1, 1], scaleY: [1, 1.25, 0.6] }}
                transition={{ delay: INI_GOTA, duration: T.gota, times: [0, 0.2, 1], ease: "easeIn" }}
              />
            </svg>

            {/* Mancha lima que crece desde el impacto de la gota */}
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 bg-lima"
              style={{
                left: `${(852 / 900) * 100}%`,
                top: "calc(100% - 4px)",
                borderRadius: "58% 42% 63% 37% / 45% 58% 42% 55%",
              }}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 90, rotate: 40 }}
              transition={{ delay: INI_MANCHA, duration: T.mancha, ease: [0.7, 0, 0.84, 0] }}
              onAnimationComplete={terminar}
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              terminar();
            }}
            className="absolute bottom-6 right-6 font-mono text-[11px] uppercase tracking-widest text-carbon/60 underline decoration-dashed underline-offset-4 hover:text-carbon"
          >
            Saltar →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
