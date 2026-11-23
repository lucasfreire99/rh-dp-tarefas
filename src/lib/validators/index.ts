import { z } from "zod";
import { PRIORIDADES, STATUS } from "@/lib/types";

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");
const dataOpc = z.union([data, z.literal("")]);
const idOuVazio = z.string().refine((v) => v === "" || /^[0-9a-f-]{36}$/i.test(v), "Seleção inválida");

export const tarefaSchema = z
  .object({
    data_entrada: data,
    prazo: dataOpc,
    area_id: idOuVazio,
    descricao: z.string().trim().min(1, "Informe a tarefa").max(2000, "Máximo de 2000 caracteres"),
    solicitante_id: idOuVazio,
    prioridade: z.enum(PRIORIDADES),
    status: z.enum(STATUS),
    data_conclusao: dataOpc,
    observacoes: z.string().max(4000, "Máximo de 4000 caracteres"),
  })
  .superRefine((v, ctx) => {
    if (v.data_conclusao && v.data_conclusao < v.data_entrada)
      ctx.addIssue({ code: "custom", path: ["data_conclusao"], message: "Não pode ser anterior à entrada" });
  });
export type TarefaForm = z.infer<typeof tarefaSchema>;

export const nomeSchema = z.string().trim().min(1, "Informe o nome").max(120, "Máximo de 120 caracteres");
export const tabelaSchema = z.enum(["areas", "solicitantes"]);

export const linhaImportSchema = z.object({
  data_entrada: z.string().nullable(),
  prazo: z.string().nullable(),
  area: z.string().trim().max(120),
  descricao: z.string().trim().min(1).max(2000),
  solicitante: z.string().trim().max(120),
  prioridade: z.enum(PRIORIDADES),
  status: z.enum(STATUS),
  data_conclusao: z.string().nullable(),
  observacoes: z.string().max(4000),
});
export type LinhaImport = z.infer<typeof linhaImportSchema>;
