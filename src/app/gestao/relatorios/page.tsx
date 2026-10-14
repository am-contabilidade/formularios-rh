import { Suspense } from "react";
import { FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { iconesNavegacao } from "@/components/icones-navegacao";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportarRelatorio, type OpcaoRelatorio } from "@/components/gestao/exportar-relatorio";
import { getColaboradoresByIds, getFormularios, getRespondentes } from "@/lib/data";

export default function GestaoRelatoriosPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="AM Automação"
        title="Relatórios"
        icon={iconesNavegacao.relatorios}
        description="Exporte as respostas de um colaborador em um formulário para Excel ou CSV."
      />

      <section className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileSpreadsheet className="size-[18px]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="font-heading text-[18px] font-semibold text-foreground">
              Relatório individual
            </h2>
            <p className="max-w-2xl text-[14px] text-muted-foreground">
              Dados do colaborador e todas as respostas do formulário, por seção. O Excel traz
              também uma aba com a média das notas de cada seção.
            </p>
          </div>
        </div>
        <Suspense fallback={<SeletoresSkeleton />}>
          <Seletores />
        </Suspense>
      </section>
    </div>
  );
}

function SeletoresSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {["Formulário", "Colaborador"].map((rotulo) => (
          <div key={rotulo} className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">{rotulo}</span>
            <Skeleton className="h-9 w-full rounded-[8px]" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-3.5 w-72" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-full" />
          <Skeleton className="h-9 w-36 rounded-full" />
        </div>
      </div>
    </div>
  );
}

async function Seletores() {
  const [formularios, respondentes] = await Promise.all([getFormularios(), getRespondentes()]);
  const colaboradores = await getColaboradoresByIds([
    ...new Set(respondentes.map((r) => r.colaboradorId)),
  ]);
  const porId = new Map(colaboradores.map((c) => [c.id, c]));

  const opcoes: OpcaoRelatorio[] = formularios
    .map((f) => ({
      formularioId: f.id,
      titulo: f.titulo,
      respondentes: respondentes
        .filter((r) => r.formularioId === f.id && porId.has(r.colaboradorId))
        .map((r) => {
          const c = porId.get(r.colaboradorId)!;
          return {
            colaboradorId: c.id,
            nome: c.nome,
            email: c.email,
            iniciais: c.iniciais,
            enviadoEm: r.enviadoEm,
          };
        })
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    }))
    .filter((o) => o.respondentes.length > 0);

  if (opcoes.length === 0) {
    return (
      <EmptyState
        icon={FileSpreadsheet}
        title="Nenhuma resposta enviada ainda"
        description="Assim que um colaborador enviar um formulário, o relatório dele fica disponível aqui."
      />
    );
  }

  return <ExportarRelatorio opcoes={opcoes} />;
}
