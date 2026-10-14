"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDown, Loader2, Users } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { filtrarPorTrecho } from "@/components/search-select";

export interface OpcaoColaborador {
  id: string;
  nome: string;
  iniciais: string;
  email: string;
}

/** Combobox com busca que filtra o painel por um colaborador (?colaborador=). */
export function FiltroColaborador({
  colaboradores,
  selecionadoId,
}: {
  colaboradores: OpcaoColaborador[];
  selecionadoId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const [carregando, startTransition] = useTransition();
  const selecionado = colaboradores.find((c) => c.id === selecionadoId);

  function selecionar(id?: string) {
    setAberto(false);
    startTransition(() => {
      router.replace(id ? `${pathname}?colaborador=${id}` : pathname, { scroll: false });
    });
  }

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={aberto}
            className="w-full justify-between sm:w-80"
          />
        }
      >
        <span className="flex min-w-0 items-center gap-2">
          {carregando ? <Loader2 className="animate-spin" /> : <Users />}
          <span className="truncate">{selecionado ? selecionado.nome : "Todos os colaboradores"}</span>
        </span>
        <ChevronsUpDown className="opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width) min-w-72 p-0">
        <Command filter={filtrarPorTrecho}>
          <CommandInput placeholder="Buscar colaborador..." />
          <CommandList>
            <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="__todos" data-checked={!selecionado} onSelect={() => selecionar()}>
                <Users />
                Todos os colaboradores
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading={`Responderam (${colaboradores.length})`}>
              {colaboradores.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.nome} ${c.email}`}
                  data-checked={c.id === selecionadoId}
                  onSelect={() => selecionar(c.id)}
                >
                  <Avatar className="size-6 rounded-md after:rounded-md">
                    <AvatarFallback className="rounded-md bg-primary text-[10px] text-primary-foreground">
                      {c.iniciais}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{c.nome}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
