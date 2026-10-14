"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const TAMANHO_PAGINA_PADRAO = 10;

/**
 * Paginação client-side das tabelas. `chaveFiltros` deve mudar sempre que a
 * busca/filtros mudarem — a página volta para a primeira nesse caso.
 */
export function usePaginacao<T>(
  itens: T[],
  chaveFiltros: string,
  tamanhoPagina = TAMANHO_PAGINA_PADRAO
) {
  const [pagina, setPagina] = useState(1);
  const [chaveAnterior, setChaveAnterior] = useState(chaveFiltros);
  if (chaveFiltros !== chaveAnterior) {
    setChaveAnterior(chaveFiltros);
    setPagina(1);
  }

  const totalPaginas = Math.max(1, Math.ceil(itens.length / tamanhoPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * tamanhoPagina;

  return {
    itensPagina: itens.slice(inicio, inicio + tamanhoPagina),
    paginaAtual,
    totalPaginas,
    totalItens: itens.length,
    inicio,
    fim: Math.min(inicio + tamanhoPagina, itens.length),
    setPagina,
  };
}

/** Faixa de páginas com reticências: 1 … 4 5 6 … 12 */
function faixaPaginas(atual: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas = new Set([1, total, atual - 1, atual, atual + 1]);
  const ordenadas = [...paginas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const resultado: (number | "…")[] = [];
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push("…");
    resultado.push(p);
  });
  return resultado;
}

export function PaginacaoTabela({
  paginaAtual,
  totalPaginas,
  totalItens,
  inicio,
  fim,
  setPagina,
  rotuloItens,
}: Omit<ReturnType<typeof usePaginacao>, "itensPagina"> & {
  /** Plural do que está sendo listado, ex.: "colaboradores". */
  rotuloItens: string;
}) {
  if (totalItens === 0) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[13px] text-muted-foreground">
        {totalPaginas === 1
          ? `${totalItens} ${rotuloItens}`
          : `Mostrando ${inicio + 1}–${fim} de ${totalItens} ${rotuloItens}`}
      </span>
      {totalPaginas > 1 ? (
        <nav aria-label="Paginação" className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={paginaAtual === 1}
                  onClick={() => setPagina(Math.max(1, paginaAtual - 1))}
                  aria-label="Página anterior"
                >
                  <ChevronLeft />
                </Button>
              }
            />
            <TooltipContent>Página anterior</TooltipContent>
          </Tooltip>
          {faixaPaginas(paginaAtual, totalPaginas).map((p, i) =>
            p === "…" ? (
              <span key={`gap-${i}`} className="px-1 text-[13px] text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === paginaAtual ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => setPagina(p)}
                aria-current={p === paginaAtual ? "page" : undefined}
                className="text-[13px] tabular-nums"
              >
                {p}
              </Button>
            )
          )}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={paginaAtual === totalPaginas}
                  onClick={() => setPagina(Math.min(totalPaginas, paginaAtual + 1))}
                  aria-label="Próxima página"
                >
                  <ChevronRight />
                </Button>
              }
            />
            <TooltipContent>Próxima página</TooltipContent>
          </Tooltip>
        </nav>
      ) : null}
    </div>
  );
}
