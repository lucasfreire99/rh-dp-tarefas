"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido"),
  senha: z.string().min(1, "Informe a senha"),
});

export async function entrar(_: { erro?: string } | undefined, formData: FormData) {
  const p = schema.safeParse({ email: formData.get("email"), senha: formData.get("senha") });
  if (!p.success) return { erro: p.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: p.data.email, password: p.data.senha });
  if (error) return { erro: "E-mail ou senha incorretos." };
  redirect("/dashboard");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
