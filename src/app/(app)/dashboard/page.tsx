import { createClient } from "@/lib/supabase/server";
import { Badge, Card, Titulo } from "@/components/ui";
import { GraficoArea, GraficoMensal, GraficoPrioridade, GraficoStatus } from "@/components/graficos";
import { SeletorAno } from "@/components/seletor-ano";
import { TabelaSimples } from "@/components/tabela-simples";
import { fmtData, fmtPct, hojeSP, listaAnos } from "@/lib/datas";
import { cn } from "@/lib/utils";

const barra = { azul: "bg-azul", ambar: "bg-ambar", verde: "bg-verde", vermelho: "bg-vermelho", roxo: "bg-roxo" } as const;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ ano?: string }> }) {
  const sp = await searchParams;
  const ano = Number(sp.ano) || Number(hojeSP().slice(0, 4));
  const supabase = await createClient();

  const [ind, st, pr, ar, me, at, pri] = await Promise.all([
    supabase.from("dashboard_indicadores").select("*").single(),
    supabase.from("rel_status").select("*"),
    supabase.from("rel_prioridade").select("*"),
    supabase.from("rel_area").select("*"),
    supabase.rpc("rel_mensal", { p_ano: ano }),
    supabase.from("tarefas_view").select("codigo_texto,descricao,area_nome,solicitante_nome,prazo,dias_atraso").eq("situacao_prazo", "Atrasada").order("prazo", { ascending: true }).limit(5),
    supabase.from("tarefas_view").select("data_entrada").order("data_entrada", { ascending: true }).limit(1),
  ]);
  const erro = [ind, st, pr, ar, me, at, pri].find((r) => r.error)?.error;
  if (erro) throw new Error(erro.message);

  const i = ind.data!;
  const cartoes = [
    { rotulo: "Total de tarefas", valor: i.total, cor: "azul" },
    { rotulo: "Em aberto", valor: i.em_aberto, cor: "ambar" },
    { rotulo: "Concluídas", valor: i.concluidas, cor: "verde" },
    { rotulo: "Atrasadas", valor: i.atrasadas, cor: "vermelho" },
    { rotulo: "Vencem em 7 dias", valor: i.vencem_7_dias, cor: "roxo" },
    { rotulo: "% de conclusão", valor: fmtPct(i.pct_conclusao), cor: "verde" },
  ] as const;
  const anos = listaAnos(pri.data?.[0]?.data_entrada);
  if (!anos.includes(ano)) anos.push(ano);

  return (
    <>
      <Titulo titulo="Dashboard" descricao="Visão geral das suas tarefas de RH/DP" />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cartoes.map((c) => (
          <Card key={c.rotulo} className="overflow-hidden">
            <div className={cn("h-1", barra[c.cor])} />
            <div className="p-4">
              <p className="text-xs text-suave">{c.rotulo}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{c.valor}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-4"><h2 className="mb-2 text-sm font-semibold">Tarefas por status</h2><GraficoStatus dados={st.data!} /></Card>
        <Card className="p-4"><h2 className="mb-2 text-sm font-semibold">Prioridade: em aberto x atrasadas</h2><GraficoPrioridade dados={pr.data!} /></Card>
        <Card className="p-4"><h2 className="mb-2 text-sm font-semibold">Tarefas por área</h2><GraficoArea dados={ar.data!} /></Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold">Entradas x concluídas em {ano}</h2><SeletorAno ano={ano} anos={anos} /></div>
          <GraficoMensal dados={me.data as { mes: number; entradas: number; concluidas: number }[]} />
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-borda px-4 py-3">
          <h2 className="text-sm font-semibold">Atenção: tarefas atrasadas</h2>
          {i.atrasadas > 0 && <Badge cor="vermelho">{i.atrasadas} no total</Badge>}
        </div>
        <TabelaSimples vazio="Nenhuma tarefa atrasada. Bom trabalho!"
          cabecalhos={["ID", "Tarefa", "Área", "Solicitante", "Prazo", "Dias de atraso"]}
          linhas={at.data!.map((t) => [t.codigo_texto, t.descricao, t.area_nome ?? "—", t.solicitante_nome ?? "—", fmtData(t.prazo), t.dias_atraso])} />
      </Card>
    </>
  );
}
