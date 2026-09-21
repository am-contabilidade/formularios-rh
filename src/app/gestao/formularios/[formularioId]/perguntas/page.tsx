import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PerguntasFlow } from "@/components/gestao/perguntas-flow";
import { auth } from "@/auth";
import { colaboradorAtualPlaceholder, getColaboradorById, getFormularioById } from "@/lib/data";
import {
  mensagemFinalMapeamentoCompetenciasFiscal,
  secoesMapeamentoCompetenciasFiscal,
} from "@/lib/perguntas/mapeamento-competencias-fiscal";

export default async function GestaoFormularioPerguntasPage({
  params,
}: {
  params: Promise<{ formularioId: string }>;
}) {
  const { formularioId } = await params;
  const formulario = await getFormularioById(formularioId);
  if (!formulario) notFound();

  const session = await auth();
  const colaboradorAtual =
    (session?.user ? await getColaboradorById(session.user.id) : undefined) ??
    colaboradorAtualPlaceholder;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href={`/gestao/formularios/${formulario.id}`}
          className="inline-flex w-fit items-center gap-1.5 text-[14px] text-graphite hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          {formulario.titulo}
        </Link>
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-medium tracking-[0.3px] text-graphite uppercase">
            {formulario.categoria}
          </span>
          <h1 className="text-[28px] leading-[1.2] font-semibold text-ink">
            Perguntas do formulário
          </h1>
          <p className="max-w-2xl text-[16px] text-graphite">
            Fluxo em construção — as perguntas ainda vivem só no código, uma seção por vez, para
            irmos validando antes de salvar no banco.
          </p>
        </div>
      </div>

      <PerguntasFlow
        secoes={secoesMapeamentoCompetenciasFiscal}
        colaboradorAtual={colaboradorAtual}
        mensagemFinal={mensagemFinalMapeamentoCompetenciasFiscal}
      />
    </div>
  );
}
