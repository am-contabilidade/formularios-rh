import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChartColumn, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { iconesNavegacao } from "@/components/icones-navegacao";
import { PageHeaderSkeleton, PainelSkeleton, FiltrosSkeleton, TabelaSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ColaboradoresTabela,
  type LinhaColaborador,
} from "@/components/gestao/colaboradores-tabela";
import { COLUNAS_COLABORADORES_FORMULARIO } from "@/components/gestao/colunas";
import { ResumoFormularioCard } from "@/components/gestao/resumo-formulario-card";
import { VincularColaboradorDialog } from "@/components/gestao/vincular-colaborador-dialog";
import {
  getAtribuicoesByFormulario,
  getColaboradorById,
  getColaboradores,
  getFormularioById,
  getResumoFormulario,
} from "@/lib/data";

type Params = Promise<{ formularioId: string }>;

export default function GestaoFormularioDetalhePage({ params }: { params: Params }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/gestao/formularios"
          className="inline-flex w-fit items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Formulários
        </Link>
        <Suspense fallback={<PageHeaderSkeleton icon={iconesNavegacao.formularios} comAcoes />}>
          <Cabecalho params={params} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
        <Suspense fallback={<PainelSkeleton titulo="Resumo" />}>
          <Resumo params={params} />
        </Suspense>
        <Suspense
          fallback={
            <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[16px] font-semibold text-foreground">Colaboradores</span>
                <Skeleton className="h-8 w-40 rounded-full" />
              </div>
              <div className="border-t border-border pt-5">
                <FiltrosSkeleton />
              </div>
              <TabelaSkeleton colunas={COLUNAS_COLABORADORES_FORMULARIO} linhas={5} />
            </div>
          }
        >
          <Colaboradores params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function Cabecalho({ params }: { params: Params }) {
  const { formularioId } = await params;
  const formulario = await getFormularioById(formularioId);
  if (!formulario) notFound();

  return (
    <PageHeader
      eyebrow={formulario.categoria}
      title={formulario.titulo}
      description={formulario.descricao}
      icon={iconesNavegacao.formularios}
      actions={
        <>
          <Button
            variant="outline"
            render={<Link href={`/gestao/formularios/${formulario.id}/perguntas`} />}
            nativeButton={false}
          >
            <ListChecks />
            Perguntas
          </Button>
          <Button
            render={<Link href={`/gestao/formularios/${formulario.id}/respostas`} />}
            nativeButton={false}
          >
            <ChartColumn />
            Ver respostas
          </Button>
        </>
      }
    />
  );
}

async function Resumo({ params }: { params: Params }) {
  const { formularioId } = await params;
  const resumo = await getResumoFormulario(formularioId);
  if (!resumo) return null;
  return <ResumoFormularioCard resumo={resumo} />;
}

async function Colaboradores({ params }: { params: Params }) {
  const { formularioId } = await params;
  const [atribuicoesFormulario, todosColaboradores] = await Promise.all([
    getAtribuicoesByFormulario(formularioId),
    getColaboradores(),
  ]);
  const linhas: LinhaColaborador[] = (
    await Promise.all(
      atribuicoesFormulario.map(async (atribuicao) => {
        const colaborador = await getColaboradorById(atribuicao.colaboradorId);
        return colaborador ? { colaborador, atribuicao } : undefined;
      })
    )
  ).filter((linha): linha is LinhaColaborador => !!linha);

  const jaVinculados = new Set(atribuicoesFormulario.map((a) => a.colaboradorId));
  const colaboradoresDisponiveis = todosColaboradores.filter((c) => !jaVinculados.has(c.id));

  return (
    <ColaboradoresTabela
      linhas={linhas}
      formularioId={formularioId}
      headerAction={
        <VincularColaboradorDialog
          formularioId={formularioId}
          colaboradoresDisponiveis={colaboradoresDisponiveis}
        />
      }
    />
  );
}
