"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({ aberto, onFechar, titulo, children, largura = "max-w-2xl" }: {
  aberto: boolean; onFechar: () => void; titulo: string; children: React.ReactNode; largura?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("input,select,textarea,button[data-foco]")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      anterior?.focus();
    };
  }, [aberto, onFechar]);
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={titulo}
        className={`flex max-h-[92vh] w-full flex-col rounded-t-xl border border-borda bg-cartao shadow-2xl sm:rounded-xl ${largura}`}>
        <div className="flex items-center justify-between border-b border-borda px-5 py-3.5">
          <h2 className="text-base font-semibold">{titulo}</h2>
          <button onClick={onFechar} aria-label="Fechar" className="rounded p-1 text-suave hover:bg-borda/50 hover:text-texto"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
