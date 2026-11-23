import { createClient } from "@/lib/supabase/server";
import { CadastroLista } from "@/components/cadastro-lista";
import { ImportarCSV } from "@/components/importar-csv";
import { Titulo } from "@/components/ui";
import type { Cadastro } from "@/lib/types";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const [a, s] = await Promise.all([
    supabase.from("areas").select("id,nome,ativo,ordem").order("ordem").order("nome"),
    supabase.from("solicitantes").select("id,nome,ativo,ordem").order("ordem").order("nome"),
  ]);
  if (a.error || s.error) throw new Error((a.error ?? s.error)!.message);
  return (
    <>
      <Titulo titulo="Configurações" descricao="Cadastros usados nas tarefas e importação de dados" />
      <div className="grid gap-6 lg:grid-cols-2">
        <CadastroLista titulo="Áreas" singular="Área" tabela="areas" itens={a.data as Cadastro[]} />
        <CadastroLista titulo="Solicitantes" singular="Solicitante" tabela="solicitantes" itens={s.data as Cadastro[]} />
      </div>
      <div className="mt-6"><ImportarCSV /></div>
    </>
  );
}
