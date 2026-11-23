"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { criarTarefa, atualizarTarefa, cadastroAdicionar } from "@/app/actions";
import { tarefaSchema, type TarefaForm } from "@/lib/validators";
import { hojeSP } from "@/lib/datas";
import { PRIORIDADES, STATUS, type Cadastro, type Tarefa } from "@/lib/types";
import { Button, Campo, Input, Select, Textarea } from "@/components/ui";

function Combobox({ id, valor, onChange, opcoes, onCriar }: {
  id: string; valor: string; onChange: (id: string) => void; opcoes: Cadastro[]; onCriar: (nome: string) => Promise<string | null>;
}) {
  const [consulta, setConsulta] = useState("");
  const [aberto, setAberto] = useState(false);
  const [criando, setCriando] = useState(false);
  const selecionado = opcoes.find((o) => o.id === valor);
  const q = consulta.trim().toLowerCase();
  const filtradas = opcoes.filter((o) => (o.ativo || o.id === valor) && o.nome.toLowerCase().includes(q));
  const existeExato = opcoes.some((o) => o.nome.toLowerCase() === q);

  return (
    <div className="relative">
      <Input id={id} role="combobox" aria-expanded={aberto} aria-controls={`${id}-lista`} autoComplete="off"
        placeholder="Digite para buscar ou criar"
        value={aberto ? consulta : selecionado?.nome ?? ""}
        onFocus={() => { setConsulta(""); setAberto(true); }}
        onChange={(e) => { setConsulta(e.target.value); setAberto(true); }}
        onBlur={() => setTimeout(() => setAberto(false), 120)}
        onKeyDown={(e) => e.key === "Escape" && setAberto(false)} />
      {aberto && (
        <ul id={`${id}-lista`} role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-borda bg-cartao py-1 shadow-xl">
          <li role="option" aria-selected={!valor} className="cursor-pointer px-3 py-1.5 text-sm text-suave hover:bg-borda/40"
            onMouseDown={(e) => { e.preventDefault(); onChange(""); setAberto(false); }}>Nenhum</li>
          {filtradas.map((o) => (
            <li key={o.id} role="option" aria-selected={o.id === valor}
              className="cursor-pointer px-3 py-1.5 text-sm hover:bg-borda/40"
              onMouseDown={(e) => { e.preventDefault(); onChange(o.id); setAberto(false); }}>{o.nome}</li>
          ))}
          {q && !existeExato && (
            <li role="option" aria-selected={false} className="cursor-pointer px-3 py-1.5 text-sm text-azul hover:bg-borda/40"
              onMouseDown={async (e) => {
                e.preventDefault();
                if (criando) return;
                setCriando(true);
                const novo = await onCriar(consulta.trim());
                setCriando(false);
                if (novo) { onChange(novo); setAberto(false); }
              }}>{criando ? "Criando…" : `Criar solicitante “${consulta.trim()}”`}</li>
          )}
        </ul>
      )}
    </div>
  );
}

export function TarefaFormulario({ inicial, areas, solicitantes, onFechar }: {
  inicial: Tarefa | null; areas: Cadastro[]; solicitantes: Cadastro[]; onFechar: () => void;
}) {
  const [pendente, startTransition] = useTransition();
  const [listaSolic, setListaSolic] = useState(solicitantes);
  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<TarefaForm>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: {
      data_entrada: inicial?.data_entrada ?? hojeSP(),
      prazo: inicial?.prazo ?? "",
      area_id: inicial?.area_id ?? "",
      descricao: inicial?.descricao ?? "",
      solicitante_id: inicial?.solicitante_id ?? "",
      prioridade: inicial?.prioridade ?? "Média",
      status: inicial?.status ?? "Pendente",
      data_conclusao: inicial?.data_conclusao ?? "",
      observacoes: inicial?.observacoes ?? "",
    },
  });

  const status = watch("status");
  const primeira = useRef(true);
  useEffect(() => {
    if (primeira.current) { primeira.current = false; return; }
    if (status === "Concluída" && !getValues("data_conclusao")) setValue("data_conclusao", hojeSP());
  }, [status, getValues, setValue]);
  useEffect(() => {
    if (status === "Concluída" && !getValues("data_conclusao")) setValue("data_conclusao", hojeSP());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const criarSolicitante = async (nome: string) => {
    const r = await cadastroAdicionar("solicitantes", nome);
    if (!r.ok) { toast.error(r.error); return null; }
    setListaSolic((l) => (l.some((x) => x.id === r.id) ? l.map((x) => (x.id === r.id ? { ...x, ativo: true } : x)) : [...l, { id: r.id, nome, ativo: true, ordem: 999 }]));
    toast.success(`Solicitante “${nome}” criado`);
    return r.id;
  };

  const enviar = handleSubmit((v) =>
    startTransition(async () => {
      const r = inicial ? await atualizarTarefa(inicial.id, v) : await criarTarefa(v);
      if (!r.ok) return void toast.error(r.error);
      toast.success(inicial ? "Tarefa atualizada" : "Tarefa criada");
      onFechar();
    })
  );

  const areasVisiveis = areas.filter((a) => a.ativo || a.id === inicial?.area_id);

  return (
    <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Campo id="descricao" label="Tarefa / descrição *" erro={errors.descricao?.message} className="sm:col-span-2">
        <Textarea id="descricao" {...register("descricao")} />
      </Campo>
      <Campo id="data_entrada" label="Data de entrada *" erro={errors.data_entrada?.message}>
        <Input id="data_entrada" type="date" {...register("data_entrada")} />
      </Campo>
      <Campo id="prazo" label="Prazo" erro={errors.prazo?.message}>
        <Input id="prazo" type="date" {...register("prazo")} />
      </Campo>
      <Campo id="area_id" label="Área" erro={errors.area_id?.message}>
        <Select id="area_id" {...register("area_id")}>
          <option value="">Sem área</option>
          {areasVisiveis.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </Select>
      </Campo>
      <Campo id="solicitante_id" label="Solicitante" erro={errors.solicitante_id?.message}>
        <Combobox id="solicitante_id" valor={watch("solicitante_id")} onChange={(id) => setValue("solicitante_id", id, { shouldDirty: true })}
          opcoes={listaSolic} onCriar={criarSolicitante} />
      </Campo>
      <Campo id="prioridade" label="Prioridade" erro={errors.prioridade?.message}>
        <Select id="prioridade" {...register("prioridade")}>{PRIORIDADES.map((p) => <option key={p}>{p}</option>)}</Select>
      </Campo>
      <Campo id="status" label="Status" erro={errors.status?.message}>
        <Select id="status" {...register("status")}>{STATUS.map((s) => <option key={s}>{s}</option>)}</Select>
      </Campo>
      <Campo id="data_conclusao" label="Data de conclusão" erro={errors.data_conclusao?.message}>
        <Input id="data_conclusao" type="date" disabled={status !== "Concluída"} {...register("data_conclusao")} />
      </Campo>
      <Campo id="observacoes" label="Observações" erro={errors.observacoes?.message} className="sm:col-span-2">
        <Textarea id="observacoes" {...register("observacoes")} />
      </Campo>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button onClick={onFechar} disabled={pendente}>Cancelar</Button>
        <Button type="submit" variante="primario" disabled={pendente}>{pendente ? "Salvando…" : inicial ? "Salvar alterações" : "Criar tarefa"}</Button>
      </div>
    </form>
  );
}
