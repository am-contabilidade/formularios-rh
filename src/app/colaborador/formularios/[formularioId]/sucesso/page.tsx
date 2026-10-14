import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonInline } from "@/components/skeletons";
import { TituloFormulario } from "@/components/formulario-partes";
import { getFormularioById } from "@/lib/data";

type Params = Promise<{ formularioId: string }>;

export default function SucessoFormularioPage({ params }: { params: Params }) {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-primary/30 bg-primary/8 text-primary">
          <CheckCircle2 className="size-7" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-foreground">
            Respostas enviadas
          </h1>
          <p className="text-[16px] text-muted-foreground">
            Obrigado! Suas respostas para{" "}
            <span className="font-medium text-foreground">
              <Suspense fallback={<SkeletonInline className="h-4 w-48" />}>
                <TituloFormulario params={params} />
              </Suspense>
            </span>{" "}
            foram registradas com sucesso e já estão disponíveis para a gestão de RH.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Suspense fallback={<Skeleton className="h-9 w-44 rounded-full" />}>
            <VerRespostas params={params} />
          </Suspense>
          <Button render={<Link href="/colaborador/formularios" />} nativeButton={false}>
            Voltar para meus formulários
          </Button>
        </div>
      </div>
    </div>
  );
}

async function VerRespostas({ params }: { params: Params }) {
  const { formularioId } = await params;
  const formulario = await getFormularioById(formularioId);
  if (!formulario) notFound();
  return (
    <Button
      variant="outline"
      render={<Link href={`/colaborador/formularios/${formulario.id}`} />}
      nativeButton={false}
    >
      Ver minhas respostas
    </Button>
  );
}
