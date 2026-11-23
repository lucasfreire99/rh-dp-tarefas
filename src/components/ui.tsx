import * as React from "react";
import { cn } from "@/lib/utils";
import { BADGE, type Cor } from "@/lib/types";

export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-borda bg-cartao", className)} {...p} />;
}

export function Badge({ cor, className, children }: { cor: Cor; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium", BADGE[cor], className)}>
      {children}
    </span>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "primario" | "contorno" | "perigo" | "fantasma"; tamanho?: "sm" | "md" };
export const Button = React.forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variante = "contorno", tamanho = "md", className, type = "button", ...p }, ref
) {
  const v = {
    primario: "bg-azul text-fundo hover:bg-azul/90 border-transparent font-semibold",
    contorno: "bg-transparent border-borda hover:bg-borda/40 text-texto",
    perigo: "bg-vermelho text-fundo hover:bg-vermelho/90 border-transparent font-semibold",
    fantasma: "bg-transparent border-transparent hover:bg-borda/40 text-suave hover:text-texto",
  }[variante];
  const t = tamanho === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3.5 text-sm";
  return (
    <button ref={ref} type={type}
      className={cn("inline-flex items-center justify-center gap-1.5 rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-50", v, t, className)}
      {...p} />
  );
});

const campo = "w-full rounded-md border border-borda bg-fundo px-3 text-sm text-texto placeholder:text-suave/70 disabled:opacity-50";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(campo, "h-9", className)} {...p} />;
});
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn(campo, "min-h-[84px] py-2", className)} {...p} />;
});
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...p }, ref) {
  return <select ref={ref} className={cn(campo, "h-9", className)} {...p} />;
});

export function Campo({ id, label, erro, children, className }: { id: string; label: string; erro?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="text-xs font-medium text-suave">{label}</label>
      {children}
      {erro && <p role="alert" className="text-xs text-vermelho">{erro}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-borda/60", className)} />;
}

export function Vazio({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[120px] items-center justify-center px-4 py-8 text-center text-sm text-suave">{children}</div>;
}

export function Titulo({ titulo, descricao, children }: { titulo: string; descricao?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-suave">{descricao}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
