"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { vincularColaboradores } from "@/lib/actions/atribuicoes";
import type { Colaborador } from "@/lib/types";

export function VincularColaboradorDialog({
  formularioId,
  colaboradoresDisponiveis,
}: {
  formularioId: string;
  colaboradoresDisponiveis: Colaborador[];
}) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return colaboradoresDisponiveis;
    return colaboradoresDisponiveis.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        c.email.toLowerCase().includes(termo) ||
        (c.emailPessoal?.toLowerCase().includes(termo) ?? false)
    );
  }, [colaboradoresDisponiveis, busca]);

  function alternar(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function limparEFechar() {
    setOpen(false);
    setBusca("");
    setSelecionados(new Set());
  }

  function vincular() {
    const ids = [...selecionados];
    startTransition(async () => {
      await vincularColaboradores(formularioId, ids);
      toast.success(
        ids.length === 1 ? "Colaborador vinculado" : `${ids.length} colaboradores vinculados`
      );
      limparEFechar();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : limparEFechar())}>
      <Button onClick={() => setOpen(true)}>
        <UserPlus />
        Vincular colaborador
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular colaboradores</DialogTitle>
          <DialogDescription>
            Selecione quem deve responder este formulário. O status inicial será &quot;Aguardando&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail"
            className="pl-8"
          />
        </div>

        <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {filtrados.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="Nenhum colaborador disponível"
              description="Todos os colaboradores já estão vinculados, ou nenhum corresponde à busca."
            />
          ) : (
            filtrados.map((colaborador) => (
              <label
                key={colaborador.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted"
              >
                <Checkbox
                  checked={selecionados.has(colaborador.id)}
                  onCheckedChange={() => alternar(colaborador.id)}
                />
                <Avatar className="size-8 shrink-0 rounded-lg after:rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-[12px] text-primary-foreground">
                    {colaborador.iniciais}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-[14px] font-medium text-foreground">
                    {colaborador.nome}
                  </span>
                  <span className="truncate text-[13px] text-muted-foreground">
                    {colaborador.emailPessoal ?? colaborador.email}
                  </span>
                </div>
              </label>
            ))
          )}
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <span className="text-[13px] text-muted-foreground">
            {selecionados.size} selecionado{selecionados.size === 1 ? "" : "s"}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={limparEFechar}>
              Cancelar
            </Button>
            <Button onClick={vincular} disabled={selecionados.size === 0 || pending}>
              {pending ? "Vinculando..." : "Vincular"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
