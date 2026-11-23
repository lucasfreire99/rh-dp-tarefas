import { Card, Skeleton } from "@/components/ui";

export function PaginaSkeleton({ kpis = false }: { kpis?: boolean }) {
  return (
    <div aria-busy="true" aria-label="Carregando">
      <Skeleton className="mb-6 h-8 w-48" />
      {kpis && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      )}
      <Card className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9" />)}
      </Card>
    </div>
  );
}
