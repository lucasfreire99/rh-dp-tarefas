type Cel = string | number | null | undefined;

/** CSV com ";" e BOM, para abrir direto no Excel em português. */
export function paraCSV(cabecalhos: string[], linhas: Cel[][]): string {
  const esc = (v: Cel) => {
    const s = v == null ? "" : String(v);
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "\uFEFF" + [cabecalhos, ...linhas].map((l) => l.map(esc).join(";")).join("\r\n");
}

export function baixarCSV(nome: string, conteudo: string) {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome.endsWith(".csv") ? nome : `${nome}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Leitor de CSV simples (aceita ";" ou ",", aspas e quebras de linha entre aspas). */
export function lerCSV(texto: string): string[][] {
  const t = texto.replace(/^\uFEFF/, "");
  const primeira = t.split(/\r?\n/)[0] ?? "";
  const sep = (primeira.match(/;/g)?.length ?? 0) >= (primeira.match(/,/g)?.length ?? 0) ? ";" : ",";
  const linhas: string[][] = [];
  let lin: string[] = [], cel = "", aspas = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (aspas) {
      if (c === '"' && t[i + 1] === '"') { cel += '"'; i++; }
      else if (c === '"') aspas = false;
      else cel += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) { lin.push(cel); cel = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      lin.push(cel); cel = "";
      if (lin.some((x) => x.trim() !== "")) linhas.push(lin);
      lin = [];
    } else cel += c;
  }
  lin.push(cel);
  if (lin.some((x) => x.trim() !== "")) linhas.push(lin);
  return linhas;
}
