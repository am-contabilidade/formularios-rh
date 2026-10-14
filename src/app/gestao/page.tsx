import { Suspense } from "react";
import Link from "next/link";
import { ClipboardList, Clock3, FileCheck2, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { iconesNavegacao } from "@/components/icones-navegacao";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { GestaoFormularioCard } from "@/components/gestao/formulario-card";
import { DonutProgress } from "@/components/charts/donut-progress";
import { StatusBarChart } from "@/components/charts/status-bar-chart";
import { getAtribuicoes, getResumoGestao, getResumosFormularios } from "@/lib/data";
import { variacaoMock } from "@/lib/labels";
import { CardsGridSkeleton, PainelSkeleton, StatCardsSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function GestaoDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="AM Automação"
        title="Painel de gestão"
        icon={iconesNavegacao.painel}
        description="Acompanhe a adesão aos formulários de RH em toda a empresa."
        actions={
          <Button render={<Link href="/gestao/acessos" />} nativeButton={false}>
            Gerenciar acessos
          </Button>
        }
      />

      <Suspense fallback={<StatCardsSkeleton />}>
        <Indicadores />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
            <PainelSkeleton titulo="Adesão geral">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="size-32 rounded-full" />
                <Skeleton className="h-3.5 w-48" />
              </div>
            </PainelSkeleton>
            <PainelSkeleton titulo="Adesão por formulário" />
          </div>
        }
      >
        <GraficosAdesao />
      </Suspense>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-[20px] font-semibold text-foreground">Formulários</h2>
          <Link
            href="/gestao/formularios"
            className="text-[14px] font-medium text-muted-foreground hover:text-foreground"
          >
            Ver todos
          </Link>
        </div>
        <Suspense fallback={<CardsGridSkeleton />}>
          <ListaFormularios />
        </Suspense>
      </div>
    </div>
  );
}

async function Indicadores() {
  const resumo = await getResumoGestao();
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Colaboradores"
        value={resumo.totalColaboradores}
        icon={Users}
        trend={variacaoMock.totalColaboradores}
      />
      <StatCard
        label="Formulários ativos"
        value={resumo.totalFormularios}
        icon={ClipboardList}
        hint="Nenhum novo este mês"
      />
      <StatCard
        label="Respostas recebidas"
        value={resumo.totalRespostas}
        icon={FileCheck2}
        accent
        trend={variacaoMock.totalRespostas}
      />
      <StatCard
        label="Respostas pendentes"
        value={resumo.totalPendentes}
        icon={Clock3}
        trend={variacaoMock.totalPendentes}
      />
    </div>
  );
}

async function GraficosAdesao() {
  const [resumo, resumosFormularios, atribuicoes] = await Promise.all([
    getResumoGestao(),
    getResumosFormularios(),
    getAtribuicoes(),
  ]);
  const totalAtribuicoes = atribuicoes.length;
  const percentualGeral = totalAtribuicoes > 0 ? (resumo.totalRespostas / totalAtribuicoes) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="justify-center rounded-xl border-border bg-card py-0 shadow-elevated">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <span className="text-[12px] font-medium tracking-[0.3px] text-muted-foreground uppercase">
            Adesão geral
          </span>
          <DonutProgress
            value={percentualGeral}
            size={128}
            strokeWidth={10}
            label="concluído"
            showBadge
          />
          <p className="text-[13px] text-muted-foreground">
            {resumo.totalRespostas} de {totalAtribuicoes} formulários atribuídos já respondidos
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border bg-card py-0 shadow-elevated">
        <CardContent className="flex flex-col gap-5 p-6">
          <span className="text-[12px] font-medium tracking-[0.3px] text-muted-foreground uppercase">
            Adesão por formulário
          </span>
          <StatusBarChart resumos={resumosFormularios} />
        </CardContent>
      </Card>
    </div>
  );
}

async function ListaFormularios() {
  const resumosFormularios = await getResumosFormularios();
  return (
    <>
    {resumosFormularios.length === 0 ? (
      <EmptyState
        icon={ClipboardList}
        title="Nenhum formulário cadastrado"
        description="Assim que os formulários forem criados, eles aparecem aqui."
      />
    ) : (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resumosFormularios.map((resumo) => (
          <GestaoFormularioCard key={resumo.formulario.id} resumo={resumo} />
        ))}
      </div>
    )}
    </>
  );
}
