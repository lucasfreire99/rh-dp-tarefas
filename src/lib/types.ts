export const STATUS = ["Pendente", "Em andamento", "Aguardando terceiros", "Concluída", "Cancelada"] as const;
export const PRIORIDADES = ["Alta", "Média", "Baixa"] as const;
export const SITUACOES = ["Atrasada", "Vence hoje", "No prazo", "Sem prazo", "Concluída", "Concluída c/ atraso", "Cancelada"] as const;
export type Status = (typeof STATUS)[number];
export type Prioridade = (typeof PRIORIDADES)[number];
export type Situacao = (typeof SITUACOES)[number];

export type Cor = "azul" | "verde" | "ambar" | "vermelho" | "roxo" | "cinza";
export const COR_HEX: Record<Cor, string> = {
  azul: "#58A6FF", verde: "#3FB950", ambar: "#D29922", vermelho: "#F85149", roxo: "#BC8CFF", cinza: "#6E7681",
};
export const BADGE: Record<Cor, string> = {
  azul: "bg-azul/15 text-azul border-azul/30",
  verde: "bg-verde/15 text-verde border-verde/30",
  ambar: "bg-ambar/15 text-ambar border-ambar/30",
  vermelho: "bg-vermelho/15 text-vermelho border-vermelho/30",
  roxo: "bg-roxo/15 text-roxo border-roxo/30",
  cinza: "bg-cinza/15 text-suave border-cinza/40",
};
export const STATUS_COR: Record<Status, Cor> = {
  Pendente: "ambar", "Em andamento": "azul", "Aguardando terceiros": "roxo", Concluída: "verde", Cancelada: "cinza",
};
export const PRIORIDADE_COR: Record<Prioridade, Cor> = { Alta: "vermelho", Média: "ambar", Baixa: "verde" };
export const SITUACAO_COR: Record<Situacao, Cor> = {
  Atrasada: "vermelho", "Vence hoje": "ambar", "No prazo": "azul", "Sem prazo": "cinza",
  Concluída: "verde", "Concluída c/ atraso": "ambar", Cancelada: "cinza",
};

export type Tarefa = {
  id: string;
  codigo: number;
  codigo_texto: string;
  data_entrada: string;
  prazo: string | null;
  area_id: string | null;
  area_nome: string | null;
  descricao: string;
  solicitante_id: string | null;
  solicitante_nome: string | null;
  prioridade: Prioridade;
  status: Status;
  data_conclusao: string | null;
  observacoes: string | null;
  dias_em_aberto: number | null;
  situacao_prazo: Situacao;
  dias_atraso: number | null;
};

export type Cadastro = { id: string; nome: string; ativo: boolean; ordem: number };
export type Tabela = "areas" | "solicitantes";
