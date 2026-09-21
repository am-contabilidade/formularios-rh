import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardCheck, Clock3, ListChecks, Lock, Users } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  ColaboradoresTabela,
  type LinhaColaborador,
} from "@/components/gestao/colaboradores-tabela";
import {
  getAtribuicoesByFormulario,
  getColaboradorById,
  getFormularioById,
  getResumoFormulario,
} from "@/lib/data";

export default async function GestaoFormularioDetalhePage({
  params,
}: {
  params: Promise<{ formularioId: string }>;
}) {
  const { formularioId } = await params;
  const formulario = await getFormularioById(formularioId);
  const resumo = await getResumoFormulario(formularioId);

  if (!formulario || !resumo) {
    notFound();
  }

  const atribuicoesFormulario = await getAtribuicoesByFormulario(formularioId);
  const linhas: LinhaColaborador[] = (
    await Promise.all(
      atribuicoesFormulario.map(async (atribuicao) => {
        const colaborador = await getColaboradorById(atribuicao.colaboradorId);
        return colaborador ? { colaborador, atribuicao } : undefined;
      })
    )
  ).filter((linha): linha is LinhaColaborador => !!linha);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/gestao/formularios"
          className="inline-flex w-fit items-center gap-1.5 text-[14px] text-graphite hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Formulários
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium tracking-[0.3px] text-graphite uppercase">
              {formulario.categoria}
            </span>
            <h1 className="text-[28px] leading-[1.2] font-semibold text-ink">
              {formulario.titulo}
            </h1>
            <p className="max-w-2xl text-[16px] text-graphite">{formulario.descricao}</p>
          </div>
          <Button
            variant="outline"
            render={<Link href={`/gestao/formularios/${formulario.id}/perguntas`} />}
            nativeButton={false}
          >
            <ListChecks />
            Perguntas do formulário
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Atribuídos" value={resumo.totalAtribuidos} icon={Users} />
        <StatCard
          label="Respondidos"
          value={resumo.totalRespondidos}
          icon={ClipboardCheck}
          accent
        />
        <StatCard label="Pendentes" value={resumo.totalPendentes} icon={Clock3} />
        <StatCard label="Bloqueados" value={resumo.totalBloqueados} icon={Lock} />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-[20px] font-semibold text-ink">Colaboradores</h2>
        <ColaboradoresTabela linhas={linhas} formularioId={formulario.id} />
      </div>
    </div>
  );
}
