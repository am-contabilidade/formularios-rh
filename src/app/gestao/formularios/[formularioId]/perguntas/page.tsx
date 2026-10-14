import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { FluxoPerguntasSkeleton, SkeletonInline } from "@/components/skeletons";
import {
  CategoriaFormulario,
  VoltarParaFormulario,
  VoltarParaFormularioSkeleton,
} from "@/components/formulario-partes";
import { PerguntasFlow } from "@/components/gestao/perguntas-flow";
import { getFormularioById } from "@/lib/data";
import { getColaboradorLogado } from "@/lib/data/sessao";
import { getPerguntasPorTituloFormulario } from "@/lib/perguntas/registro";

type Params = Promise<{ formularioId: string }>;

export default function GestaoFormularioPerguntasPage({ params }: { params: Params }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Suspense fallback={<VoltarParaFormularioSkeleton />}>
          <VoltarParaFormulario params={params} base="/gestao/formularios" />
        </Suspense>
        <PageHeader
          eyebrow={
            <Suspense fallback={<SkeletonInline className="h-3 w-16" />}>
              <CategoriaFormulario params={params} />
            </Suspense>
          }
          title="Perguntas do formulário"
          description="Fluxo em construção — as perguntas ainda vivem só no código, uma seção por vez, para irmos validando antes de salvar no banco."
          icon={ListChecks}
        />
      </div>

      <Suspense fallback={<FluxoPerguntasSkeleton />}>
        <Fluxo params={params} />
      </Suspense>
    </div>
  );
}

async function Fluxo({ params }: { params: Params }) {
  const { formularioId } = await params;
  const [formulario, colaboradorAtual] = await Promise.all([
    getFormularioById(formularioId),
    getColaboradorLogado(),
  ]);
  if (!formulario) notFound();

  const perguntas = getPerguntasPorTituloFormulario(formulario.titulo);
  if (!perguntas) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Ainda sem perguntas"
        description="Esse formulário ainda não tem um conjunto de perguntas montado no código."
      />
    );
  }

  return (
    <PerguntasFlow
      secoes={perguntas.secoes}
      colaboradorAtual={colaboradorAtual}
      mensagemFinal={perguntas.mensagemFinal}
      legendaEscala={perguntas.legendaEscala}
    />
  );
}
