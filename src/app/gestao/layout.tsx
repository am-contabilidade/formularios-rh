import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getColaboradores, getFormularios } from "@/lib/data";
import { getColaboradorLogado } from "@/lib/data/sessao";
import type { AppShellData } from "@/components/app-shell-data";

// Sem await: o shell renderiza na hora e os dados chegam por streaming.
// (Sessão inexistente já é redirecionada para /login pelo src/proxy.ts.)
export default function GestaoLayout({ children }: { children: ReactNode }) {
  const shell: AppShellData = {
    colaboradorAtual: getColaboradorLogado(),
    colaboradores: getColaboradores(),
    formularios: getFormularios(),
    atribuicoesColaborador: Promise.resolve([]),
  };

  return (
    <SidebarProvider>
      <AppSidebar perfil="gestao" />
      <SidebarInset className="min-w-0 bg-canvas">
        <AppHeader perfil="gestao" shell={shell} />
        <main className="flex flex-1 flex-col gap-8 p-4 sm:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
