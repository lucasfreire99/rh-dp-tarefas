"use client";

import { AlertTriangle } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function Erro({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="mx-auto mt-10 max-w-md p-6 text-center">
      <AlertTriangle className="mx-auto mb-3 text-vermelho" />
      <h2 className="font-semibold">Não foi possível carregar os dados</h2>
      <p className="mt-1 text-sm text-suave">{error.message || "Verifique sua conexão e tente de novo."}</p>
      <Button className="mt-4" onClick={reset}>Tentar de novo</Button>
    </Card>
  );
}
