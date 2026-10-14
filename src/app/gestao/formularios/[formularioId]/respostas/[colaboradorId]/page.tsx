import { Suspense } from "react";
import { redirect } from "next/navigation";

type Params = Promise<{ formularioId: string; colaboradorId: string }>;

// A visão individual virou um filtro do painel de respostas.
export default function GestaoRespostaColaboradorPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={null}>
      <Redirecionar params={params} />
    </Suspense>
  );
}

async function Redirecionar({ params }: { params: Params }) {
  const { formularioId, colaboradorId } = await params;
  redirect(`/gestao/formularios/${formularioId}/respostas?colaborador=${colaboradorId}`);
  return null;
}
