import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { GestaoFormularioCard } from "@/components/gestao/formulario-card";
import { getResumosFormularios } from "@/lib/data";

export default async function GestaoFormulariosPage() {
  const resumos = await getResumosFormularios();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="AM Automação"
        title="Formulários"
        description="Todos os formulários criados para o RH, com o andamento das respostas."
      />
      {resumos.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum formulário cadastrado"
          description="Assim que os formulários forem criados, eles aparecem aqui."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resumos.map((resumo) => (
            <GestaoFormularioCard key={resumo.formulario.id} resumo={resumo} />
          ))}
        </div>
      )}
    </div>
  );
}
