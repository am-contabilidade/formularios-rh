"use client";

import { useMemo, useState } from "react";
import { Search, UsersRound } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import type { Colaborador } from "@/lib/types";

export interface LinhaColaboradorResumo {
  colaborador: Colaborador;
  totalAtribuidos: number;
  totalRespondidos: number;
  totalPendentes: number;
  totalBloqueados: number;
}

export function ColaboradoresLista({ linhas }: { linhas: LinhaColaboradorResumo[] }) {
  const [busca, setBusca] = useState("");
  const [departamento, setDepartamento] = useState("todos");

  const departamentos = useMemo(
    () => Array.from(new Set(linhas.map((l) => l.colaborador.departamento))).sort(),
    [linhas]
  );

  const filtradas = linhas.filter(({ colaborador }) => {
    const termo = busca.trim().toLowerCase();
    const passaBusca =
      termo.length === 0 ||
      colaborador.nome.toLowerCase().includes(termo) ||
      colaborador.email.toLowerCase().includes(termo) ||
      (colaborador.emailPessoal?.toLowerCase().includes(termo) ?? false);
    const passaDepartamento =
      departamento === "todos" || colaborador.departamento === departamento;
    return passaBusca && passaDepartamento;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-graphite" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail"
            className="pl-8"
          />
        </div>
        <Select value={departamento} onValueChange={(v) => setDepartamento(v ?? "todos")}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os departamentos</SelectItem>
            {departamentos.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Nenhum colaborador encontrado"
          description="Ajuste a busca ou o filtro de departamento para ver resultados."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-black/8 bg-white">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="border-black/8 hover:bg-transparent">
                <TableHead className="w-[24%]">Colaborador</TableHead>
                <TableHead className="w-[18%]">Email pessoal</TableHead>
                <TableHead className="w-[15%]">Cargo</TableHead>
                <TableHead className="w-[13%]">Departamento</TableHead>
                <TableHead className="w-[30%]">Formulários</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.map(({ colaborador, totalAtribuidos, totalRespondidos, totalPendentes, totalBloqueados }) => (
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
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate" title={colaborador.cargo}>
                        {colaborador.cargo}
                      </span>
                      <span
                        className="truncate text-[13px] text-graphite"
                        title={colaborador.funcao}
                      >
                        {colaborador.funcao}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[14px] text-graphite">
                    <span className="block truncate" title={colaborador.departamento}>
                      {colaborador.departamento}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="border-blue/30 bg-blue/8 text-blue">
                        {totalRespondidos} respondido{totalRespondidos === 1 ? "" : "s"}
                      </Badge>
                      {totalPendentes > 0 ? (
                        <Badge variant="outline" className="border-coral/25 bg-coral/10 text-coral">
                          {totalPendentes} pendente{totalPendentes === 1 ? "" : "s"}
                        </Badge>
                      ) : null}
                      {totalBloqueados > 0 ? (
                        <Badge variant="outline" className="border-black/8 text-stone">
                          {totalBloqueados} bloqueado{totalBloqueados === 1 ? "" : "s"}
                        </Badge>
                      ) : null}
                      {totalAtribuidos === 0 ? (
                        <span className="text-[13px] text-graphite">Nenhum atribuído</span>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
