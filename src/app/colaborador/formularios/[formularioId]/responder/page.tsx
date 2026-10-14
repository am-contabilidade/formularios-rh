import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { ListChecks } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { FluxoPerguntasSkeleton } from "@/components/skeletons";
import {
  VoltarParaFormulario,
  VoltarParaFormularioSkeleton,
} from "@/components/formulario-partes";
import { ResponderFormulario } from "@/components/colaborador/responder-formulario";
import { getAtribuicao, getFormularioById, getRascunho } from "@/lib/data";
import { getColaboradorLogado } from "@/lib/data/sessao";
import { getPerguntasDoFormulario } from "@/lib/perguntas/registro";

type Params = Promise<{ formularioId: string }>;

export default function ResponderFormularioPage({ params }: { params: Params }) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<VoltarParaFormularioSkeleton />}>
        <VoltarParaFormulario params={params} base="/colaborador/formularios" />
      </Suspense>
      <Suspense fallback={<FluxoPerguntasSkeleton />}>
        <Preenchimento params={params} />
      </Suspense>
    </div>
  );
}

async function Preenchimento({ params }: { params: Params }) {
  const { formularioId } = await params;
  const colaborador = await getColaboradorLogado();
  const [formulario, atribuicao] = await Promise.all([
    getFormularioById(formularioId),
    getAtribuicao(formularioId, colaborador.id),
  ]);

  if (!formulario || !atribuicao || atribuicao.status === "bloqueado") {
    notFound();
  }
  if (atribuicao.status === "respondido") {
    redirect(`/colaborador/formularios/${formularioId}`);
  }

  const perguntas = getPerguntasDoFormulario(formulario);
  if (!perguntas) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Formulário ainda sem perguntas"
        description="As perguntas deste formulário ainda não foram montadas. Fale com o RH."
      />
    );
  }

  const rascunho = await getRascunho(atribuicao.id);
  return (
    <ResponderFormulario
      formularioId={formulario.id}
      atribuicaoId={atribuicao.id}
      rascunho={rascunho}
      secoes={perguntas.secoes}
      mensagemFinal={perguntas.mensagemFinal}
      legendaEscala={perguntas.legendaEscala}
      colaboradorAtual={colaborador}
    />
  );
}
