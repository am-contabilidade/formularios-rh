import { PageHeader } from "@/components/page-header";
import {
  ColaboradorFormulariosLista,
  type ItemFormularioColaborador,
} from "@/components/colaborador/formularios-lista";
import { auth } from "@/auth";
import { colaboradorAtualPlaceholder, getAtribuicoesByColaborador, getFormularioById } from "@/lib/data";

export default async function ColaboradorFormulariosPage() {
  const session = await auth();
  const colaboradorId = session?.user?.id ?? colaboradorAtualPlaceholder.id;
  const atribuicoes = await getAtribuicoesByColaborador(colaboradorId);
  const itens: ItemFormularioColaborador[] = (
    await Promise.all(
      atribuicoes.map(async (atribuicao) => {
        const formulario = await getFormularioById(atribuicao.formularioId);
        return formulario ? { atribuicao, formulario } : undefined;
      })
    )
  ).filter((item): item is ItemFormularioColaborador => !!item);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Portal do colaborador"
        title="Meus formulários"
        description="Todos os formulários atribuídos a você, independentemente do status."
      />
      <ColaboradorFormulariosLista itens={itens} />
    </div>
  );
}
