import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { iconesNavegacao } from "@/components/icones-navegacao";
import { FiltrosSkeleton, TabelaSkeleton } from "@/components/skeletons";
import { AcessosTabela, type LinhaAcesso } from "@/components/gestao/acessos-tabela";
import { COLUNAS_ACESSOS } from "@/components/gestao/colunas";
import { getAtribuicoes, getColaboradorById, getFormularioById, getFormularios } from "@/lib/data";

export default function GestaoAcessosPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="AM Automação"
        title="Gestão de acessos"
        icon={iconesNavegacao.acessos}
        description="Libere ou bloqueie o acesso de cada colaborador aos formulários atribuídos."
      />
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <FiltrosSkeleton selects={2} />
            <TabelaSkeleton colunas={COLUNAS_ACESSOS} linhas={10} />
          </div>
        }
      >
        <ListaAcessos />
      </Suspense>
    </div>
  );
}

async function ListaAcessos() {
  const [atribuicoes, formularios] = await Promise.all([getAtribuicoes(), getFormularios()]);
  const linhas: LinhaAcesso[] = (
    await Promise.all(
      atribuicoes.map(async (atribuicao) => {
        const colaborador = await getColaboradorById(atribuicao.colaboradorId);
        const formulario = await getFormularioById(atribuicao.formularioId);
        if (!colaborador || !formulario) return undefined;
        return { atribuicao, colaborador, formulario };
      })
    )
  ).filter((linha): linha is LinhaAcesso => !!linha);

  return <AcessosTabela linhasIniciais={linhas} formularios={formularios} />;
}
