import { PageHeader } from "@/components/page-header";
import { AcessosTabela, type LinhaAcesso } from "@/components/gestao/acessos-tabela";
import { getAtribuicoes, getColaboradorById, getFormularioById, getFormularios } from "@/lib/data";

export default async function GestaoAcessosPage() {
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

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="AM Automação"
        title="Gestão de acessos"
        description="Libere ou bloqueie o acesso de cada colaborador aos formulários atribuídos."
      />
      <AcessosTabela linhasIniciais={linhas} formularios={formularios} />
    </div>
  );
}
