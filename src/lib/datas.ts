const TZ = "America/Sao_Paulo";

/** Hoje (yyyy-mm-dd) no fuso de São Paulo. */
export function hojeSP(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/** yyyy-mm-dd -> dd/mm/aaaa (sem converter fuso). */
export function fmtData(d?: string | null): string {
  if (!d) return "—";
  const [y, m, dd] = d.slice(0, 10).split("-");
  return `${dd}/${m}/${y}`;
}

/** Aceita dd/mm/aaaa ou aaaa-mm-dd. Retorna null se vazio e false se inválida. */
export function lerData(s: string | undefined | null): string | null | false {
  const v = (s ?? "").trim();
  if (!v) return null;
  let y: string, m: string, d: string;
  const iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const br = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (iso) [, y, m, d] = iso;
  else if (br) [, d, m, y] = br;
  else return false;
  const dt = new Date(Date.UTC(+y, +m - 1, +d));
  if (dt.getUTCFullYear() !== +y || dt.getUTCMonth() !== +m - 1 || dt.getUTCDate() !== +d) return false;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export const fmtPct = (n: number | null | undefined) => `${(n ?? 0).toFixed(1).replace(".", ",")}%`;
export const fmtNum1 = (n: number | null | undefined) => (n == null ? "—" : n.toFixed(1).replace(".", ","));
export const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function listaAnos(primeira: string | null | undefined): number[] {
  const atual = Number(hojeSP().slice(0, 4));
  const inicio = primeira ? Math.min(Number(primeira.slice(0, 4)), atual) : atual;
  const anos: number[] = [];
  for (let a = atual; a >= inicio; a--) anos.push(a);
  return anos;
}
