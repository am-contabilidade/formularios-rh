"use client";

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import type { OpcaoContagem, PerguntaAgregada } from "@/lib/respostas/agregar";

/** Rampa ordinal da escala (tokens --escala-* em globals.css). */
const COR_ESCALA: Record<string, string> = {
  "1": "var(--escala-1)",
  "2": "var(--escala-2)",
  "3": "var(--escala-3)",
  "4": "var(--escala-4)",
  "5": "var(--escala-5)",
};

const chartConfig = {
  qtd: { label: "Respostas", color: "var(--primary)" },
} satisfies ChartConfig;

function formatarMedia(valor: number) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

interface PontoGrafico extends OpcaoContagem {
  total: number;
}

function TooltipOpcao({
  active,
  payload,
  escala,
}: {
  active?: boolean;
  payload?: { payload: PontoGrafico }[];
  escala: boolean;
}) {
  const ponto = payload?.[0]?.payload;
  if (!active || !ponto) return null;
  const pct = ponto.total > 0 ? Math.round((ponto.qtd / ponto.total) * 100) : 0;
  return (
    <div className="max-w-64 rounded-lg border border-border bg-popover px-3 py-2 text-[12px] text-popover-foreground shadow-md">
      <p className="font-semibold">
        {escala ? (ponto.rotulo === "N/A" ? "N/A" : `Nota ${ponto.rotulo}`) : ponto.rotulo}
      </p>
      {ponto.descricao ? <p className="text-muted-foreground">{ponto.descricao}</p> : null}
      <p className="mt-1 tabular-nums">
        {ponto.qtd} {ponto.qtd === 1 ? "resposta" : "respostas"} ({pct}%)
      </p>
    </div>
  );
}

/** Colunas 1–5 + N/A com o valor no topo de cada coluna. */
function GraficoEscala({ dados }: { dados: PontoGrafico[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-36 w-full">
      <BarChart accessibilityLayer data={dados} margin={{ top: 20, right: 4, left: 4, bottom: 0 }}>
        <XAxis dataKey="rotulo" tickLine={false} axisLine={false} tickMargin={6} interval={0} />
        <YAxis hide allowDecimals={false} domain={[0, (max: number) => Math.max(1, max)]} />
        <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<TooltipOpcao escala />} />
        <Bar dataKey="qtd" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false}>
          {dados.map((d) => (
            <Cell key={d.opcao} fill={COR_ESCALA[d.rotulo] ?? "var(--escala-na)"} />
          ))}
          <LabelList dataKey="qtd" position="top" offset={6} className="fill-foreground" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

/** Opções nominais: barras horizontais, rótulo à esquerda e valor na ponta. */
function GraficoOpcoes({ dados }: { dados: PontoGrafico[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto w-full" style={{ height: dados.length * 34 + 8 }}>
      <BarChart
        accessibilityLayer
        data={dados}
        layout="vertical"
        margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
      >
        <YAxis
          dataKey="rotulo"
          type="category"
          tickLine={false}
          axisLine={false}
          width={140}
          tick={{ fontSize: 12 }}
          tickFormatter={(v: string) => (v.length > 22 ? `${v.slice(0, 21)}…` : v)}
        />
        <XAxis type="number" hide allowDecimals={false} domain={[0, (max: number) => Math.max(1, max)]} />
        <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<TooltipOpcao escala={false} />} />
        <Bar dataKey="qtd" fill="var(--color-qtd)" radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false}>
          <LabelList dataKey="qtd" position="right" offset={6} className="fill-foreground" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function ListaTextos({
  textos,
  mostrarNome,
}: {
  textos: NonNullable<PerguntaAgregada["textos"]>;
  mostrarNome: boolean;
}) {
  if (textos.length === 0) {
    return <p className="text-[13px] text-muted-foreground">Sem respostas.</p>;
  }
  const item = (t: (typeof textos)[number]) => (
    <li key={t.colaboradorId} className="flex flex-col gap-0.5 rounded-lg bg-muted px-3 py-2">
      {mostrarNome ? <span className="text-[12px] font-medium text-muted-foreground">{t.nome}</span> : null}
      <span className="text-[14px] break-words whitespace-pre-line text-foreground">{t.valor}</span>
    </li>
  );
  const resto = textos.slice(3);

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">{textos.slice(0, 3).map(item)}</ul>
      {resto.length > 0 ? (
        <details className="group">
          <summary className="cursor-pointer text-[13px] font-medium text-primary hover:underline">
            <span className="group-open:hidden">Ver mais {resto.length}</span>
            <span className="hidden group-open:inline">Mostrar menos</span>
          </summary>
          <ul className="mt-2 flex flex-col gap-2">{resto.map(item)}</ul>
        </details>
      ) : null}
    </div>
  );
}

export function CardPergunta({
  pergunta,
  filtrado,
}: {
  pergunta: PerguntaAgregada;
  /** Com um colaborador filtrado: oculta nomes nos textos e a média vira "Nota". */
  filtrado: boolean;
}) {
  const { campo, distribuicao, media, textos, respondentes } = pergunta;
  const dados = distribuicao?.map((o) => ({ ...o, total: respondentes }));

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-[14px] leading-snug font-medium break-words text-foreground">
          {campo.label}
        </p>
        {media !== undefined ? (
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-[12px] font-semibold text-secondary-foreground">
            {filtrado ? "Nota" : "Média"} {formatarMedia(media)}
          </span>
        ) : null}
      </div>

      {dados ? (
        campo.tipo === "escala" ? (
          <GraficoEscala dados={dados} />
        ) : (
          <GraficoOpcoes dados={dados} />
        )
      ) : (
        <ListaTextos textos={textos ?? []} mostrarNome={!filtrado} />
      )}
    </div>
  );
}
