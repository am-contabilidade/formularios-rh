"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, UsersRound } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import type { Atribuicao, Colaborador, StatusAcesso } from "@/lib/types";

const PAGE_SIZE = 5;

export interface LinhaColaborador {
  colaborador: Colaborador;
  atribuicao: Atribuicao;
}

export function ColaboradoresTabela({
  linhas,
  formularioId,
}: {
  linhas: LinhaColaborador[];
  formularioId: string;
}) {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<StatusAcesso | "todos">("todos");
  const [pagina, setPagina] = useState(1);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return linhas.filter(({ colaborador, atribuicao }) => {
      const passaStatus = status === "todos" || atribuicao.status === status;
      const passaBusca =
        termo.length === 0 ||
        colaborador.nome.toLowerCase().includes(termo) ||
        colaborador.email.toLowerCase().includes(termo) ||
        (colaborador.emailPessoal?.toLowerCase().includes(termo) ?? false);
      return passaStatus && passaBusca;
    });
  }, [linhas, busca, status]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const paginadas = filtradas.slice(
    (paginaAtual - 1) * PAGE_SIZE,
    paginaAtual * PAGE_SIZE
  );

  function atualizarBusca(valor: string) {
    setBusca(valor);
    setPagina(1);
  }

  function atualizarStatus(valor: StatusAcesso | "todos") {
    setStatus(valor);
    setPagina(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-graphite" />
          <Input
            value={busca}
            onChange={(e) => atualizarBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail"
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={(v) => atualizarStatus((v ?? "todos") as StatusAcesso | "todos")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="aguardando">Aguardando</SelectItem>
            <SelectItem value="em_andamento">Em andamento</SelectItem>
            <SelectItem value="respondido">Respondido</SelectItem>
            <SelectItem value="bloqueado">Bloqueado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Nenhum colaborador encontrado"
          description="Ajuste a busca ou o filtro de status para ver resultados."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-black/8 bg-white">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="border-black/8 hover:bg-transparent">
                <TableHead className="w-[24%]">Colaborador</TableHead>
                <TableHead className="w-[18%]">Email pessoal</TableHead>
                <TableHead className="w-[15%]">Cargo</TableHead>
                <TableHead className="w-[15%]">Função</TableHead>
                <TableHead className="w-[12%]">Status</TableHead>
                <TableHead className="w-[16%] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginadas.map(({ colaborador, atribuicao }) => (
                <TableRow key={colaborador.id} className="border-black/8">
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-8 shrink-0 rounded-lg after:rounded-lg">
                        <AvatarFallback className="rounded-lg bg-blue text-[12px] text-white">
                          {colaborador.iniciais}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span
                          className="truncate text-[14px] font-medium text-ink"
                          title={colaborador.nome}
                        >
                          {colaborador.nome}
                        </span>
                        <span
                          className="truncate text-[13px] text-graphite"
                          title={colaborador.email}
                        >
                          {colaborador.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[13px] text-graphite">
                    <span className="block truncate" title={colaborador.emailPessoal}>
                      {colaborador.emailPessoal ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-[14px] text-graphite">
                    <span className="block truncate" title={colaborador.cargo}>
                      {colaborador.cargo}
                    </span>
                  </TableCell>
                  <TableCell className="text-[14px] text-graphite">
                    <span className="block truncate" title={colaborador.funcao}>
                      {colaborador.funcao}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={atribuicao.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {atribuicao.status === "respondido" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        render={
                          <Link
                            href={`/gestao/formularios/${formularioId}/respostas/${colaborador.id}`}
                          />
                        }
                        nativeButton={false}
                      >
                        Ver respostas
                      </Button>
                    ) : (
                      <span className="text-[13px] text-graphite">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {filtradas.length > 0 && totalPaginas > 1 ? (
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-graphite">
            Página {paginaAtual} de {totalPaginas} &middot; {filtradas.length} colaboradores
          </span>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={paginaAtual === 1}
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft />
                  </Button>
                }
              />
              <TooltipContent>Página anterior</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={paginaAtual === totalPaginas}
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  >
                    <ChevronRight />
                  </Button>
                }
              />
              <TooltipContent>Próxima página</TooltipContent>
            </Tooltip>
          </div>
        </div>
      ) : null}
    </div>
  );
}
