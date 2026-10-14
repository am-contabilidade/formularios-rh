import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { iconesNavegacao } from "@/components/icones-navegacao";
import { FiltrosSkeleton, TabelaSkeleton } from "@/components/skeletons";
import { ColaboradoresLista } from "@/components/gestao/colaboradores-lista";
import { COLUNAS_COLABORADORES } from "@/components/gestao/colunas";
import { getAtribuicoes, getColaboradores } from "@/lib/data";

export default function GestaoColaboradoresPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="AM Automação"
        title="Colaboradores"
        icon={iconesNavegacao.colaboradores}
        description="Todos os colaboradores cadastrados e o andamento dos formulários de cada um."
      />
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <FiltrosSkeleton />
            <TabelaSkeleton colunas={COLUNAS_COLABORADORES} linhas={10} />
          </div>
        }
      >
        <ListaColaboradores />
      </Suspense>
    </div>
  );
}

async function ListaColaboradores() {
  const [colaboradores, atribuicoes] = await Promise.all([getColaboradores(), getAtribuicoes()]);
  const linhas = colaboradores.map((colaborador) => {
    const doColaborador = atribuicoes.filter((a) => a.colaboradorId === colaborador.id);
    return {
      colaborador,
      totalAtribuidos: doColaborador.length,
      totalRespondidos: doColaborador.filter((a) => a.status === "respondido").length,
      totalPendentes: doColaborador.filter(
        (a) => a.status === "aguardando" || a.status === "em_andamento"
      ).length,
      totalBloqueados: doColaborador.filter((a) => a.status === "bloqueado").length,
    };
  });
  return <ColaboradoresLista linhas={linhas} />;
}
