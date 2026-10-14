"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChartColumn, ChevronsUpDown, FileSpreadsheet, FileText, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchSelect, filtrarPorTrecho } from "@/components/search-select";
import { urlExportacao } from "@/lib/relatorios/url";

export interface OpcaoRelatorio {
  formularioId: string;
  titulo: string;
  respondentes: {
    colaboradorId: string;
    nome: string;
    email: string;
    iniciais: string;
    enviadoEm: string;
  }[];
}

function formatarData(data: string) {
  return new Date(`${data.slice(0, 10)}T00:00:00`).toLocaleDateString("pt-BR");
}

/** Escolha de formulário + colaborador (só quem respondeu) e download. */
export function ExportarRelatorio({ opcoes }: { opcoes: OpcaoRelatorio[] }) {
  const [formularioId, setFormularioId] = useState(opcoes.length === 1 ? opcoes[0].formularioId : "");
  const [colaboradorId, setColaboradorId] = useState("");
  const [aberto, setAberto] = useState(false);

  const formulario = opcoes.find((o) => o.formularioId === formularioId);
  const respondentes = useMemo(() => formulario?.respondentes ?? [], [formulario]);
  const colaborador = respondentes.find((r) => r.colaboradorId === colaboradorId);
  const pronto = !!formulario && !!colaborador;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Formulário</Label>
          <SearchSelect
            aria-label="Formulário"
            value={formularioId}
            onValueChange={(v) => {
              setFormularioId(v);
              setColaboradorId("");
            }}
            options={opcoes.map((o) => ({
              value: o.formularioId,
              label: o.titulo,
              detalhe: `${o.respondentes.length} ${o.respondentes.length === 1 ? "resposta" : "respostas"}`,
            }))}
            placeholder="Escolha um formulário"
            searchPlaceholder="Buscar formulário..."
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Colaborador</Label>
          <Popover open={aberto} onOpenChange={setAberto}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={aberto}
                  disabled={!formulario}
                  className="w-full justify-between rounded-[8px] font-normal"
                />
              }
            >
              <span className="flex min-w-0 items-center gap-2">
                <User />
                <span className="truncate">
                  {colaborador
                    ? colaborador.nome
                    : formulario
                      ? "Escolha quem respondeu"
                      : "Escolha o formulário primeiro"}
                </span>
              </span>
              <ChevronsUpDown className="opacity-50" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-(--anchor-width) min-w-72 p-0">
              <Command filter={filtrarPorTrecho}>
                <CommandInput placeholder="Buscar colaborador..." />
                <CommandList>
                  <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
                  <CommandGroup heading={`Responderam (${respondentes.length})`}>
                    {respondentes.map((r) => (
                      <CommandItem
                        key={r.colaboradorId}
                        value={`${r.nome} ${r.email}`}
                        data-checked={r.colaboradorId === colaboradorId}
                        onSelect={() => {
                          setColaboradorId(r.colaboradorId);
                          setAberto(false);
                        }}
                      >
                        <Avatar className="size-6 rounded-md after:rounded-md">
                          <AvatarFallback className="rounded-md bg-primary text-[10px] text-primary-foreground">
                            {r.iniciais}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1 truncate">{r.nome}</span>
                        <span className="text-[12px] text-muted-foreground">
                          {formatarData(r.enviadoEm)}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-muted-foreground">
          {pronto
            ? `Respostas enviadas em ${formatarData(colaborador.enviadoEm)}.`
            : "Escolha o formulário e o colaborador para liberar o download."}
        </p>
        <div className="flex flex-wrap gap-2">
          {pronto ? (
            <>
              <Button
                variant="ghost"
                render={
                  <Link
                    href={`/gestao/formularios/${formulario.formularioId}/respostas?colaborador=${colaborador.colaboradorId}`}
                  />
                }
                nativeButton={false}
              >
                <ChartColumn />
                Ver na tela
              </Button>
              <Button
                variant="outline"
                render={<a href={urlExportacao(formulario.formularioId, colaborador.colaboradorId, "csv")} download />}
                nativeButton={false}
              >
                <FileText />
                Baixar CSV
              </Button>
              <Button
                render={<a href={urlExportacao(formulario.formularioId, colaborador.colaboradorId, "xlsx")} download />}
                nativeButton={false}
              >
                <FileSpreadsheet />
                Baixar Excel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" disabled>
                <FileText />
                Baixar CSV
              </Button>
              <Button disabled>
                <FileSpreadsheet />
                Baixar Excel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
