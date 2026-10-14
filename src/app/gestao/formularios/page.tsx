import { Suspense } from "react";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { iconesNavegacao } from "@/components/icones-navegacao";
import { EmptyState } from "@/components/empty-state";
import { CardsGridSkeleton } from "@/components/skeletons";
import { GestaoFormularioCard } from "@/components/gestao/formulario-card";
import { getResumosFormularios } from "@/lib/data";

export default function GestaoFormulariosPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="AM Automação"
        title="Formulários"
        icon={iconesNavegacao.formularios}
        description="Todos os formulários criados para o RH, com o andamento das respostas."
      />
      <Suspense fallback={<CardsGridSkeleton />}>
        <ListaFormularios />
      </Suspense>
    </div>
  );
}

async function ListaFormularios() {
  const resumos = await getResumosFormularios();
  if (resumos.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nenhum formulário cadastrado"
        description="Assim que os formulários forem criados, eles aparecem aqui."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {resumos.map((resumo) => (
        <GestaoFormularioCard key={resumo.formulario.id} resumo={resumo} />
      ))}
    </div>
  );
}
