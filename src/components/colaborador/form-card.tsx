import Link from "next/link";
import { Clock3, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import type { Atribuicao, Formulario } from "@/lib/types";

function formatarData(data?: string) {
  if (!data) return undefined;
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

const ctaLabel: Record<Atribuicao["status"], string> = {
  aguardando: "Responder",
  em_andamento: "Continuar",
  respondido: "Ver respostas",
  bloqueado: "Bloqueado",
};

export function ColaboradorFormCard({
  formulario,
  atribuicao,
}: {
  formulario: Formulario;
  atribuicao: Atribuicao;
}) {
  const bloqueado = atribuicao.status === "bloqueado";
  const href = `/colaborador/formularios/${formulario.id}`;
  const prazo = formatarData(atribuicao.prazo);

  return (
    <Card className="rounded-2xl border-black/6 py-0 shadow-elevated transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated-lg">
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[12px] font-medium tracking-[0.3px] text-graphite uppercase">
            {formulario.categoria}
          </span>
          <StatusBadge status={atribuicao.status} />
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <h3 className="text-[20px] leading-[1.3] font-semibold text-ink">
            {formulario.titulo}
          </h3>
          <p className="line-clamp-2 text-[14px] leading-[1.5] text-graphite">
            {formulario.descricao}
          </p>
        </div>

        <div className="flex items-center gap-3 text-[12px] text-graphite">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" />
            {formulario.estimativaMinutos} min
          </span>
          {prazo ? (
            <span className="inline-flex items-center gap-1">
              &middot; Prazo {prazo}
            </span>
          ) : null}
        </div>

        {bloqueado ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-black/8 bg-paper px-3 py-2 text-[13px] text-graphite">
              <Lock className="size-3.5 shrink-0" />
              Liberado pela gestão em breve.
            </div>
            <Button variant="outline" disabled className="w-full">
              {ctaLabel[atribuicao.status]}
            </Button>
          </div>
        ) : (
          <Button render={<Link href={href} />} nativeButton={false} className="w-full">
            {ctaLabel[atribuicao.status]}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
