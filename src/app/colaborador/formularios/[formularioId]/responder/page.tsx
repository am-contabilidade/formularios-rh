import { notFound, redirect } from "next/navigation";
import { FormularioWizard } from "@/components/colaborador/formulario-wizard";
import { auth } from "@/auth";
import { colaboradorAtualPlaceholder, getAtribuicao, getFormularioById } from "@/lib/data";

export default async function ResponderFormularioPage({
  params,
}: {
  params: Promise<{ formularioId: string }>;
}) {
  const { formularioId } = await params;
  const session = await auth();
  const colaboradorId = session?.user?.id ?? colaboradorAtualPlaceholder.id;
  const [formulario, atribuicao] = await Promise.all([
    getFormularioById(formularioId),
    getAtribuicao(formularioId, colaboradorId),
  ]);

  if (!formulario || !atribuicao || atribuicao.status === "bloqueado") {
    notFound();
  }

  if (atribuicao.status === "respondido") {
    redirect(`/colaborador/formularios/${formularioId}`);
  }

  return <FormularioWizard formulario={formulario} colaboradorId={colaboradorId} />;
}
