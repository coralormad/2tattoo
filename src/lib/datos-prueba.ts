// Datos de muestra para maquetar el Home mientras no existen las tablas
// de flashes, ideas y artistas en la base de datos (próximo paso).
// TODO: sustituir por consultas reales a Supabase.

import type { Flash } from "@/components/marca/TarjetaFlash";
import type { Idea } from "@/components/marca/TarjetaIdea";
import type { Artista } from "@/components/marca/TarjetaArtista";

export const flashesDeMuestra: Flash[] = [
  { numero: "Nº 012", tipo: "FLASH ÚNICO", titulo: "Serpiente", medida: "12 cm", artista: "@lucia.lineas", ciudad: "Sevilla", icono: "snake" },
  { numero: "Nº 011", tipo: "FLASH", titulo: "Daga", medida: "8 cm", artista: "@tinta.norte", ciudad: "Bilbao", icono: "dagger" },
  { numero: "Nº 027", tipo: "FLASH ÚNICO", titulo: "Luna", medida: "6 cm", artista: "@mar.blackwork", ciudad: "Valencia", icono: "moon" },
  { numero: "Nº 004", tipo: "FLASH", titulo: "Estrella", medida: "5 cm", artista: "@lucia.lineas", ciudad: "Sevilla", icono: "star" },
];

export const ideasDeMuestra: Idea[] = [
  { artista: "@lucia.lineas", titulo: "Polilla ornamental", texto: "Quiero hacerla en el pecho, negro sólido y una sola sesión.", zona: "Pecho · 20 cm" },
  { artista: "@mar.blackwork", titulo: "Serpiente en espalda", texto: "Pieza grande por sesiones. Busco a alguien con ganas de proyecto largo.", zona: "Espalda completa" },
  { artista: "@tinta.norte", titulo: "Manos y flores", texto: "Composición botánica para antebrazo, línea fina.", zona: "Antebrazo · 15 cm" },
];

export const artistasDeMuestra: Artista[] = [
  { nombre: "Lucía M.", ciudad: "Sevilla", estilos: "Línea fina · Botánico" },
  { nombre: "Mar R.", ciudad: "Valencia", estilos: "Blackwork · Ornamental" },
  { nombre: "Iker T.", ciudad: "Bilbao", estilos: "Tradicional · Flash" },
];
