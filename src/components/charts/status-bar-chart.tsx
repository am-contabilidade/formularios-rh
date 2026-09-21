import Link from "next/link";
import type { ResumoFormulario } from "@/lib/data";

const legenda = [
  { chave: "respondidos", label: "Respondido", cor: "bg-blue" },
  { chave: "pendentes", label: "Pendente", cor: "bg-marigold" },
  { chave: "bloqueados", label: "Bloqueado", cor: "bg-mist" },
] as const;

export function StatusBarChart({ resumos }: { resumos: ResumoFormulario[] }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        {legenda.map((item) => (
          <span key={item.chave} className="inline-flex items-center gap-1.5 text-[12px] text-graphite">
            <span className={`size-2 rounded-full ${item.cor}`} />
            {item.label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {resumos.map((resumo) => {
          const total = resumo.totalAtribuidos || 1;
          const pctRespondido = (resumo.totalRespondidos / total) * 100;
          const pctPendente = (resumo.totalPendentes / total) * 100;
          const pctBloqueado = (resumo.totalBloqueados / total) * 100;

          return (
            <Link
              key={resumo.formulario.id}
              href={`/gestao/formularios/${resumo.formulario.id}`}
              className="group flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-[13px] font-medium text-ink group-hover:text-blue">
                  {resumo.formulario.titulo}
                </span>
                <span className="shrink-0 text-[12px] text-graphite">
                  {resumo.totalRespondidos}/{resumo.totalAtribuidos}
                </span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-paper">
                {pctRespondido > 0 ? (
                  <div className="h-full bg-blue" style={{ width: `${pctRespondido}%` }} />
                ) : null}
                {pctPendente > 0 ? (
                  <div className="h-full bg-marigold" style={{ width: `${pctPendente}%` }} />
                ) : null}
                {pctBloqueado > 0 ? (
                  <div className="h-full bg-mist" style={{ width: `${pctBloqueado}%` }} />
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
