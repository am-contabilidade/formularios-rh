import Link from "next/link";
import { ClipboardList, Clock3, FileCheck2, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { GestaoFormularioCard } from "@/components/gestao/formulario-card";
import { DonutProgress } from "@/components/charts/donut-progress";
import { StatusBarChart } from "@/components/charts/status-bar-chart";
import { getAtribuicoes, getResumoGestao, getResumosFormularios } from "@/lib/data";
import { variacaoMock } from "@/lib/labels";

export default async function GestaoDashboardPage() {
  const [resumo, resumosFormularios, atribuicoes] = await Promise.all([
    getResumoGestao(),
    getResumosFormularios(),
    getAtribuicoes(),
  ]);

  const totalAtribuicoes = atribuicoes.length;
  const percentualGeral = totalAtribuicoes > 0 ? (resumo.totalRespostas / totalAtribuicoes) * 100 : 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="AM Automação"
        title="Painel de gestão"
        description="Acompanhe a adesão aos formulários de RH em toda a empresa."
        actions={
          <Button render={<Link href="/gestao/acessos" />} nativeButton={false}>
            Gerenciar acessos
          </Button>
        }
      />

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="justify-center rounded-2xl border-black/6 bg-white py-0 shadow-elevated">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <span className="text-[12px] font-medium tracking-[0.3px] text-graphite uppercase">
              Adesão geral
            </span>
            <DonutProgress
              value={percentualGeral}
              size={128}
              strokeWidth={10}
              label="concluído"
              showBadge
            />
            <p className="text-[13px] text-graphite">
              {resumo.totalRespostas} de {totalAtribuicoes} formulários atribuídos já respondidos
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/6 bg-white py-0 shadow-elevated">
          <CardContent className="flex flex-col gap-5 p-6">
            <span className="text-[12px] font-medium tracking-[0.3px] text-graphite uppercase">
              Adesão por formulário
            </span>
            <StatusBarChart resumos={resumosFormularios} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-ink">Formulários</h2>
          <Link
            href="/gestao/formularios"
            className="text-[14px] font-medium text-graphite hover:text-ink"
          >
            Ver todos
          </Link>
        </div>
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
      </div>
    </div>
  );
}
