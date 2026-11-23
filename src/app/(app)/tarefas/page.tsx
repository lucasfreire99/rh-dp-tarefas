import { createClient } from "@/lib/supabase/server";
import { TarefasClient } from "@/components/tarefas-client";
import type { Cadastro, Tarefa } from "@/lib/types";

export default async function TarefasPage() {
  const supabase = await createClient();
  const tarefas: Tarefa[] = [];
  for (let de = 0; ; de += 1000) {
    const { data, error } = await supabase.from("tarefas_view").select("*")
      .order("codigo", { ascending: false }).range(de, de + 999);
    if (error) throw new Error(error.message);
    tarefas.push(...(data as Tarefa[]));
    if (data.length < 1000) break;
  }
  const [a, s] = await Promise.all([
    supabase.from("areas").select("id,nome,ativo,ordem").order("ordem").order("nome"),
    supabase.from("solicitantes").select("id,nome,ativo,ordem").order("ordem").order("nome"),
  ]);
  if (a.error || s.error) throw new Error((a.error ?? s.error)!.message);
  return <TarefasClient tarefas={tarefas} areas={a.data as Cadastro[]} solicitantes={s.data as Cadastro[]} />;
}
