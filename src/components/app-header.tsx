"use client";

import { Suspense, use } from "react";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CommandPalette } from "@/components/command-palette";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Colaborador, PerfilUsuario } from "@/lib/types";
import type { AppShellData } from "@/components/app-shell-data";

function MenuUsuarioSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5">
      <div className="hidden flex-col items-end gap-1.5 sm:flex">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="size-8 rounded-lg" />
    </div>
  );
}

function MenuUsuario({
  perfil,
  colaboradorAtual,
}: {
  perfil: PerfilUsuario;
  colaboradorAtual: Promise<Colaborador>;
}) {
  const colaborador = use(colaboradorAtual);
  const subtitulo = perfil === "colaborador" ? colaborador.cargo : "Administração de formulários";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 outline-none hover:bg-muted">
        <div className="hidden flex-col items-end leading-none sm:flex">
          <span className="text-[13px] font-medium text-foreground">{colaborador.nome}</span>
          <span className="text-[12px] text-muted-foreground">{subtitulo}</span>
        </div>
        <Avatar className="size-8 rounded-lg after:rounded-lg">
          <AvatarFallback className="rounded-lg bg-primary text-[12px] text-primary-foreground">
            {colaborador.iniciais}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-foreground">{colaborador.nome}</span>
              <span className="text-[12px] font-normal text-muted-foreground">{colaborador.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <User />
            Meu perfil
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader({ perfil, shell }: { perfil: PerfilUsuario; shell: AppShellData }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-5" />
        <AppBreadcrumbs perfil={perfil} colaboradores={shell.colaboradores} formularios={shell.formularios} />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <CommandPalette
          perfil={perfil}
          formularios={shell.formularios}
          atribuicoesColaborador={shell.atribuicoesColaborador}
        />
        <Suspense fallback={<MenuUsuarioSkeleton />}>
          <MenuUsuario perfil={perfil} colaboradorAtual={shell.colaboradorAtual} />
        </Suspense>
      </div>
    </header>
  );
}
