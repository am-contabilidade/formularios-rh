"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Search, UsersRound } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { COLUNAS_COLABORADORES_FORMULARIO } from "@/components/gestao/colunas";
import { PaginacaoTabela, usePaginacao } from "@/components/paginacao-tabela";
import type { Atribuicao, Colaborador, StatusAcesso } from "@/lib/types";

const PAGE_SIZE = 5;

export interface LinhaColaborador {
  colaborador: Colaborador;
  atribuicao: Atribuicao;
}

export function ColaboradoresTabela({
  linhas,
  formularioId,
  headerAction,
}: {
  linhas: LinhaColaborador[];
  formularioId: string;
  headerAction?: ReactNode;
}) {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<StatusAcesso | "todos">("todos");

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

  const paginacao = usePaginacao(filtradas, `${busca}|${status}`, PAGE_SIZE);

  return (
    <Card className="rounded-xl border-border bg-card py-0 shadow-elevated">
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[16px] font-semibold text-foreground">Colaboradores</span>
          <div className="shrink-0">{headerAction}</div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou e-mail"
              className="pl-8"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus((v ?? "todos") as StatusAcesso | "todos")}>
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
          <div className="overflow-hidden rounded-xl border border-border">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {COLUNAS_COLABORADORES_FORMULARIO.map((c) => (
                    <TableHead key={c.titulo} className={c.className}>
                      {c.titulo}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginacao.itensPagina.map(({ colaborador, atribuicao }) => (
                  <TableRow key={colaborador.id} className="border-border">
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-8 shrink-0 rounded-lg after:rounded-lg">
                          <AvatarFallback className="rounded-lg bg-primary text-[12px] text-primary-foreground">
                            {colaborador.iniciais}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <span
                            className="truncate text-[14px] font-medium text-foreground"
                            title={colaborador.nome}
                          >
                            {colaborador.nome}
                          </span>
                          <span
                            className="truncate text-[13px] text-muted-foreground"
                            title={colaborador.email}
                          >
                            {colaborador.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      <span className="block truncate" title={colaborador.emailPessoal}>
                        {colaborador.emailPessoal ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-[14px] text-muted-foreground">
                      <span className="block truncate" title={colaborador.cargo}>
                        {colaborador.cargo}
                      </span>
                    </TableCell>
                    <TableCell className="text-[14px] text-muted-foreground">
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
                              href={`/gestao/formularios/${formularioId}/respostas?colaborador=${colaborador.id}`}
                            />
                          }
                          nativeButton={false}
                        >
                          Ver respostas
                        </Button>
                      ) : (
                        <span className="text-[13px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filtradas.length > 0 ? (
          <div className="border-t border-border pt-4">
            <PaginacaoTabela {...paginacao} rotuloItens="colaboradores" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
