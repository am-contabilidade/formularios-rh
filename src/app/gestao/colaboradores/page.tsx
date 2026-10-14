import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { iconesNavegacao } from "@/components/icones-navegacao";
import { FiltrosSkeleton, TabelaSkeleton } from "@/components/skeletons";
import {
  ColaboradoresGestao,
  type LinhaColaboradorGestao,
} from "@/components/gestao/colaboradores-gestao";
import { COLUNAS_COLABORADORES } from "@/components/gestao/colunas";
import { getAtribuicoes, getColaboradores, getFormularios } from "@/lib/data";

export default function GestaoColaboradoresPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="AM Automação"
        title="Colaboradores"
        icon={iconesNavegacao.colaboradores}
        description="Todos os colaboradores e os formulários de cada um. Clique em um colaborador para liberar ou bloquear acessos, ver respostas e vincular a novos formulários."
      />
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <FiltrosSkeleton selects={3} />
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
  const [colaboradores, atribuicoes, formularios] = await Promise.all([
    getColaboradores(),
    getAtribuicoes(),
    getFormularios(),
  ]);
  const titulos = new Map(formularios.map((f) => [f.id, f.titulo]));

  const linhas: LinhaColaboradorGestao[] = colaboradores.map((colaborador) => ({
    colaborador,
    vinculos: atribuicoes
      .filter((a) => a.colaboradorId === colaborador.id && titulos.has(a.formularioId))
      .map((atribuicao) => ({ atribuicao, formularioTitulo: titulos.get(atribuicao.formularioId)! })),
  }));

  return (
    <ColaboradoresGestao
      linhas={linhas}
      formularios={formularios.map((f) => ({ id: f.id, titulo: f.titulo }))}
    />
  );
}
