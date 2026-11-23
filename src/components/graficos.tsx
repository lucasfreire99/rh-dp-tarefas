"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COR_HEX, STATUS_COR, type Status } from "@/lib/types";
import { MESES } from "@/lib/datas";
import { Vazio } from "@/components/ui";

const eixo = { fill: "#8B949E", fontSize: 12 };
const tip = {
  contentStyle: { background: "#161B22", border: "1px solid #30363D", borderRadius: 8, color: "#E6EDF3", fontSize: 12 },
  itemStyle: { color: "#E6EDF3" }, labelStyle: { color: "#8B949E" }, cursor: { fill: "#30363D55" },
};
const legenda = { wrapperStyle: { fontSize: 12, color: "#8B949E" } };

export function GraficoStatus({ dados }: { dados: { status: string; quantidade: number }[] }) {
  if (!dados.some((d) => d.quantidade > 0)) return <Vazio>Sem tarefas para mostrar.</Vazio>;
  return (
    <div role="img" aria-label="Tarefas por status" className="h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={dados} dataKey="quantidade" nameKey="status" innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke="#161B22">
            {dados.map((d) => <Cell key={d.status} fill={COR_HEX[STATUS_COR[d.status as Status]]} />)}
          </Pie>
          <Tooltip {...tip} />
          <Legend {...legenda} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GraficoPrioridade({ dados }: { dados: { prioridade: string; em_aberto: number; atrasadas: number }[] }) {
  if (!dados.some((d) => d.em_aberto > 0)) return <Vazio>Nenhuma tarefa em aberto.</Vazio>;
  return (
    <div role="img" aria-label="Tarefas em aberto e atrasadas por prioridade" className="h-64">
      <ResponsiveContainer>
        <BarChart data={dados} margin={{ left: -20 }}>
          <CartesianGrid stroke="#30363D" vertical={false} />
          <XAxis dataKey="prioridade" tick={eixo} stroke="#30363D" />
          <YAxis allowDecimals={false} tick={eixo} stroke="#30363D" />
          <Tooltip {...tip} /><Legend {...legenda} />
          <Bar dataKey="em_aberto" name="Em aberto" fill={COR_HEX.azul} radius={[4, 4, 0, 0]} />
          <Bar dataKey="atrasadas" name="Atrasadas" fill={COR_HEX.vermelho} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GraficoArea({ dados }: { dados: { nome: string; concluidas: number; em_aberto: number }[] }) {
  const d = dados.filter((x) => x.concluidas + x.em_aberto > 0);
  if (!d.length) return <Vazio>Sem tarefas para mostrar.</Vazio>;
  return (
    <div role="img" aria-label="Tarefas por área" style={{ height: Math.max(220, d.length * 36 + 60) }}>
      <ResponsiveContainer>
        <BarChart data={d} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid stroke="#30363D" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={eixo} stroke="#30363D" />
          <YAxis type="category" dataKey="nome" width={150} tick={eixo} stroke="#30363D" />
          <Tooltip {...tip} /><Legend {...legenda} />
          <Bar dataKey="concluidas" name="Concluídas" stackId="a" fill={COR_HEX.verde} />
          <Bar dataKey="em_aberto" name="Em aberto" stackId="a" fill={COR_HEX.azul} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GraficoMensal({ dados }: { dados: { mes: number; entradas: number; concluidas: number }[] }) {
  const d = dados.map((x) => ({ ...x, nome: MESES[x.mes - 1] }));
  if (!d.some((x) => x.entradas + x.concluidas > 0)) return <Vazio>Sem movimento neste ano.</Vazio>;
  return (
    <div role="img" aria-label="Entradas e conclusões por mês" className="h-64">
      <ResponsiveContainer>
        <LineChart data={d} margin={{ left: -20, right: 10 }}>
          <CartesianGrid stroke="#30363D" vertical={false} />
          <XAxis dataKey="nome" tick={eixo} stroke="#30363D" />
          <YAxis allowDecimals={false} tick={eixo} stroke="#30363D" />
          <Tooltip {...tip} /><Legend {...legenda} />
          <Line type="monotone" dataKey="entradas" name="Entradas" stroke={COR_HEX.azul} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="concluidas" name="Concluídas" stroke={COR_HEX.verde} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
