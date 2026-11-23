"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, ClipboardList, LayoutDashboard, ListChecks, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Settings, X } from "lucide-react";
import { sair } from "@/app/login/actions";
import { cn } from "@/lib/utils";

const itens = [
  { href: "/dashboard", rotulo: "Dashboard", Icone: LayoutDashboard },
  { href: "/tarefas", rotulo: "Tarefas", Icone: ListChecks },
  { href: "/relatorios", rotulo: "Relatórios", Icone: BarChart3 },
  { href: "/configuracoes", rotulo: "Configurações", Icone: Settings },
];

export function Shell({ email, children }: { email: string; children: React.ReactNode }) {
  const path = usePathname();
  const [recolhido, setRecolhido] = useState(false);
  const [aberto, setAberto] = useState(false);

  const nav = (compacto: boolean) => (
    <nav aria-label="Principal" className="flex-1 space-y-1 p-2">
      {itens.map(({ href, rotulo, Icone }) => {
        const ativo = path.startsWith(href);
        return (
          <Link key={href} href={href} onClick={() => setAberto(false)} title={rotulo} aria-current={ativo ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              ativo ? "bg-azul/15 text-azul" : "text-suave hover:bg-borda/40 hover:text-texto", compacto && "justify-center px-0")}>
            <Icone size={18} className="shrink-0" />
            {!compacto && rotulo}
          </Link>
        );
      })}
    </nav>
  );

  const rodape = (compacto: boolean) => (
    <div className="border-t border-borda p-2">
      {!compacto && <p className="truncate px-3 pb-2 text-xs text-suave" title={email}>{email}</p>}
      <form action={sair}>
        <button type="submit" title="Sair" className={cn("flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-suave hover:bg-borda/40 hover:text-texto", compacto && "justify-center px-0")}>
          <LogOut size={18} className="shrink-0" />{!compacto && "Sair"}
        </button>
      </form>
    </div>
  );

  const marca = (compacto: boolean) => (
    <div className={cn("flex h-14 items-center gap-2.5 border-b border-borda px-4", compacto && "justify-center px-0")}>
      <ClipboardList size={20} className="shrink-0 text-azul" />
      {!compacto && <span className="font-semibold">Tarefas RH/DP</span>}
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className={cn("sticky top-0 hidden h-screen flex-col border-r border-borda bg-cartao transition-[width] md:flex", recolhido ? "w-16" : "w-60")}>
        {marca(recolhido)}
        {nav(recolhido)}
        <button onClick={() => setRecolhido(!recolhido)} aria-label={recolhido ? "Expandir menu" : "Recolher menu"}
          className="mx-2 mb-1 flex items-center justify-center rounded-md py-2 text-suave hover:bg-borda/40 hover:text-texto">
          {recolhido ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        {rodape(recolhido)}
      </aside>

      {aberto && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setAberto(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-borda bg-cartao">
            {marca(false)}{nav(false)}{rodape(false)}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-borda bg-fundo/90 px-4 backdrop-blur md:hidden">
          <button onClick={() => setAberto(!aberto)} aria-label="Abrir menu" className="rounded p-1.5 text-suave hover:bg-borda/40">
            {aberto ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-semibold">Tarefas RH/DP</span>
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
