/**
 * Skeletons das partes que vêm do banco. Regra do sistema: o HTML fixo
 * (menu, títulos, botões, cabeçalhos de tabela) aparece na hora; só os
 * dados ficam em skeleton — e com o mesmo formato do conteúdo final, para a
 * tela não "pular" quando os dados chegam.
 */
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

/** Skeleton em <span>, para dentro de elementos de texto (h1, span, p). */
export function SkeletonInline({ className }: { className?: string }) {
  return (
    <span
      data-slot="skeleton"
      className={cn("inline-block animate-pulse rounded-md bg-foreground/10 align-middle", className)}
    />
  );
}

/** Linha de texto (título, descrição, nome) no lugar de um valor do banco. */
export function TextoSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4 w-40", className)} />;
}

export function StatCardsSkeleton({ quantidade = 4 }: { quantidade?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: quantidade }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <Skeleton className="size-10 rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Card de formulário (gestão e colaborador): categoria, título, descrição, rodapé. */
export function FormularioCardSkeleton() {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <div className="flex -space-x-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="size-7 rounded-full ring-2 ring-card" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
      <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
      <Skeleton className="h-9 w-full rounded-full" />
    </div>
  );
}

export function CardsGridSkeleton({
  quantidade = 3,
  className = "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
}: {
  quantidade?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: quantidade }).map((_, i) => (
        <FormularioCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Bloco de gráfico/painel: o título é fixo (vem por prop), o conteúdo é skeleton. */
export function PainelSkeleton({
  titulo,
  className,
  children,
}: {
  titulo?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-5 rounded-xl border border-border bg-card p-6", className)}>
      {titulo ? (
        <span className="text-[12px] font-medium tracking-[0.3px] text-muted-foreground uppercase">
          {titulo}
        </span>
      ) : null}
      {children ?? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3.5 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Tabela com os títulos reais das colunas; só as linhas são skeleton. */
export function TabelaSkeleton({
  colunas,
  linhas = 6,
  comAvatar = true,
}: {
  colunas: { titulo: string; className?: string }[];
  linhas?: number;
  comAvatar?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {colunas.map((c) => (
              <TableHead key={c.titulo} className={c.className}>
                {c.titulo}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: linhas }).map((_, i) => (
            <TableRow key={i} className="border-border hover:bg-transparent">
              {colunas.map((c, j) => (
                <TableCell key={c.titulo}>
                  {j === 0 && comAvatar ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-8 shrink-0 rounded-lg" />
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ) : (
                    <Skeleton className="h-3.5 w-2/3" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Barra de filtros enquanto os dados chegam: o campo de busca é HTML fixo
 * (aparece de verdade, desativado); só os selects — cujas opções vêm do
 * banco — ficam em skeleton.
 */
export function FiltrosSkeleton({
  busca = "Buscar por nome ou e-mail",
  selects = 1,
}: {
  busca?: string;
  selects?: number;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input disabled placeholder={busca} className="pl-8" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        {Array.from({ length: selects }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-[8px] sm:w-48" />
        ))}
      </div>
    </div>
  );
}

/** Card de pergunta do painel de respostas (título + mini gráfico). */
export function GraficoCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex justify-between gap-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex h-36 items-end gap-2 px-1 pb-6">
        {[40, 70, 100, 55, 30, 15].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-[4px] rounded-b-none" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

/** Fluxo de perguntas (prévia/resposta): seção com alguns campos. */
export function FluxoPerguntasSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-6 w-40 rounded-full" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
      <div className="flex flex-col gap-8 rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-3.5 w-96 max-w-full" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-9 w-full rounded-[8px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Moldura do PageHeader (fundo, brilho, ícone) na hora; só os textos que vêm
 * do banco em skeleton. `title` pode ser fixo (ex.: "Respostas do formulário").
 */
export function PageHeaderSkeleton({
  icon,
  title,
  comAcoes = false,
}: {
  icon?: LucideIcon;
  title?: string;
  comAcoes?: boolean;
}) {
  return (
    <PageHeader
      icon={icon}
      eyebrow={<SkeletonInline className="h-3 w-20" />}
      title={title ?? <SkeletonInline className="h-8 w-80 max-w-full" />}
      description={
        <div className="flex flex-col gap-2 pt-1">
          <Skeleton className="h-3.5 w-[36rem] max-w-full" />
          <Skeleton className="h-3.5 w-80 max-w-full" />
        </div>
      }
      actions={
        comAcoes ? (
          <>
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="h-9 w-36 rounded-full" />
          </>
        ) : undefined
      }
    />
  );
}
