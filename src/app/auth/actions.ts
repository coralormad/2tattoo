"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type EstadoFormulario = { error: string } | null;

export async function iniciarSesion(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Confirma tu email antes de entrar. Revisa tu bandeja de entrada." };
    }
    return { error: "Email o contraseña incorrectos." };
  }

  redirect("/");
}

export async function registrarse(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const rol = formData.get("rol") === "tatuador" ? "tatuador" : "cliente";

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { rol, nombre: nombre || null },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "Ya existe una cuenta con ese email." };
    }
    return { error: "No se pudo crear la cuenta. Inténtalo de nuevo." };
  }

  redirect("/registro/revisa-tu-email");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Confirma la cuenta SOLO cuando la persona pulsa el botón, nunca al
 * abrirse el enlace: muchos gestores de correo (Gmail, Outlook) visitan
 * los enlaces del email automáticamente para escanearlos, y eso gastaría
 * el código de un solo uso antes de que el usuario lo pulse de verdad.
 */
export async function confirmarCuenta(formData: FormData) {
  const code = formData.get("code");
  const token_hash = formData.get("token_hash");
  const type = formData.get("type");
  const next = String(formData.get("next") ?? "/");

  const supabase = await createClient();

  if (typeof code === "string" && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  } else if (typeof token_hash === "string" && token_hash && typeof type === "string") {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });
    if (!error) redirect(next);
  }

  redirect("/auth/auth-code-error");
}
