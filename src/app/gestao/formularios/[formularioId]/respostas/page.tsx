import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CalendarCheck2, FileSpreadsheet, FileText, ChartColumn, Clock3, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { GraficoCardSkeleton, SkeletonInline } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { urlExportacao } from "@/lib/relatorios/url";
import {
  CategoriaFormulario,
  VoltarParaFormulario,
  VoltarParaFormularioSkeleton,
} from "@/components/formulario-partes";
import { EmptyState } from "@/components/empty-state";
import { iconesNavegacao } from "@/components/icones-navegacao";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CardPergunta } from "@/components/gestao/grafico-distribuicao";
import { FiltroColaborador } from "@/components/gestao/filtro-colaborador";
import { getColaboradoresByIds, getFormularioById, getRespostasByFormulario } from "@/lib/data";
import { getPerguntasDoFormulario } from "@/lib/perguntas/registro";
import { agregarRespostas } from "@/lib/respostas/agregar";

function formatarData(data: string) {
  return new Date(`${data.slice(0, 10)}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatarMedia(valor: number) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

type Params = Promise<{ formularioId: string }>;
type SearchParams = Promise<{ colaborador?: string }>;

export default function GestaoRespostasFormularioPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<VoltarParaFormularioSkeleton />}>
        <VoltarParaFormulario params={params} base="/gestao/formularios" />
      </Suspense>

      <PageHeader
        eyebrow={
          <Suspense fallback={<SkeletonInline className="h-3 w-16" />}>
            <CategoriaFormulario params={params} />
          </Suspense>
        }
        title="Respostas do formulário"
        description={
          <Suspense fallback={<SkeletonInline className="h-3.5 w-80 max-w-full" />}>
            <ResumoRespondentes params={params} />
          </Suspense>
        }
        icon={iconesNavegacao.formularios}
      />

      <Suspense fallback={<PainelRespostasSkeleton />}>
        <PainelRespostas params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function PainelRespostasSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-full rounded-full sm:w-80" />
        <Skeleton className="h-3.5 w-64" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[28, 44, 36, 24, 20, 32, 40, 28].map((w, i) => (
          <Skeleton key={i} className="h-6 rounded-full" style={{ width: `${w * 4}px` }} />
        ))}
      </div>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-6">
        <Skeleton className="h-5 w-56" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <GraficoCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}

async function ResumoRespondentes({ params }: { params: Params }) {
  const { formularioId } = await params;
  const [formulario, respostas] = await Promise.all([
    getFormularioById(formularioId),
    getRespostasByFormulario(formularioId),
  ]);
  if (respostas.length === 0) return <>Ninguém respondeu ainda.</>;
  return (
    <>
      {respostas.length} {respostas.length === 1 ? "colaborador respondeu" : "colaboradores responderam"}
      {formulario ? ` · ${formulario.titulo}` : null}
    </>
  );
}

async function PainelRespostas({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ formularioId }, { colaborador: colaboradorFiltro }] = await Promise.all([
    params,
    searchParams,
  ]);

  const [formulario, respostas] = await Promise.all([
    getFormularioById(formularioId),
    getRespostasByFormulario(formularioId),
  ]);
  if (!formulario) notFound();

  const perguntas = getPerguntasDoFormulario(formulario);
  const colaboradores = await getColaboradoresByIds(respostas.map((r) => r.colaboradorId));
  const nomes = new Map(colaboradores.map((c) => [c.id, c.nome]));
  const respondentes = colaboradores
    .filter((c) => respostas.some((r) => r.colaboradorId === c.id))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const respostaSelecionada = colaboradorFiltro
    ? respostas.find((r) => r.colaboradorId === colaboradorFiltro)
    : undefined;
  const colaboradorSelecionado = respostaSelecionada
    ? colaboradores.find((c) => c.id === respostaSelecionada.colaboradorId)
    : undefined;
  const recorte = respostaSelecionada ? [respostaSelecionada] : respostas;
  const secoes = perguntas ? agregarRespostas(perguntas.secoes, recorte, nomes) : [];

  return (
    <>
      {!perguntas ? (
        <EmptyState
          icon={ListChecks}
          title="Formulário sem perguntas"
          description="Esse formulário ainda não tem um conjunto de perguntas montado no código."
        />
      ) : respostas.length === 0 ? (
        <EmptyState
          icon={ChartColumn}
          title="Nenhuma resposta ainda"
          description="Assim que os colaboradores enviarem o formulário, os gráficos aparecem aqui."
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <FiltroColaborador
              colaboradores={respondentes.map((c) => ({
                id: c.id,
                nome: c.nome,
                iniciais: c.iniciais,
                email: c.email,
              }))}
              selecionadoId={colaboradorSelecionado?.id}
            />
            {colaboradorSelecionado && respostaSelecionada ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-lg after:rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary text-[13px] text-primary-foreground">
                      {colaboradorSelecionado.iniciais}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 text-[13px] text-muted-foreground">
                    <span className="text-[14px] font-semibold text-foreground">
                      {colaboradorSelecionado.nome}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span className="inline-flex items-center gap-1">
                        <CalendarCheck2 className="size-3.5" />
                        {formatarData(respostaSelecionada.enviadoEm)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="size-3.5" />
                        {respostaSelecionada.tempoGastoMinutos} min
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    render={
                      <a
                        href={urlExportacao(formularioId, colaboradorSelecionado.id, "csv")}
                        download
                      />
                    }
                    nativeButton={false}
                  >
                    <FileText />
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    render={
                      <a
                        href={urlExportacao(formularioId, colaboradorSelecionado.id, "xlsx")}
                        download
                      />
                    }
                    nativeButton={false}
                  >
                    <FileSpreadsheet />
                    Excel
                  </Button>
                </div>
              </div>
            ) : (
              <span className="text-[13px] text-muted-foreground">
                Mostrando o consolidado de todos que responderam.
              </span>
            )}
          </div>

          <nav aria-label="Seções" className="flex flex-wrap gap-2">
            {secoes.map(({ secao }) => (
              <a
                key={secao.id}
                href={`#${secao.id}`}
                className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-[12px] font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                {secao.titulo.replace(/^Seção (\d+)\s*[—-]\s*/i, "$1 · ")}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-6">
            {secoes.map(({ secao, perguntas: itens, media }) => (
              <section
                key={secao.id}
                id={secao.id}
                className="flex scroll-mt-20 flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-6"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="font-heading text-[18px] font-semibold text-foreground">
                      {secao.titulo}
                    </h2>
                    {secao.descricao ? (
                      <p className="max-w-2xl text-[13px] text-muted-foreground">{secao.descricao}</p>
                    ) : null}
                  </div>
                  {media !== undefined ? (
                    <span className="w-fit shrink-0 rounded-full bg-secondary px-3 py-1 text-[13px] font-semibold text-secondary-foreground">
                      {colaboradorSelecionado ? "Nota média" : "Média da seção"} {formatarMedia(media)}
                    </span>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {itens.map((pergunta) => (
                    <CardPergunta
                      key={pergunta.campo.id}
                      pergunta={pergunta}
                      filtrado={!!colaboradorSelecionado}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}
