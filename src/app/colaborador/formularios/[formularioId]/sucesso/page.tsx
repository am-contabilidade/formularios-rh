import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFormularioById } from "@/lib/data";

export default async function SucessoFormularioPage({
  params,
}: {
  params: Promise<{ formularioId: string }>;
}) {
  const { formularioId } = await params;
  const formulario = await getFormularioById(formularioId);

  if (!formulario) {
    notFound();
  }

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-blue/30 bg-blue/8 text-blue">
          <CheckCircle2 className="size-7" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] leading-[1.2] font-semibold text-ink">
            Respostas enviadas
          </h1>
          <p className="text-[16px] text-graphite">
            Obrigado! Suas respostas para <span className="font-medium text-ink">{formulario.titulo}</span> foram
            registradas com sucesso e já estão disponíveis para a gestão de RH.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            render={<Link href={`/colaborador/formularios/${formulario.id}`} />}
            nativeButton={false}
          >
            Ver minhas respostas
          </Button>
          <Button render={<Link href="/colaborador/formularios" />} nativeButton={false}>
            Voltar para meus formulários
          </Button>
        </div>
      </div>
    </div>
  );
}
