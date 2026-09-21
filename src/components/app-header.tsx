"use client";

import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
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
import type { PerfilUsuario } from "@/lib/types";
import type { AppShellData } from "@/components/app-shell-data";

export function AppHeader({ perfil, shell }: { perfil: PerfilUsuario; shell: AppShellData }) {
  const { colaboradorAtual, colaboradores, formularios, atribuicoesColaborador } = shell;
  const nome = colaboradorAtual.nome;
  const subtitulo =
    perfil === "colaborador" ? colaboradorAtual.cargo : "Administração de formulários";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-black/8 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-5" />
        <AppBreadcrumbs perfil={perfil} colaboradores={colaboradores} formularios={formularios} />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <CommandPalette
          perfil={perfil}
          colaboradorAtual={colaboradorAtual}
          formularios={formularios}
          atribuicoesColaborador={atribuicoesColaborador}
        />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 outline-none hover:bg-paper">
            <div className="hidden flex-col items-end leading-none sm:flex">
              <span className="text-[13px] font-medium text-ink">{nome}</span>
              <span className="text-[12px] text-graphite">{subtitulo}</span>
            </div>
            <Avatar className="size-8 rounded-lg after:rounded-lg">
              <AvatarFallback className="rounded-lg bg-blue text-[12px] text-white">
                {colaboradorAtual.iniciais}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-ink">{nome}</span>
                  <span className="text-[12px] font-normal text-graphite">
                    {colaboradorAtual.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <User />
                Meu perfil
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
