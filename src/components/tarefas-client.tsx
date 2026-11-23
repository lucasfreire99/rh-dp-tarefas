"use client";

import { useMemo, useState, useTransition } from "react";
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { alterarStatus, excluirTarefa } from "@/app/actions";
import { Modal } from "@/components/modal";
import { TarefaFormulario } from "@/components/tarefa-form";
import { Badge, Button, Card, Input, Select, Titulo, Vazio } from "@/components/ui";
import { baixarCSV, paraCSV } from "@/lib/csv";
import { fmtData } from "@/lib/datas";
import { PRIORIDADES, PRIORIDADE_COR, SITUACAO_COR, SITUACOES, STATUS, STATUS_COR, BADGE, type Cadastro, type Tarefa } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filtros = { busca: string; status: string; prioridade: string; area: string; solicitante: string; situacao: string; de: string; ate: string };
const vazio: Filtros = { busca: "", status: "", prioridade: "", area: "", solicitante: "", situacao: "", de: "", ate: "" };

export function TarefasClient({ tarefas, areas, solicitantes }: { tarefas: Tarefa[]; areas: Cadastro[]; solicitantes: Cadastro[] }) {
  const [f, setF] = useState<Filtros>(vazio);
  const [sorting, setSorting] = useState<SortingState>([{ id: "codigo", desc: true }]);
  const [editando, setEditando] = useState<Tarefa | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [excluindo, setExcluindo] = useState<Tarefa | null>(null);
  const [pendente, startTransition] = useTransition();
  const set = (k: keyof Filtros) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((o) => ({ ...o, [k]: e.target.value }));

  const filtradas = useMemo(() => {
    const q = f.busca.trim().toLowerCase();
    return tarefas.filter((t) =>
      (!q || [t.descricao, t.codigo_texto, t.observacoes, t.area_nome, t.solicitante_nome].some((x) => x?.toLowerCase().includes(q))) &&
      (!f.status || t.status === f.status) &&
      (!f.prioridade || t.prioridade === f.prioridade) &&
      (!f.area || (f.area === "_" ? !t.area_id : t.area_id === f.area)) &&
      (!f.solicitante || (f.solicitante === "_" ? !t.solicitante_id : t.solicitante_id === f.solicitante)) &&
      (!f.situacao || t.situacao_prazo === f.situacao) &&
      (!f.de || t.data_entrada >= f.de) &&
      (!f.ate || t.data_entrada <= f.ate)
    );
  }, [tarefas, f]);

  const mudarStatus = (t: Tarefa, status: string) =>
    startTransition(async () => {
      const r = await alterarStatus(t.id, status);
      r.ok ? toast.success(`${t.codigo_texto}: ${status}`) : toast.error(r.error);
    });

  const colunas = useMemo<ColumnDef<Tarefa>[]>(() => [
    { id: "codigo", header: "ID", accessorFn: (t) => t.codigo, cell: (c) => <span className="font-medium text-azul">{c.row.original.codigo_texto}</span> },
    { id: "data_entrada", header: "Entrada", accessorFn: (t) => t.data_entrada, cell: (c) => fmtData(c.row.original.data_entrada) },
    { id: "prazo", header: "Prazo", accessorFn: (t) => t.prazo ?? "9999", cell: (c) => fmtData(c.row.original.prazo) },
    { id: "area", header: "Área", accessorFn: (t) => t.area_nome ?? "", cell: (c) => c.row.original.area_nome ?? "—" },
    { id: "descricao", header: "Tarefa", accessorFn: (t) => t.descricao, cell: (c) => <div className="min-w-[220px] max-w-md whitespace-normal" title={c.row.original.observacoes ?? undefined}>{c.row.original.descricao}</div> },
    { id: "solicitante", header: "Solicitante", accessorFn: (t) => t.solicitante_nome ?? "", cell: (c) => c.row.original.solicitante_nome ?? "—" },
    { id: "prioridade", header: "Prioridade", accessorFn: (t) => PRIORIDADES.indexOf(t.prioridade), cell: (c) => <Badge cor={PRIORIDADE_COR[c.row.original.prioridade]}>{c.row.original.prioridade}</Badge> },
    {
      id: "status", header: "Status", accessorFn: (t) => STATUS.indexOf(t.status),
      cell: (c) => {
        const t = c.row.original;
        return (
          <select aria-label={`Status de ${t.codigo_texto}`} value={t.status} disabled={pendente} onChange={(e) => mudarStatus(t, e.target.value)}
            className={cn("cursor-pointer rounded-full border px-2 py-0.5 text-xs font-medium", BADGE[STATUS_COR[t.status]])}>
            {STATUS.map((s) => <option key={s} value={s} className="bg-cartao text-texto">{s}</option>)}
          </select>
        );
      },
    },
    { id: "situacao", header: "Prazo", accessorFn: (t) => SITUACOES.indexOf(t.situacao_prazo), cell: (c) => <Badge cor={SITUACAO_COR[c.row.original.situacao_prazo]}>{c.row.original.situacao_prazo}</Badge> },
    { id: "dias", header: "Dias", accessorFn: (t) => t.dias_em_aberto ?? -1, cell: (c) => c.row.original.dias_em_aberto ?? "—" },
    {
      id: "acoes", header: "", enableSorting: false,
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button tamanho="sm" variante="fantasma" aria-label={`Editar ${c.row.original.codigo_texto}`} onClick={() => { setEditando(c.row.original); setFormAberto(true); }}><Pencil size={14} /></Button>
          <Button tamanho="sm" variante="fantasma" aria-label={`Excluir ${c.row.original.codigo_texto}`} onClick={() => setExcluindo(c.row.original)}><Trash2 size={14} /></Button>
        </div>
      ),
    },
  ], [pendente]); // eslint-disable-line react-hooks/exhaustive-deps

  const table = useReactTable({
    data: filtradas, columns: colunas, state: { sorting }, onSortingChange: setSorting,
    initialState: { pagination: { pageSize: 20 } },
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(),
  });

  const exportar = () => {
    baixarCSV("tarefas", paraCSV(
      ["ID", "Data de entrada", "Prazo", "Área", "Tarefa", "Solicitante", "Prioridade", "Status", "Data de conclusão", "Dias em aberto", "Situação do prazo", "Observações"],
      filtradas.map((t) => [t.codigo_texto, fmtData(t.data_entrada), t.prazo ? fmtData(t.prazo) : "", t.area_nome, t.descricao, t.solicitante_nome, t.prioridade, t.status,
        t.data_conclusao ? fmtData(t.data_conclusao) : "", t.dias_em_aberto, t.situacao_prazo, t.observacoes])
    ));
  };

  const confirmarExclusao = () => excluindo && startTransition(async () => {
    const r = await excluirTarefa(excluindo.id);
    if (r.ok) { toast.success(`${excluindo.codigo_texto} excluída`); setExcluindo(null); } else toast.error(r.error);
  });

  const temFiltro = JSON.stringify(f) !== JSON.stringify(vazio);
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = filtradas.length;

  return (
    <>
      <Titulo titulo="Tarefas" descricao={`${total} de ${tarefas.length} tarefas`}>
        <Button onClick={exportar} disabled={!total}><Download size={15} />Exportar CSV</Button>
        <Button variante="primario" onClick={() => { setEditando(null); setFormAberto(true); }}><Plus size={15} />Nova tarefa</Button>
      </Titulo>

      <Card className="mb-4 p-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-4">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-suave" />
            <Input aria-label="Buscar" placeholder="Buscar por tarefa, ID, área, solicitante ou observação" className="pl-9" value={f.busca} onChange={set("busca")} />
          </div>
          <Select aria-label="Status" value={f.status} onChange={set("status")}><option value="">Todos os status</option>{STATUS.map((s) => <option key={s}>{s}</option>)}</Select>
          <Select aria-label="Prioridade" value={f.prioridade} onChange={set("prioridade")}><option value="">Todas as prioridades</option>{PRIORIDADES.map((s) => <option key={s}>{s}</option>)}</Select>
          <Select aria-label="Área" value={f.area} onChange={set("area")}><option value="">Todas as áreas</option><option value="_">Sem área</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.nome}{a.ativo ? "" : " (inativa)"}</option>)}</Select>
          <Select aria-label="Solicitante" value={f.solicitante} onChange={set("solicitante")}><option value="">Todos os solicitantes</option><option value="_">Sem solicitante</option>{solicitantes.map((a) => <option key={a.id} value={a.id}>{a.nome}{a.ativo ? "" : " (inativo)"}</option>)}</Select>
          <Select aria-label="Situação do prazo" value={f.situacao} onChange={set("situacao")}><option value="">Todas as situações de prazo</option>{SITUACOES.map((s) => <option key={s}>{s}</option>)}</Select>
          <label className="flex items-center gap-2 text-xs text-suave">Entrada de<Input type="date" value={f.de} onChange={set("de")} /></label>
          <label className="flex items-center gap-2 text-xs text-suave">até<Input type="date" value={f.ate} onChange={set("ate")} /></label>
          <div className="flex items-center">{temFiltro && <Button variante="fantasma" onClick={() => setF(vazio)}>Limpar filtros</Button>}</div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {total === 0 ? (
          <Vazio>{tarefas.length === 0 ? "Nenhuma tarefa ainda. Clique em “Nova tarefa” para começar." : "Nenhuma tarefa encontrada com esses filtros."}</Vazio>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-borda text-xs text-suave">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => {
                      const dir = h.column.getIsSorted();
                      return (
                        <th key={h.id} scope="col" aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none"} className="whitespace-nowrap px-3 py-2.5 font-medium">
                          {h.column.getCanSort() ? (
                            <button onClick={h.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 hover:text-texto">
                              {flexRender(h.column.columnDef.header, h.getContext())}
                              {dir === "asc" ? <ArrowUp size={12} /> : dir === "desc" ? <ArrowDown size={12} /> : <ArrowUpDown size={12} className="opacity-40" />}
                            </button>
                          ) : flexRender(h.column.columnDef.header, h.getContext())}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((r) => (
                  <tr key={r.id} className="border-b border-borda/60 last:border-0 hover:bg-borda/20">
                    {r.getVisibleCells().map((c) => <td key={c.id} className="whitespace-nowrap px-3 py-2.5 align-top">{flexRender(c.column.columnDef.cell, c.getContext())}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-borda px-3 py-2.5 text-xs text-suave">
            <span>{pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, total)} de {total}</span>
            <div className="flex items-center gap-2">
              <Select aria-label="Linhas por página" className="h-8 w-auto text-xs" value={pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))}>
                {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n} por página</option>)}
              </Select>
              <Button tamanho="sm" aria-label="Página anterior" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}><ChevronLeft size={14} /></Button>
              <span>Página {pageIndex + 1} de {table.getPageCount()}</span>
              <Button tamanho="sm" aria-label="Próxima página" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}><ChevronRight size={14} /></Button>
            </div>
          </div>
        )}
      </Card>

      <Modal aberto={formAberto} onFechar={() => setFormAberto(false)} titulo={editando ? `Editar ${editando.codigo_texto}` : "Nova tarefa"}>
        {formAberto && <TarefaFormulario key={editando?.id ?? "nova"} inicial={editando} areas={areas} solicitantes={solicitantes} onFechar={() => setFormAberto(false)} />}
      </Modal>

      <Modal aberto={!!excluindo} onFechar={() => setExcluindo(null)} titulo="Excluir tarefa" largura="max-w-md">
        <p className="text-sm">Excluir <strong>{excluindo?.codigo_texto}</strong>? “{excluindo?.descricao}” será removida para sempre.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button data-foco onClick={() => setExcluindo(null)} disabled={pendente}>Cancelar</Button>
          <Button variante="perigo" onClick={confirmarExclusao} disabled={pendente}>{pendente ? "Excluindo…" : "Excluir tarefa"}</Button>
        </div>
      </Modal>
    </>
  );
}
