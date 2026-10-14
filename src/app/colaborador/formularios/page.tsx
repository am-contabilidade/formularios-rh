import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { iconesNavegacao } from "@/components/icones-navegacao";
import { CardsGridSkeleton } from "@/components/skeletons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ColaboradorFormulariosLista,
  type ItemFormularioColaborador,
} from "@/components/colaborador/formularios-lista";
import { getAtribuicoesByColaborador, getFormularioById } from "@/lib/data";
import { getColaboradorLogado } from "@/lib/data/sessao";
import { filtrosStatusAcesso } from "@/lib/labels";

export default function ColaboradorFormulariosPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Portal do colaborador"
        title="Meus formulários"
        icon={iconesNavegacao.formularios}
        description="Todos os formulários atribuídos a você, independentemente do status."
      />
      <Suspense
        fallback={
          <>
            {/* As abas são fixas; só os cards dependem do banco. */}
            <Tabs value="todos">
              <TabsList>
                {filtrosStatusAcesso.map((f) => (
                  <TabsTrigger key={f.value} value={f.value}>
                    {f.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <CardsGridSkeleton />
          </>
        }
      >
        <ListaMeusFormularios />
      </Suspense>
    </div>
  );
}

async function ListaMeusFormularios() {
  const colaborador = await getColaboradorLogado();
  const atribuicoes = await getAtribuicoesByColaborador(colaborador.id);
  const itens: ItemFormularioColaborador[] = (
    await Promise.all(
      atribuicoes.map(async (atribuicao) => {
        const formulario = await getFormularioById(atribuicao.formularioId);
        return formulario ? { atribuicao, formulario } : undefined;
      })
    )
  ).filter((item): item is ItemFormularioColaborador => !!item);

  return <ColaboradorFormulariosLista itens={itens} />;
}
