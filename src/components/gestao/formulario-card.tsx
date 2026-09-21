import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ResumoFormulario } from "@/lib/data";

const MAX_AVATARES = 4;

export function GestaoFormularioCard({ resumo }: { resumo: ResumoFormulario }) {
  const { formulario, totalAtribuidos, totalRespondidos, totalPendentes, totalBloqueados, colaboradores } =
    resumo;
  const percentualConcluido =
    totalAtribuidos > 0 ? Math.round((totalRespondidos / totalAtribuidos) * 100) : 0;
  const visiveis = colaboradores.slice(0, MAX_AVATARES);
  const restantes = colaboradores.length - visiveis.length;

  return (
    <Card className="group rounded-2xl border-black/6 py-0 shadow-elevated transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated-lg">
      <CardContent className="flex h-full flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[12px] font-medium tracking-[0.3px] text-graphite uppercase">
            {formulario.categoria}
          </span>
          {visiveis.length > 0 ? (
            <AvatarGroup>
              {visiveis.map((colaborador) => (
                <Tooltip key={colaborador.id}>
                  <TooltipTrigger
                    render={
                      <Avatar className="size-7 rounded-full ring-2 ring-white">
                        <AvatarFallback className="bg-blue text-[11px] text-white">
                          {colaborador.iniciais}
                        </AvatarFallback>
                      </Avatar>
                    }
                  />
                  <TooltipContent>{colaborador.nome}</TooltipContent>
                </Tooltip>
              ))}
              {restantes > 0 ? (
                <AvatarGroupCount className="size-7 text-[11px] ring-2 ring-white">
                  +{restantes}
                </AvatarGroupCount>
              ) : null}
            </AvatarGroup>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <h3 className="text-[20px] leading-[1.3] font-semibold text-ink">
            {formulario.titulo}
          </h3>
          <p className="line-clamp-2 text-[14px] leading-[1.5] text-graphite">
            {formulario.descricao}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-black/8 pt-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[20px] font-semibold text-ink">{totalRespondidos}</span>
            <span className="text-[12px] text-graphite">Respondidos</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[20px] font-semibold text-ink">{totalPendentes}</span>
            <span className="text-[12px] text-graphite">Pendentes</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[20px] font-semibold text-ink">{totalBloqueados}</span>
            <span className="text-[12px] text-graphite">Bloqueados</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper">
            <div
              className="h-full rounded-full bg-blue"
              style={{ width: `${percentualConcluido}%` }}
            />
          </div>
          <span className="text-[12px] font-medium text-graphite">{percentualConcluido}%</span>
        </div>

        <Button
          variant="outline"
          className="w-full"
          render={<Link href={`/gestao/formularios/${formulario.id}`} />}
          nativeButton={false}
        >
          Ver detalhes
          <ArrowRight />
        </Button>
      </CardContent>
    </Card>
  );
}
