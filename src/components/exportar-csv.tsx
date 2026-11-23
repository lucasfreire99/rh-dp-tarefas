"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui";
import { baixarCSV, paraCSV } from "@/lib/csv";

export function ExportarCSV({ nome, cabecalhos, linhas }: { nome: string; cabecalhos: string[]; linhas: (string | number | null)[][] }) {
  return (
    <Button tamanho="sm" disabled={!linhas.length} onClick={() => baixarCSV(nome, paraCSV(cabecalhos, linhas))}>
      <Download size={14} />Exportar CSV
    </Button>
  );
}
