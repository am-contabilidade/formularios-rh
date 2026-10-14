import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ResumoFormulario } from "@/lib/data";
import { coresResumo } from "@/lib/cores-status";

const SEGMENTOS = [
  { chave: "totalRespondidos", label: "Respondidos", cores: coresResumo.respondidos },
  { chave: "totalPendentes", label: "Pendentes", cores: coresResumo.pendentes },
  { chave: "totalBloqueados", label: "Bloqueados", cores: coresResumo.bloqueados },
] as const;

export function ResumoFormularioCard({ resumo }: { resumo: ResumoFormulario }) {
  const total = resumo.totalAtribuidos || 1;
  const percentualRespondido = Math.round((resumo.totalRespondidos / total) * 100);

  return (
    <Card className="rounded-xl border-border bg-card py-0">
      <CardContent className="flex flex-col gap-5 p-6">
        <span className="text-[16px] font-semibold text-foreground">Resumo</span>

        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-medium tracking-[0.3px] text-muted-foreground uppercase">
            Colaboradores atribuídos
          </span>
          <span className="font-heading text-[32px] font-bold tracking-[-0.02em] text-foreground">{resumo.totalAtribuidos}</span>
        </div>

        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {SEGMENTOS.map(({ chave, cores }) => {
            const valor = resumo[chave];
            if (!valor) return null;
            return (
              <div
                key={chave}
                className={cn("h-full", cores.barra)}
                style={{ width: `${(valor / total) * 100}%` }}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4">
          {SEGMENTOS.map(({ chave, label, cores }) => (
            <span key={chave} className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <span className={cn("size-2 rounded-full", cores.ponto)} />
              {label}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2.5 border-t border-border pt-4">
          {SEGMENTOS.map(({ chave, label }) => (
            <div key={chave} className="flex items-center justify-between">
              <span className="text-[14px] text-foreground">{label}</span>
              <span className="text-[14px] font-semibold text-foreground">{resumo[chave]}</span>
            </div>
          ))}
        </div>

        <p className="border-t border-border pt-4 text-[13px] text-muted-foreground">
          {percentualRespondido}% do total já respondeu o formulário
        </p>
      </CardContent>
    </Card>
  );
}
