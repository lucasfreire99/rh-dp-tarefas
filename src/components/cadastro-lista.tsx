"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { cadastroAdicionar, cadastroAtivo, cadastroMover, cadastroRenomear } from "@/app/actions";
import { Badge, Button, Card, Input, Vazio } from "@/components/ui";
import type { Cadastro, Tabela } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CadastroLista({ titulo, tabela, itens, singular }: { titulo: string; tabela: Tabela; itens: Cadastro[]; singular: string }) {
  const [novo, setNovo] = useState("");
  const [pendente, startTransition] = useTransition();

  const rodar = (fn: () => Promise<{ ok: boolean; error?: string }>, sucesso?: string) =>
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) toast.error((r as { error: string }).error);
      else if (sucesso) toast.success(sucesso);
    });

  const adicionar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novo.trim()) return;
    rodar(() => cadastroAdicionar(tabela, novo), `${singular} adicionado`);
    setNovo("");
  };

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-borda px-4 py-3">
        <h2 className="text-sm font-semibold">{titulo}</h2>
        <span className="text-xs text-suave">{itens.filter((i) => i.ativo).length} ativos de {itens.length}</span>
      </div>
      <form onSubmit={adicionar} className="flex gap-2 border-b border-borda p-3">
        <Input aria-label={`Novo ${singular.toLowerCase()}`} placeholder={`Novo ${singular.toLowerCase()}`} value={novo} onChange={(e) => setNovo(e.target.value)} />
        <Button type="submit" variante="primario" disabled={pendente || !novo.trim()}><Plus size={15} />Adicionar</Button>
      </form>
      {itens.length === 0 ? <Vazio>Nenhum cadastro ainda.</Vazio> : (
        <ul className="divide-y divide-borda/60">
          {itens.map((it, i) => (
            <li key={it.id} className="flex items-center gap-2 px-3 py-2">
              <Input aria-label={`Nome: ${it.nome}`} defaultValue={it.nome} disabled={pendente}
                className={cn("h-8 border-transparent bg-transparent hover:border-borda", !it.ativo && "text-suave line-through")}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v === it.nome) return;
                  if (!v) { e.target.value = it.nome; return; }
                  rodar(() => cadastroRenomear(tabela, it.id, v), "Nome atualizado");
                }} />
              {!it.ativo && <Badge cor="cinza">Inativo</Badge>}
              <Button tamanho="sm" variante="fantasma" aria-label="Mover para cima" disabled={pendente || i === 0} onClick={() => rodar(() => cadastroMover(tabela, it.id, "cima"))}><ArrowUp size={14} /></Button>
              <Button tamanho="sm" variante="fantasma" aria-label="Mover para baixo" disabled={pendente || i === itens.length - 1} onClick={() => rodar(() => cadastroMover(tabela, it.id, "baixo"))}><ArrowDown size={14} /></Button>
              <Button tamanho="sm" onClick={() => rodar(() => cadastroAtivo(tabela, it.id, !it.ativo), it.ativo ? "Desativado" : "Reativado")} disabled={pendente}>
                {it.ativo ? "Desativar" : "Reativar"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
