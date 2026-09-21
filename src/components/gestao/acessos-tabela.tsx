"use client";

import { useMemo, useState } from "react";
import { Lock, Search, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import type { Atribuicao, Colaborador, Formulario, StatusAcesso } from "@/lib/types";

export interface LinhaAcesso {
  atribuicao: Atribuicao;
  colaborador: Colaborador;
  formulario: Formulario;
}

export function AcessosTabela({
  linhasIniciais,
  formularios,
}: {
  linhasIniciais: LinhaAcesso[];
  formularios: Formulario[];
}) {
  const [linhas, setLinhas] = useState(linhasIniciais);
  const [busca, setBusca] = useState("");
  const [formularioFiltro, setFormularioFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState<StatusAcesso | "todos">("todos");
  const [linhaParaBloquear, setLinhaParaBloquear] = useState<LinhaAcesso | null>(null);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return linhas.filter(({ colaborador, formulario, atribuicao }) => {
      const passaBusca =
        termo.length === 0 ||
        colaborador.nome.toLowerCase().includes(termo) ||
        colaborador.email.toLowerCase().includes(termo) ||
        (colaborador.emailPessoal?.toLowerCase().includes(termo) ?? false);
      const passaFormulario = formularioFiltro === "todos" || formulario.id === formularioFiltro;
      const passaStatus = statusFiltro === "todos" || atribuicao.status === statusFiltro;
      return passaBusca && passaFormulario && passaStatus;
    });
  }, [linhas, busca, formularioFiltro, statusFiltro]);

  function alterarStatus(atribuicaoId: string, novoStatus: StatusAcesso) {
    setLinhas((prev) =>
      prev.map((linha) =>
        linha.atribuicao.id === atribuicaoId
          ? { ...linha, atribuicao: { ...linha.atribuicao, status: novoStatus } }
          : linha
      )
    );
    const linha = linhas.find((l) => l.atribuicao.id === atribuicaoId);
    if (linha) {
      toast.success(
        novoStatus === "bloqueado"
          ? `Acesso bloqueado para ${linha.colaborador.nome}`
          : `Acesso liberado para ${linha.colaborador.nome}`,
        { description: linha.formulario.titulo }
      );
    }
  }

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
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={formularioFiltro} onValueChange={(v) => setFormularioFiltro(v ?? "todos")}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Formulário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os formulários</SelectItem>
              {formularios.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFiltro}
            onValueChange={(v) => setStatusFiltro((v ?? "todos") as StatusAcesso | "todos")}
          >
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
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Nenhum acesso encontrado"
          description="Ajuste a busca ou os filtros para ver resultados."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-black/8 bg-white">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="border-black/8 hover:bg-transparent">
                <TableHead className="w-[20%]">Colaborador</TableHead>
                <TableHead className="w-[16%]">Email pessoal</TableHead>
                <TableHead className="w-[15%]">Cargo / Função</TableHead>
                <TableHead className="w-[18%]">Formulário</TableHead>
                <TableHead className="w-[11%]">Status</TableHead>
                <TableHead className="w-[20%] text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.map(({ atribuicao, colaborador, formulario }) => (
                <TableRow key={atribuicao.id} className="border-black/8">
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
                    <span className="block truncate" title={formulario.titulo}>
                      {formulario.titulo}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={atribuicao.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {atribuicao.status === "respondido" ? (
                      <span className="text-[13px] text-graphite">—</span>
                    ) : atribuicao.status === "bloqueado" ? (
                      <Button
                        size="sm"
                        onClick={() => alterarStatus(atribuicao.id, "aguardando")}
                      >
                        <ShieldCheck />
                        Liberar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLinhaParaBloquear({ atribuicao, colaborador, formulario })}
                      >
                        <Lock />
                        Bloquear
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={!!linhaParaBloquear}
        onOpenChange={(open) => {
          if (!open) setLinhaParaBloquear(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear acesso ao formulário?</DialogTitle>
            <DialogDescription>
              {linhaParaBloquear ? (
                <>
                  <span className="font-medium text-ink">{linhaParaBloquear.colaborador.nome}</span>{" "}
                  perderá acesso a{" "}
                  <span className="font-medium text-ink">{linhaParaBloquear.formulario.titulo}</span>{" "}
                  até que o acesso seja liberado novamente.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinhaParaBloquear(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (linhaParaBloquear) {
                  alterarStatus(linhaParaBloquear.atribuicao.id, "bloqueado");
                  setLinhaParaBloquear(null);
                }
              }}
            >
              <Lock />
              Bloquear acesso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
