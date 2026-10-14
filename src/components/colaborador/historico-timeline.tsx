import Link from "next/link";
import { Check } from "lucide-react";
import type { ItemHistorico } from "@/lib/data";

function formatarData(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function HistoricoTimeline({ itens }: { itens: ItemHistorico[] }) {
  if (itens.length === 0) return null;

  return (
    <ol className="flex flex-col">
      {itens.map((item, index) => (
        <li key={item.atribuicao.id} className="relative flex gap-4 pb-6 last:pb-0">
          {index !== itens.length - 1 ? (
            <span className="absolute top-6 left-[11px] h-[calc(100%-8px)] w-px bg-muted" aria-hidden />
          ) : null}
          <span className="z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-3.5" />
          </span>
          <Link
            href={`/colaborador/formularios/${item.formulario.id}`}
            className="group flex flex-1 flex-col gap-0.5 pb-1"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span className="text-[14px] font-medium text-foreground group-hover:text-primary">
                {item.formulario.titulo}
              </span>
              <span className="text-[12px] text-muted-foreground/80">{formatarData(item.resposta.enviadoEm)}</span>
            </div>
            <span className="text-[13px] text-muted-foreground">
              {item.formulario.categoria} &middot; {item.resposta.tempoGastoMinutos} min
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
