/**
 * Pedaços de texto das páginas de formulário que vêm do banco. Cada um vai
 * dentro do seu próprio <Suspense> (com `SkeletonInline` de fallback) para
 * que o resto da página — moldura, títulos fixos, botões — apareça na hora.
 * `getFormularioById` é deduplicado por requisição (React `cache`).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SkeletonInline } from "@/components/skeletons";
import { getFormularioById } from "@/lib/data";

type Params = Promise<{ formularioId: string }>;

const CLASSE_VOLTAR =
  "inline-flex w-fit items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground";

/** "← Título do formulário" apontando para `base/<id>`. */
export async function VoltarParaFormulario({ params, base }: { params: Params; base: string }) {
  const { formularioId } = await params;
  const formulario = await getFormularioById(formularioId);
  if (!formulario) notFound();
  return (
    <Link href={`${base}/${formulario.id}`} className={CLASSE_VOLTAR}>
      <ArrowLeft className="size-4" />
      {formulario.titulo}
    </Link>
  );
}

export function VoltarParaFormularioSkeleton() {
  return (
    <span className={CLASSE_VOLTAR}>
      <ArrowLeft className="size-4" />
      <SkeletonInline className="h-4 w-56" />
    </span>
  );
}

export async function CategoriaFormulario({ params }: { params: Params }) {
  const { formularioId } = await params;
  const formulario = await getFormularioById(formularioId);
  return <>{formulario?.categoria}</>;
}

export async function TituloFormulario({ params }: { params: Params }) {
  const { formularioId } = await params;
  const formulario = await getFormularioById(formularioId);
  return <>{formulario?.titulo}</>;
}
