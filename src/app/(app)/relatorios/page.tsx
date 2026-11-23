import { createClient } from "@/lib/supabase/server";
import { Secao } from "@/components/tabela-simples";
import { SeletorAno } from "@/components/seletor-ano";
import { Titulo } from "@/components/ui";
import { fmtData, fmtNum1, fmtPct, hojeSP, listaAnos, MESES } from "@/lib/datas";

export default async function RelatoriosPage({ searchParams }: { searchParams: Promise<{ ano?: string }> }) {
  const sp = await searchParams;
  const ano = Number(sp.ano) || Number(hojeSP().slice(0, 4));
  const supabase = await createClient();

  const [st, pr, ar, so, me, at, pri] = await Promise.all([
    supabase.from("rel_status").select("*"),
    supabase.from("rel_prioridade").select("*"),
    supabase.from("rel_area").select("*"),
    supabase.from("rel_solicitante").select("*"),
    supabase.rpc("rel_mensal", { p_ano: ano }),
    supabase.from("tarefas_view").select("*").eq("situacao_prazo", "Atrasada").order("prazo", { ascending: true }),
    supabase.from("tarefas_view").select("data_entrada").order("data_entrada", { ascending: true }).limit(1),
  ]);
  const erro = [st, pr, ar, so, me, at, pri].find((r) => r.error)?.error;
  if (erro) throw new Error(erro.message);

  const anos = listaAnos(pri.data?.[0]?.data_entrada);
  if (!anos.includes(ano)) anos.push(ano);

  return (
    <>
      <Titulo titulo="Relatórios" descricao="Números calculados no banco, iguais aos da tela de tarefas" />
      <div className="space-y-6">
        <Secao titulo="Por status" arquivo="relatorio-status" cabecalhos={["Status", "Quantidade", "%"]}
          linhas={st.data!.map((r) => [r.status, r.quantidade, fmtPct(r.percentual)])} />

        <Secao titulo="Por prioridade" arquivo="relatorio-prioridade" cabecalhos={["Prioridade", "Total", "Em aberto", "Atrasadas"]}
          linhas={pr.data!.map((r) => [r.prioridade, r.total, r.em_aberto, r.atrasadas])} />

        <Secao titulo="Por área" arquivo="relatorio-area" vazio="Nenhuma tarefa cadastrada."
          cabecalhos={["Área", "Total", "Concluídas", "Em aberto", "Atrasadas", "% de conclusão"]}
          linhas={ar.data!.map((r) => [r.nome, r.total, r.concluidas, r.em_aberto, r.atrasadas, fmtPct(r.pct_conclusao)])} />

        <Secao titulo="Por solicitante" arquivo="relatorio-solicitante" vazio="Nenhuma tarefa cadastrada."
          cabecalhos={["Solicitante", "Total", "Concluídas", "Em aberto", "Atrasadas", "% de conclusão", "Média de dias p/ concluir"]}
          linhas={so.data!.map((r) => [r.nome, r.total, r.concluidas, r.em_aberto, r.atrasadas, fmtPct(r.pct_conclusao), fmtNum1(r.media_dias)])} />

        <Secao titulo={`Evolução mensal de ${ano}`} arquivo={`relatorio-mensal-${ano}`} extra={<SeletorAno ano={ano} anos={anos} />}
          cabecalhos={["Mês", "Entradas", "Concluídas", "Saldo"]}
          linhas={(me.data as { mes: number; entradas: number; concluidas: number; saldo: number }[]).map((r) => [MESES[r.mes - 1], r.entradas, r.concluidas, r.saldo])} />

        <Secao titulo="Tarefas atrasadas" arquivo="relatorio-atrasadas" vazio="Nenhuma tarefa atrasada. Bom trabalho!"
          cabecalhos={["ID", "Tarefa", "Área", "Solicitante", "Entrada", "Prazo", "Dias de atraso", "Prioridade", "Status"]}
          linhas={at.data!.map((t) => [t.codigo_texto, t.descricao, t.area_nome ?? "—", t.solicitante_nome ?? "—", fmtData(t.data_entrada), fmtData(t.prazo), t.dias_atraso, t.prioridade, t.status])} />
      </div>
    </>
  );
}
