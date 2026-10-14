"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface OpcaoSearchSelect {
  value: string;
  label: string;
  /** Texto secundário à direita (ex.: quantidade, data). */
  detalhe?: string;
}

/** Busca por trecho, sem diferenciar maiúsculas nem acentos. */
function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function filtrarPorTrecho(valor: string, busca: string) {
  return normalizar(valor).includes(normalizar(busca.trim())) ? 1 : 0;
}

/**
 * Select com busca (Popover + Command), com a mesma aparência do Select do
 * shadcn. Usado nos filtros e escolhas da gestão.
 */
export function SearchSelect({
  value,
  onValueChange,
  options,
  placeholder = "Selecione",
  searchPlaceholder = "Buscar...",
  emptyText = "Nenhum resultado.",
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: OpcaoSearchSelect[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const selecionada = options.find((o) => o.value === value);

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger
        disabled={disabled}
        aria-label={ariaLabel}
        role="combobox"
        aria-expanded={aberto}
        className={cn(
          "flex h-9 items-center justify-between gap-1.5 rounded-[8px] border border-input bg-transparent py-2 pr-2 pl-2.5 text-left text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
          className
        )}
      >
        <span className={cn("min-w-0 truncate", !selecionada && "text-muted-foreground")}>
          {selecionada?.label ?? placeholder}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width) min-w-64 p-0">
        <Command filter={filtrarPorTrecho}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={`${o.label} ${o.value}`}
                  keywords={o.detalhe ? [o.detalhe] : undefined}
                  data-checked={o.value === value}
                  onSelect={() => {
                    onValueChange(o.value);
                    setAberto(false);
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  {o.detalhe ? (
                    <span className="shrink-0 text-[12px] text-muted-foreground">{o.detalhe}</span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
