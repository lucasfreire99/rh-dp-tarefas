import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tarefas RH/DP",
  description: "Controle pessoal de tarefas do setor de RH/DP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-fundo text-texto">
        {children}
        <Toaster theme="dark" position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
