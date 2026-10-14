"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ChartColumn, Lock, Plus, Search, Settings2, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { SearchSelect } from "@/components/search-select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { PaginacaoTabela, usePaginacao } from "@/components/paginacao-tabela";
import { COLUNAS_COLABORADORES } from "@/components/gestao/colunas";
import { alterarAcesso, vincularColaboradores } from "@/lib/actions/atribuicoes";
import { coresResumo } from "@/lib/cores-status";
import type { Atribuicao, Colaborador } from "@/lib/types";

export interface VinculoFormulario {
  atribuicao: Atribuicao;
  formularioTitulo: string;
}

export interface LinhaColaboradorGestao {
  colaborador: Colaborador;
  vinculos: VinculoFormulario[];
}

type Situacao = "todos" | "pendentes" | "bloqueados" | "respondidos" | "sem_formulario";

const ROTULOS_SITUACAO: Record<Situacao, string> = {
  todos: "Todas as situações",
  pendentes: "Com pendências",
  bloqueados: "Com bloqueio",
  respondidos: "Já responderam",
  sem_formulario: "Sem formulário",
};

function contar(vinculos: VinculoFormulario[]) {
  return {
    respondidos: vinculos.filter((v) => v.atribuicao.status === "respondido").length,
    pendentes: vinculos.filter(
      (v) => v.atribuicao.status === "aguardando" || v.atribuicao.status === "em_andamento"
    ).length,
    bloqueados: vinculos.filter((v) => v.atribuicao.status === "bloqueado").length,
  };
}

function ResumoVinculos({ vinculos }: { vinculos: VinculoFormulario[] }) {
  if (vinculos.length === 0) {
    return <span className="text-[13px] text-muted-foreground">Nenhum formulário</span>;
  }
  const { respondidos, pendentes, bloqueados } = contar(vinculos);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {respondidos > 0 ? (
        <Badge variant="outline" className={coresResumo.respondidos.badge}>
          {respondidos} respondido{respondidos === 1 ? "" : "s"}
        </Badge>
      ) : null}
      {pendentes > 0 ? (
        <Badge variant="outline" className={coresResumo.pendentes.badge}>
          {pendentes} pendente{pendentes === 1 ? "" : "s"}
        </Badge>
      ) : null}
      {bloqueados > 0 ? (
        <Badge variant="outline" className={coresResumo.bloqueados.badge}>
          {bloqueados} bloqueado{bloqueados === 1 ? "" : "s"}
        </Badge>
      ) : null}
    </div>
  );
}

/**
 * Colaboradores + acessos numa tela só: a tabela lista as pessoas e o painel
 * "Gerenciar" concentra tudo o que dá para fazer com os formulários de cada
 * uma (liberar, bloquear, ver respostas, vincular a outro formulário).
 */
export function ColaboradoresGestao({
  linhas,
  formularios,
}: {
  linhas: LinhaColaboradorGestao[];
  formularios: { id: string; titulo: string }[];
}) {
  const [busca, setBusca] = useState("");
  const [departamento, setDepartamento] = useState("todos");
  const [formularioFiltro, setFormularioFiltro] = useState("todos");
  const [situacao, setSituacao] = useState<Situacao>("todos");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);

  const departamentos = useMemo(
    () =>
      Array.from(new Set(linhas.map((l) => l.colaborador.departamento).filter(Boolean))).sort(),
    [linhas]
  );

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return linhas.filter(({ colaborador, vinculos }) => {
      const passaBusca =
        termo.length === 0 ||
        colaborador.nome.toLowerCase().includes(termo) ||
        colaborador.email.toLowerCase().includes(termo) ||
        (colaborador.emailPessoal?.toLowerCase().includes(termo) ?? false);
      const passaDepartamento = departamento === "todos" || colaborador.departamento === departamento;
      const doFormulario =
        formularioFiltro === "todos"
          ? vinculos
          : vinculos.filter((v) => v.atribuicao.formularioId === formularioFiltro);
      const passaFormulario = formularioFiltro === "todos" || doFormulario.length > 0;
      const c = contar(doFormulario);
      const passaSituacao =
        situacao === "todos" ||
        (situacao === "pendentes" && c.pendentes > 0) ||
        (situacao === "bloqueados" && c.bloqueados > 0) ||
        (situacao === "respondidos" && c.respondidos > 0) ||
        (situacao === "sem_formulario" && vinculos.length === 0);
      return passaBusca && passaDepartamento && passaFormulario && passaSituacao;
    });
  }, [linhas, busca, departamento, formularioFiltro, situacao]);

  const paginacao = usePaginacao(
    filtradas,
    `${busca}|${departamento}|${formularioFiltro}|${situacao}`
  );
  const selecionado = linhas.find((l) => l.colaborador.id === selecionadoId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail"
            className="pl-8"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchSelect
            aria-label="Departamento"
            value={departamento}
            onValueChange={setDepartamento}
            options={[
              { value: "todos", label: "Todos os departamentos" },
              ...departamentos.map((d) => ({ value: d, label: d })),
            ]}
            searchPlaceholder="Buscar departamento..."
            className="w-full sm:w-56"
          />
          <SearchSelect
            aria-label="Formulário"
            value={formularioFiltro}
            onValueChange={setFormularioFiltro}
            options={[
              { value: "todos", label: "Todos os formulários" },
              ...formularios.map((f) => ({ value: f.id, label: f.titulo })),
            ]}
            searchPlaceholder="Buscar formulário..."
            className="w-full sm:w-56"
          />
          <SearchSelect
            aria-label="Situação"
            value={situacao}
            onValueChange={(v) => setSituacao(v as Situacao)}
            options={(Object.keys(ROTULOS_SITUACAO) as Situacao[]).map((s) => ({
              value: s,
              label: ROTULOS_SITUACAO[s],
            }))}
            searchPlaceholder="Buscar situação..."
            className="w-full sm:w-44"
          />
        </div>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Nenhum colaborador encontrado"
          description="Ajuste a busca ou os filtros para ver resultados."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {COLUNAS_COLABORADORES.map((c) => (
                  <TableHead key={c.titulo} className={c.className}>
                    {c.titulo}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginacao.itensPagina.map(({ colaborador, vinculos }) => (
                <TableRow
                  key={colaborador.id}
                  className="cursor-pointer border-border"
                  onClick={() => setSelecionadoId(colaborador.id)}
                >
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-8 shrink-0 rounded-lg after:rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary text-[12px] text-primary-foreground">
                          {colaborador.iniciais}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-[14px] font-medium text-foreground" title={colaborador.nome}>
                          {colaborador.nome}
                        </span>
                        <span className="truncate text-[13px] text-muted-foreground" title={colaborador.email}>
                          {colaborador.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-0 flex-col text-[14px] text-muted-foreground">
                      <span className="truncate" title={colaborador.cargo}>
                        {colaborador.cargo || "—"}
                      </span>
                      <span className="truncate text-[13px]" title={colaborador.departamento}>
                        {colaborador.departamento || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ResumoVinculos vinculos={vinculos} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelecionadoId(colaborador.id);
                      }}
                    >
                      <Settings2 />
                      Gerenciar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginacaoTabela {...paginacao} rotuloItens="colaboradores" />

      <Sheet open={!!selecionado} onOpenChange={(open) => !open && setSelecionadoId(null)}>
        <SheetContent className="w-full gap-0 sm:max-w-md">
          {selecionado ? <PainelColaborador linha={selecionado} formularios={formularios} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PainelColaborador({
  linha,
  formularios,
}: {
  linha: LinhaColaboradorGestao;
  formularios: { id: string; titulo: string }[];
}) {
  const { colaborador, vinculos } = linha;
  const [pendente, startTransition] = useTransition();
  const [emAcao, setEmAcao] = useState<string | null>(null);
  const [confirmarBloqueio, setConfirmarBloqueio] = useState<string | null>(null);
  const [novoFormulario, setNovoFormulario] = useState("");

  const disponiveis = formularios.filter(
    (f) => !vinculos.some((v) => v.atribuicao.formularioId === f.id)
  );

  function executar(atribuicaoId: string, acao: "bloquear" | "liberar", titulo: string) {
    setEmAcao(atribuicaoId);
    setConfirmarBloqueio(null);
    startTransition(async () => {
      try {
        const r = await alterarAcesso(atribuicaoId, acao);
        if (r.ok) {
          toast.success(acao === "bloquear" ? "Acesso bloqueado" : "Acesso liberado", {
            description: `${colaborador.nome} · ${titulo}`,
          });
        } else {
          toast.error(r.erro);
        }
      } catch {
        toast.error("Não foi possível alterar o acesso. Tente novamente.");
      } finally {
        setEmAcao(null);
      }
    });
  }

  function vincular() {
    const formulario = formularios.find((f) => f.id === novoFormulario);
    if (!formulario) return;
    startTransition(async () => {
      try {
        await vincularColaboradores(formulario.id, [colaborador.id]);
        toast.success("Formulário vinculado", { description: `${colaborador.nome} · ${formulario.titulo}` });
        setNovoFormulario("");
      } catch {
        toast.error("Não foi possível vincular. Tente novamente.");
      }
    });
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <SheetHeader className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 rounded-xl after:rounded-xl">
            <AvatarFallback className="rounded-xl bg-primary text-[15px] text-primary-foreground">
              {colaborador.iniciais}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <SheetTitle className="font-heading text-[18px] font-bold">{colaborador.nome}</SheetTitle>
            <SheetDescription className="truncate">
              {[colaborador.cargo, colaborador.departamento].filter(Boolean).join(" · ") || "Sem cargo cadastrado"}
            </SheetDescription>
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
          <dt className="text-muted-foreground">E-mail</dt>
          <dd className="truncate text-foreground">{colaborador.email}</dd>
          <dt className="text-muted-foreground">Pessoal</dt>
          <dd className="truncate text-foreground">{colaborador.emailPessoal ?? "—"}</dd>
        </dl>
      </SheetHeader>

      <div className="flex flex-col gap-3 p-6">
        <h3 className="text-[12px] font-medium tracking-[0.3px] text-muted-foreground uppercase">
          Formulários ({vinculos.length})
        </h3>

        {vinculos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground">
            Este colaborador ainda não está em nenhum formulário.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {vinculos.map(({ atribuicao, formularioTitulo }) => (
              <li key={atribuicao.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[14px] leading-snug font-medium text-foreground">
                    {formularioTitulo}
                  </span>
                  <StatusBadge status={atribuicao.status} />
                </div>

                {confirmarBloqueio === atribuicao.id ? (
                  <div className="flex flex-col gap-2 rounded-lg bg-muted p-3">
                    <p className="text-[13px] text-foreground">
                      Bloquear o acesso? O colaborador não conseguirá abrir este formulário até ser
                      liberado de novo.
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setConfirmarBloqueio(null)}>
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => executar(atribuicao.id, "bloquear", formularioTitulo)}
                      >
                        <Lock />
                        Bloquear
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-end gap-2">
                    {atribuicao.status === "respondido" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        render={
                          <Link
                            href={`/gestao/formularios/${atribuicao.formularioId}/respostas?colaborador=${colaborador.id}`}
                          />
                        }
                        nativeButton={false}
                      >
                        <ChartColumn />
                        Ver respostas
                      </Button>
                    ) : atribuicao.status === "bloqueado" ? (
                      <Button
                        size="sm"
                        disabled={pendente && emAcao === atribuicao.id}
                        onClick={() => executar(atribuicao.id, "liberar", formularioTitulo)}
                      >
                        <ShieldCheck />
                        Liberar acesso
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pendente && emAcao === atribuicao.id}
                        onClick={() => setConfirmarBloqueio(atribuicao.id)}
                      >
                        <Lock />
                        Bloquear acesso
                      </Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {disponiveis.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-5">
            <h3 className="text-[12px] font-medium tracking-[0.3px] text-muted-foreground uppercase">
              Adicionar a um formulário
            </h3>
            <div className="flex gap-2">
              <SearchSelect
                aria-label="Formulário para vincular"
                value={novoFormulario}
                onValueChange={setNovoFormulario}
                options={disponiveis.map((f) => ({ value: f.id, label: f.titulo }))}
                placeholder="Escolha o formulário"
                searchPlaceholder="Buscar formulário..."
                className="min-w-0 flex-1"
              />
              <Button disabled={!novoFormulario || pendente} onClick={vincular}>
                <Plus />
                Vincular
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
