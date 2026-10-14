import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Clock3, ListChecks, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";
import { RespostaFormularioView } from "@/components/resposta-formulario-view";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonInline } from "@/components/skeletons";
import { getColaboradorLogado } from "@/lib/data/sessao";
import {
  getAtribuicao,
  getFormularioById,
  getRascunho,
  getRespostaByAtribuicao,
} from "@/lib/data";
import { getPerguntasDoFormulario } from "@/lib/perguntas/registro";
import { contarRespondidas } from "@/lib/perguntas/validacao";

function formatarData(data?: string) {
  if (!data) return undefined;
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

type Params = Promise<{ formularioId: string }>;

export default function ColaboradorFormularioPage({ params }: { params: Params }) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/colaborador/formularios"
        className="inline-flex w-fit items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Meus formulários
      </Link>

      <Suspense fallback={<DetalheSkeleton />}>
        <Detalhe params={params} />
      </Suspense>
    </div>
  );
}

function DetalheSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <SkeletonInline className="h-3 w-20" />
          <SkeletonInline className="h-8 w-96 max-w-full" />
          <SkeletonInline className="h-4 w-[32rem] max-w-full" />
        </div>
        <Skeleton className="h-6 w-28 shrink-0 rounded-full" />
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-44" />
      </div>
      <Skeleton className="h-10 w-48 rounded-full" />
    </div>
  );
}

async function Detalhe({ params }: { params: Params }) {
  const { formularioId } = await params;
  const colaboradorId = (await getColaboradorLogado()).id;
  const [formulario, atribuicao] = await Promise.all([
    getFormularioById(formularioId),
    getAtribuicao(formularioId, colaboradorId),
  ]);

  if (!formulario || !atribuicao) {
    notFound();
  }

  const secoes = getPerguntasDoFormulario(formulario)?.secoes ?? [];
  const totalCampos = secoes.reduce((acc, s) => acc + s.campos.length, 0);
  const [resposta, rascunho] = await Promise.all([
    atribuicao.status === "respondido"
      ? getRespostaByAtribuicao(formularioId, colaboradorId)
      : undefined,
    atribuicao.status === "em_andamento" ? getRascunho(atribuicao.id) : undefined,
  ]);
  const progresso = rascunho ? contarRespondidas(secoes, rascunho.respostas) : undefined;

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium tracking-[0.3px] text-muted-foreground uppercase">
              {formulario.categoria}
            </span>
            <h1 className="font-heading text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-foreground">
              {formulario.titulo}
            </h1>
            <p className="max-w-2xl text-[16px] text-muted-foreground">{formulario.descricao}</p>
          </div>
          <StatusBadge status={atribuicao.status} className="shrink-0" />
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4 text-[14px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-4" />
            {formulario.estimativaMinutos} minutos estimados
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="size-4" />
            {totalCampos} perguntas ({secoes.length} seções)
          </span>
          {atribuicao.prazo ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-4" />
              Prazo final: {formatarData(atribuicao.prazo)}
            </span>
          ) : null}
        </div>

        {atribuicao.status === "bloqueado" ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3.5 text-[14px] text-muted-foreground">
            <Lock className="size-4 shrink-0" />
            Este formulário ainda não foi liberado pela gestão de RH para você.
          </div>
        ) : atribuicao.status === "respondido" ? (
          resposta ? (
            <p className="text-[14px] text-muted-foreground">
              Você enviou suas respostas em {formatarData(resposta.enviadoEm)}.
            </p>
          ) : null
        ) : (
          <div className="flex flex-col gap-4">
            {progresso && progresso.total > 0 ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Seu progresso (salvo automaticamente)</span>
                  <span className="font-semibold text-foreground">
                    {progresso.respondidas} de {progresso.total} respondidas
                  </span>
                </div>
                <Progress
                  value={(progresso.respondidas / progresso.total) * 100}
                  className="h-1.5"
                />
              </div>
            ) : null}
            <div>
              <Button
                size="lg"
                render={<Link href={`/colaborador/formularios/${formulario.id}/responder`} />}
                nativeButton={false}
              >
                {atribuicao.status === "em_andamento" ? "Continuar preenchimento" : "Responder formulário"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {resposta ? (
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-[20px] font-semibold text-foreground">Suas respostas</h2>
          <RespostaFormularioView secoes={secoes} resposta={resposta} />
        </div>
      ) : null}
    </>
  );
}
