"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, FileSpreadsheet, FileText, LayoutDashboard, ShieldCheck, Users } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import type { Atribuicao, Formulario, PerfilUsuario } from "@/lib/types";

/** Lista de formulários do palette: resolve as promises só quando ele abre. */
function GrupoFormularios({
  perfil,
  formularios: formulariosPromise,
  atribuicoesColaborador: atribuicoesPromise,
  onAbrir,
}: {
  perfil: PerfilUsuario;
  formularios: Promise<Formulario[]>;
  atribuicoesColaborador: Promise<Atribuicao[]>;
  onAbrir: (href: string) => void;
}) {
  const formularios = React.use(formulariosPromise);
  const atribuicoesColaborador = React.use(atribuicoesPromise);
  const formularioItems =
    perfil === "colaborador"
      ? atribuicoesColaborador
          .map((a) => formularios.find((f) => f.id === a.formularioId))
          .filter((f): f is NonNullable<typeof f> => !!f)
      : formularios;

  return (
    <CommandGroup heading="Formulários">
      {formularioItems.map((formulario) => (
        <CommandItem
          key={formulario.id}
          onSelect={() =>
            onAbrir(
              perfil === "colaborador"
                ? `/colaborador/formularios/${formulario.id}`
                : `/gestao/formularios/${formulario.id}`
            )
          }
        >
          <FileText />
          {formulario.titulo}
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

export function CommandPalette({
  perfil,
  formularios,
  atribuicoesColaborador,
}: {
  perfil: PerfilUsuario;
  formularios: Promise<Formulario[]>;
  atribuicoesColaborador: Promise<Atribuicao[]>;
}) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  const navItems =
    perfil === "colaborador"
      ? [
          { label: "Início", href: "/colaborador", icon: LayoutDashboard },
          { label: "Meus formulários", href: "/colaborador/formularios", icon: ClipboardList },
        ]
      : [
          { label: "Painel", href: "/gestao", icon: LayoutDashboard },
          { label: "Formulários", href: "/gestao/formularios", icon: ClipboardList },
          { label: "Colaboradores", href: "/gestao/colaboradores", icon: Users },
          { label: "Gestão de acessos", href: "/gestao/acessos", icon: ShieldCheck },
          { label: "Relatórios", href: "/gestao/relatorios", icon: FileSpreadsheet },
        ];

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Busca rápida"
      description="Navegue pelo sistema ou abra um formulário"
    >
      <CommandInput placeholder="Buscar páginas ou formulários..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Navegação">
          {navItems.map((item) => (
            <CommandItem key={item.href} onSelect={() => run(() => router.push(item.href))}>
              <item.icon />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <React.Suspense
          fallback={
            <div className="flex flex-col gap-2 p-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          }
        >
          <GrupoFormularios
            perfil={perfil}
            formularios={formularios}
            atribuicoesColaborador={atribuicoesColaborador}
            onAbrir={(href) => run(() => router.push(href))}
          />
        </React.Suspense>
      </CommandList>
    </CommandDialog>
  );
}
