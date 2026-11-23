import { Card, Vazio } from "@/components/ui";
import { ExportarCSV } from "@/components/exportar-csv";
import { cn } from "@/lib/utils";

type Cel = string | number | null;

export function TabelaSimples({ cabecalhos, linhas, vazio = "Nenhum dado para mostrar." }: { cabecalhos: string[]; linhas: Cel[][]; vazio?: string }) {
  if (!linhas.length) return <Vazio>{vazio}</Vazio>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-borda text-xs text-suave">
          <tr>{cabecalhos.map((c, i) => <th key={c} scope="col" className={cn("whitespace-nowrap px-3 py-2.5 font-medium", i > 0 && "text-right")}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={i} className={cn("border-b border-borda/60 last:border-0", l[0] === "Total" && "bg-borda/20 font-semibold")}>
              {l.map((c, j) => <td key={j} className={cn("px-3 py-2.5", j > 0 ? "whitespace-nowrap text-right tabular-nums" : "")}>{c ?? "—"}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Secao({ titulo, arquivo, cabecalhos, linhas, vazio, extra }: {
  titulo: string; arquivo: string; cabecalhos: string[]; linhas: Cel[][]; vazio?: string; extra?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-borda px-4 py-3">
        <h2 className="text-sm font-semibold">{titulo}</h2>
        <div className="flex items-center gap-2">{extra}<ExportarCSV nome={arquivo} cabecalhos={cabecalhos} linhas={linhas} /></div>
      </div>
      <TabelaSimples cabecalhos={cabecalhos} linhas={linhas} vazio={vazio} />
    </Card>
  );
}
