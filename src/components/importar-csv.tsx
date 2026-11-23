"use client";

import { useRef, useState, useTransition } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { importarTarefas } from "@/app/actions";
import { Button, Card } from "@/components/ui";
import { baixarCSV, lerCSV, paraCSV } from "@/lib/csv";
import { lerData } from "@/lib/datas";
import { PRIORIDADES, STATUS } from "@/lib/types";
import type { LinhaImport } from "@/lib/validators";

const CABECALHO = ["data_entrada", "prazo", "area", "descricao", "solicitante", "prioridade", "status", "data_conclusao", "observacoes"];
const norm = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function interpretar(texto: string): { linhas: LinhaImport[]; erros: string[] } {
  const dados = lerCSV(texto);
  const erros: string[] = [];
  if (dados.length < 2) return { linhas: [], erros: ["O arquivo está vazio ou só tem o cabeçalho."] };
  const idx = Object.fromEntries(CABECALHO.map((c) => [c, dados[0].findIndex((h) => norm(h) === c)]));
  if (idx.descricao < 0) return { linhas: [], erros: ["Coluna “descricao” não encontrada. Use o modelo para download."] };
  const pega = (l: string[], c: string) => (idx[c] >= 0 ? (l[idx[c]] ?? "").trim() : "");
  const linhas: LinhaImport[] = [];
  dados.slice(1).forEach((l, n) => {
    const linha = n + 2;
    const descricao = pega(l, "descricao");
    if (!descricao) return void erros.push(`Linha ${linha}: tarefa vazia.`);
    const prio = PRIORIDADES.find((p) => norm(p) === norm(pega(l, "prioridade") || "Média"));
    const stat = STATUS.find((s) => norm(s) === norm(pega(l, "status") || "Pendente"));
    if (!prio) return void erros.push(`Linha ${linha}: prioridade inválida (“${pega(l, "prioridade")}”).`);
    if (!stat) return void erros.push(`Linha ${linha}: status inválido (“${pega(l, "status")}”).`);
    const datas = ["data_entrada", "prazo", "data_conclusao"].map((c) => lerData(pega(l, c)));
    if (datas.some((d) => d === false)) return void erros.push(`Linha ${linha}: data inválida (use dd/mm/aaaa).`);
    linhas.push({
      data_entrada: datas[0] as string | null, prazo: datas[1] as string | null, area: pega(l, "area"), descricao,
      solicitante: pega(l, "solicitante"), prioridade: prio, status: stat, data_conclusao: datas[2] as string | null, observacoes: pega(l, "observacoes"),
    });
  });
  return { linhas, erros };
}

export function ImportarCSV() {
  const [linhas, setLinhas] = useState<LinhaImport[]>([]);
  const [erros, setErros] = useState<string[]>([]);
  const [arquivo, setArquivo] = useState("");
  const [pendente, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  const modelo = () => baixarCSV("modelo-importacao-tarefas", paraCSV(CABECALHO, [
    ["15/01/2025", "30/01/2025", "Admissão", "Admitir novo colaborador", "Gestor Operações", "Alta", "Pendente", "", "Exemplo de linha"],
    ["10/01/2025", "", "Férias", "Programar férias de janeiro", "Diretoria", "Média", "Concluída", "12/01/2025", ""],
  ]));

  const ler = async (f?: File) => {
    if (!f) return;
    const r = interpretar(await f.text());
    setArquivo(f.name); setLinhas(r.linhas); setErros(r.erros);
  };

  const importar = () => startTransition(async () => {
    const r = await importarTarefas(linhas);
    if (!r.ok) return void toast.error(r.error);
    toast.success(`${r.total} tarefas importadas`);
    setLinhas([]); setErros([]); setArquivo("");
    if (input.current) input.current.value = "";
  });

  return (
    <Card>
      <div className="border-b border-borda px-4 py-3"><h2 className="text-sm font-semibold">Importar tarefas de um CSV</h2></div>
      <div className="space-y-4 p-4 text-sm">
        <p className="text-suave">Colunas: {CABECALHO.join(", ")}. Datas em dd/mm/aaaa. Áreas e solicitantes novos são criados automaticamente.</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={modelo}><Download size={15} />Baixar modelo</Button>
          <Button onClick={() => input.current?.click()}><Upload size={15} />Escolher arquivo</Button>
          <input ref={input} type="file" accept=".csv,text/csv" className="sr-only" aria-label="Arquivo CSV" onChange={(e) => ler(e.target.files?.[0])} />
        </div>
        {arquivo && (
          <div className="space-y-2 rounded-md border border-borda p-3">
            <p><strong>{arquivo}</strong>: {linhas.length} tarefas prontas para importar{erros.length > 0 && `, ${erros.length} linhas com problema`}.</p>
            {erros.length > 0 && (
              <ul role="alert" className="max-h-32 list-disc space-y-0.5 overflow-auto pl-5 text-xs text-vermelho">
                {erros.slice(0, 20).map((e) => <li key={e}>{e}</li>)}
                {erros.length > 20 && <li>…e mais {erros.length - 20}.</li>}
              </ul>
            )}
            <Button variante="primario" disabled={!linhas.length || pendente} onClick={importar}>
              {pendente ? "Importando…" : `Importar ${linhas.length} tarefas`}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
