"use client";

import { useActionState } from "react";
import { ClipboardList } from "lucide-react";
import { entrar } from "./actions";
import { Button, Campo, Card, Input } from "@/components/ui";

export default function LoginPage() {
  const [estado, acao, pendente] = useActionState(entrar, undefined);
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-azul/15 text-azul"><ClipboardList size={20} /></span>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Tarefas RH/DP</h1>
            <p className="text-xs text-suave">Entre para ver suas tarefas</p>
          </div>
        </div>
        <form action={acao} className="space-y-4">
          <Campo id="email" label="E-mail"><Input id="email" name="email" type="email" autoComplete="email" required /></Campo>
          <Campo id="senha" label="Senha"><Input id="senha" name="senha" type="password" autoComplete="current-password" required /></Campo>
          {estado?.erro && <p role="alert" className="rounded-md border border-vermelho/30 bg-vermelho/10 px-3 py-2 text-sm text-vermelho">{estado.erro}</p>}
          <Button type="submit" variante="primario" className="w-full" disabled={pendente}>{pendente ? "Entrando…" : "Entrar"}</Button>
        </form>
      </Card>
    </main>
  );
}
