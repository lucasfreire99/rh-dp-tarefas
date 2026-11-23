"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hojeSP, lerData } from "@/lib/datas";
import { linhaImportSchema, nomeSchema, tabelaSchema, tarefaSchema, type LinhaImport, type TarefaForm } from "@/lib/validators";
import { STATUS } from "@/lib/types";

type Res<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function db() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada. Entre novamente.");
  return supabase;
}
const atualizar = () => revalidatePath("/", "layout");
const falha = (e: unknown): { ok: false; error: string } => ({ ok: false, error: e instanceof Error ? e.message : "Erro inesperado." });

function paraLinha(v: TarefaForm) {
  const concluida = v.status === "Concluída";
  return {
    data_entrada: v.data_entrada,
    prazo: v.prazo || null,
    area_id: v.area_id || null,
    descricao: v.descricao,
    solicitante_id: v.solicitante_id || null,
    prioridade: v.prioridade,
    status: v.status,
    data_conclusao: concluida ? v.data_conclusao || hojeSP() : null,
    observacoes: v.observacoes?.trim() || null,
  };
}

export async function criarTarefa(input: unknown): Promise<Res> {
  try {
    const p = tarefaSchema.safeParse(input);
    if (!p.success) return { ok: false, error: p.error.issues[0].message };
    const supabase = await db();
    const { error } = await supabase.from("tarefas").insert(paraLinha(p.data));
    if (error) return { ok: false, error: error.message };
    atualizar();
    return { ok: true };
  } catch (e) { return falha(e); }
}

export async function atualizarTarefa(id: string, input: unknown): Promise<Res> {
  try {
    const p = tarefaSchema.safeParse(input);
    if (!p.success || !z.string().uuid().safeParse(id).success) return { ok: false, error: p.success ? "Tarefa inválida." : p.error.issues[0].message };
    const supabase = await db();
    const { error } = await supabase.from("tarefas").update(paraLinha(p.data)).eq("id", id);
    if (error) return { ok: false, error: error.message };
    atualizar();
    return { ok: true };
  } catch (e) { return falha(e); }
}

export async function alterarStatus(id: string, status: string): Promise<Res> {
  try {
    const s = z.enum(STATUS).safeParse(status);
    if (!s.success || !z.string().uuid().safeParse(id).success) return { ok: false, error: "Dados inválidos." };
    const supabase = await db();
    const { error } = await supabase.from("tarefas")
      .update({ status: s.data, data_conclusao: s.data === "Concluída" ? hojeSP() : null }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    atualizar();
    return { ok: true };
  } catch (e) { return falha(e); }
}

export async function excluirTarefa(id: string): Promise<Res> {
  try {
    if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Tarefa inválida." };
    const supabase = await db();
    const { error } = await supabase.from("tarefas").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    atualizar();
    return { ok: true };
  } catch (e) { return falha(e); }
}

/* ---------- Áreas e solicitantes ---------- */

export async function cadastroAdicionar(tabela: string, nome: string): Promise<Res<{ id: string }>> {
  try {
    const t = tabelaSchema.parse(tabela);
    const n = nomeSchema.safeParse(nome);
    if (!n.success) return { ok: false, error: n.error.issues[0].message };
    const supabase = await db();
    const { data: ult } = await supabase.from(t).select("ordem").order("ordem", { ascending: false }).limit(1);
    const { data, error } = await supabase.from(t).insert({ nome: n.data, ordem: (ult?.[0]?.ordem ?? 0) + 1 }).select("id").single();
    if (error) {
      if (error.code === "23505") {
        const { data: ex } = await supabase.from(t).select("id").eq("nome", n.data).single();
        if (ex) { await supabase.from(t).update({ ativo: true }).eq("id", ex.id); atualizar(); return { ok: true, id: ex.id }; }
      }
      return { ok: false, error: error.message };
    }
    atualizar();
    return { ok: true, id: data.id };
  } catch (e) { return falha(e); }
}

export async function cadastroRenomear(tabela: string, id: string, nome: string): Promise<Res> {
  try {
    const t = tabelaSchema.parse(tabela);
    const n = nomeSchema.safeParse(nome);
    if (!n.success) return { ok: false, error: n.error.issues[0].message };
    const supabase = await db();
    const { error } = await supabase.from(t).update({ nome: n.data }).eq("id", id);
    if (error) return { ok: false, error: error.code === "23505" ? "Já existe um cadastro com esse nome." : error.message };
    atualizar();
    return { ok: true };
  } catch (e) { return falha(e); }
}

export async function cadastroAtivo(tabela: string, id: string, ativo: boolean): Promise<Res> {
  try {
    const t = tabelaSchema.parse(tabela);
    const supabase = await db();
    const { error } = await supabase.from(t).update({ ativo }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    atualizar();
    return { ok: true };
  } catch (e) { return falha(e); }
}

export async function cadastroMover(tabela: string, id: string, direcao: "cima" | "baixo"): Promise<Res> {
  try {
    const t = tabelaSchema.parse(tabela);
    const supabase = await db();
    const { data, error } = await supabase.from(t).select("id").order("ordem").order("nome");
    if (error || !data) return { ok: false, error: error?.message ?? "Erro ao ler a lista." };
    const ids = data.map((d) => d.id);
    const i = ids.indexOf(id);
    const j = direcao === "cima" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= ids.length) return { ok: true };
    [ids[i], ids[j]] = [ids[j], ids[i]];
    const resultados = await Promise.all(ids.map((x, ordem) => supabase.from(t).update({ ordem: ordem + 1 }).eq("id", x)));
    const err = resultados.find((r) => r.error)?.error;
    if (err) return { ok: false, error: err.message };
    atualizar();
    return { ok: true };
  } catch (e) { return falha(e); }
}

/* ---------- Importação de CSV ---------- */

export async function importarTarefas(linhas: unknown): Promise<Res<{ total: number }>> {
  try {
    const p = z.array(linhaImportSchema).min(1).max(5000).safeParse(linhas);
    if (!p.success) return { ok: false, error: "Arquivo com dados inválidos." };
    const supabase = await db();
    const dados: LinhaImport[] = p.data;

    const mapa = async (t: "areas" | "solicitantes", nomes: string[]) => {
      const { data } = await supabase.from(t).select("id,nome,ordem");
      const existentes = new Map((data ?? []).map((d) => [d.nome.toLowerCase(), d.id as string]));
      let ordem = Math.max(0, ...(data ?? []).map((d) => d.ordem));
      for (const nome of [...new Set(nomes.filter(Boolean))]) {
        if (existentes.has(nome.toLowerCase())) continue;
        const { data: novo, error } = await supabase.from(t).insert({ nome, ordem: ++ordem }).select("id").single();
        if (error) throw new Error(error.message);
        existentes.set(nome.toLowerCase(), novo.id);
      }
      return existentes;
    };
    const areas = await mapa("areas", dados.map((d) => d.area));
    const solics = await mapa("solicitantes", dados.map((d) => d.solicitante));

    const hoje = hojeSP();
    const registros = dados.map((d) => ({
      data_entrada: lerData(d.data_entrada) || hoje,
      prazo: lerData(d.prazo) || null,
      area_id: areas.get(d.area.toLowerCase()) ?? null,
      descricao: d.descricao,
      solicitante_id: solics.get(d.solicitante.toLowerCase()) ?? null,
      prioridade: d.prioridade,
      status: d.status,
      data_conclusao: d.status === "Concluída" ? lerData(d.data_conclusao) || hoje : null,
      observacoes: d.observacoes || null,
    }));
    for (let i = 0; i < registros.length; i += 500) {
      const { error } = await supabase.from("tarefas").insert(registros.slice(i, i + 500));
      if (error) return { ok: false, error: error.message };
    }
    atualizar();
    return { ok: true, total: registros.length };
  } catch (e) { return falha(e); }
}
