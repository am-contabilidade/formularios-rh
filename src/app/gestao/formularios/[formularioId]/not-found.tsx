import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default function GestaoFormularioNaoEncontrado() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <EmptyState
        icon={FileQuestion}
        title="Formulário não encontrado"
        description="O formulário solicitado não existe ou foi removido."
        action={
          <Button render={<Link href="/gestao/formularios" />} nativeButton={false}>
            Voltar para formulários
          </Button>
        }
      />
    </div>
  );
}
