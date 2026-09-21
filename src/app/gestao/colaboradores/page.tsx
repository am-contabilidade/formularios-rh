import { PageHeader } from "@/components/page-header";
import { ColaboradoresLista } from "@/components/gestao/colaboradores-lista";
import { getAtribuicoes, getColaboradores } from "@/lib/data";

export default async function GestaoColaboradoresPage() {
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

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="AM Automação"
        title="Colaboradores"
        description="Todos os colaboradores cadastrados e o andamento dos formulários de cada um."
      />
      <ColaboradoresLista linhas={linhas} />
    </div>
  );
}
