import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default function FormularioNaoEncontrado() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <EmptyState
        icon={FileQuestion}
        title="Formulário não encontrado"
        description="Este formulário não existe ou não está atribuído a você."
        action={
          <Button render={<Link href="/colaborador/formularios" />} nativeButton={false}>
            Voltar para meus formulários
          </Button>
        }
      />
    </div>
  );
}
