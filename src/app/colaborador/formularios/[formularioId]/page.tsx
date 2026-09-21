import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Clock3, ListChecks, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { RespostaFormularioView } from "@/components/resposta-formulario-view";
import { auth } from "@/auth";
import {
  colaboradorAtualPlaceholder,
  getAtribuicao,
  getFormularioById,
  getRespostaByAtribuicao,
} from "@/lib/data";

function formatarData(data?: string) {
  if (!data) return undefined;
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function ColaboradorFormularioPage({
  params,
}: {
  params: Promise<{ formularioId: string }>;
}) {
  const { formularioId } = await params;
  const session = await auth();
  const colaboradorId = session?.user?.id ?? colaboradorAtualPlaceholder.id;
  const [formulario, atribuicao] = await Promise.all([
    getFormularioById(formularioId),
    getAtribuicao(formularioId, colaboradorId),
  ]);

  if (!formulario || !atribuicao) {
    notFound();
  }

  const totalCampos = formulario.secoes.reduce((acc, s) => acc + s.campos.length, 0);
  const resposta =
    atribuicao.status === "respondido"
      ? await getRespostaByAtribuicao(formularioId, colaboradorId)
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/colaborador/formularios"
        className="inline-flex w-fit items-center gap-1.5 text-[14px] text-graphite hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Meus formulários
      </Link>

      <div className="flex flex-col gap-4 rounded-lg border border-black/8 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium tracking-[0.3px] text-graphite uppercase">
              {formulario.categoria}
            </span>
            <h1 className="text-[28px] leading-[1.2] font-semibold text-ink">
              {formulario.titulo}
            </h1>
            <p className="max-w-2xl text-[16px] text-graphite">{formulario.descricao}</p>
          </div>
          <StatusBadge status={atribuicao.status} className="shrink-0" />
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-black/8 pt-4 text-[14px] text-graphite">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-4" />
            {formulario.estimativaMinutos} minutos estimados
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="size-4" />
            {totalCampos} perguntas ({formulario.secoes.length} seções)
          </span>
          {atribuicao.prazo ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-4" />
              Prazo final: {formatarData(atribuicao.prazo)}
            </span>
          ) : null}
        </div>

        {atribuicao.status === "bloqueado" ? (
          <div className="flex items-center gap-3 rounded-lg border border-black/8 bg-paper px-4 py-3.5 text-[14px] text-graphite">
            <Lock className="size-4 shrink-0" />
            Este formulário ainda não foi liberado pela gestão de RH para você.
          </div>
        ) : atribuicao.status === "respondido" ? (
          resposta ? (
            <p className="text-[14px] text-graphite">
              Você enviou suas respostas em {formatarData(resposta.enviadoEm)}.
            </p>
          ) : null
        ) : (
          <div>
            <Button
              size="lg"
              render={<Link href={`/colaborador/formularios/${formulario.id}/responder`} />}
              nativeButton={false}
            >
              {atribuicao.status === "em_andamento" ? "Continuar preenchimento" : "Responder formulário"}
            </Button>
          </div>
        )}
      </div>

      {resposta ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-[20px] font-semibold text-ink">Suas respostas</h2>
          <RespostaFormularioView formulario={formulario} resposta={resposta} />
        </div>
      ) : null}
    </div>
  );
}
