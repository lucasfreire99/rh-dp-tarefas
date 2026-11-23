"use client";

import { usePathname, useRouter } from "next/navigation";
import { Select } from "@/components/ui";

export function SeletorAno({ ano, anos }: { ano: number; anos: number[] }) {
  const router = useRouter();
  const path = usePathname();
  return (
    <label className="flex items-center gap-2 text-sm text-suave">
      Ano
      <Select aria-label="Ano" className="w-24" value={ano} onChange={(e) => router.push(`${path}?ano=${e.target.value}`)}>
        {anos.map((a) => <option key={a} value={a}>{a}</option>)}
      </Select>
    </label>
  );
}
