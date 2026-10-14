import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Atribuicao, Formulario } from "@/lib/types";

function formatarData(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });
}

function diasRestantes(data: string) {
  const hoje = new Date("2026-09-16T00:00:00");
  const prazo = new Date(`${data}T00:00:00`);
  return Math.max(0, Math.round((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)));
}

export function FeaturedDeadline({
  formulario,
  atribuicao,
}: {
  formulario: Formulario;
  atribuicao: Atribuicao;
}) {
  if (!atribuicao.prazo) return null;
  const dias = diasRestantes(atribuicao.prazo);

  return (
    <div className="flex flex-col gap-5 overflow-hidden rounded-xl border border-amber-200 bg-amber-50 px-8 py-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.3px] text-amber-700 uppercase">
          <CalendarClock className="size-3.5" />
          Prazo se aproximando
        </span>
        <h3 className="text-[24px] leading-[1.2] font-semibold text-foreground font-heading">
          {formulario.titulo}
        </h3>
        <p className="max-w-lg text-[14px] text-muted-foreground">
          Faltam {dias} {dias === 1 ? "dia" : "dias"} para o prazo final, em{" "}
          {formatarData(atribuicao.prazo)}. Reserve {formulario.estimativaMinutos} minutos para
          concluir.
        </p>
      </div>
      <Button
        size="lg"
        className="shrink-0"
        render={<Link href={`/colaborador/formularios/${formulario.id}`} />}
        nativeButton={false}
      >
        Responder agora
        <ArrowRight />
      </Button>
    </div>
  );
}
