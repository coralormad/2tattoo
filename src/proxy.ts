// Next.js 16: "proxy" sustituye a "middleware"
import type { NextRequest } from "next/server";
import { actualizarSesion } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return actualizarSesion(request);
}

export const config = {
  matcher: [
    // Todo salvo estáticos e imágenes
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
