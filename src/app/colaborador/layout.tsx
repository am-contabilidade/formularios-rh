import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAtribuicoesByColaborador, getColaboradores, getFormularios } from "@/lib/data";
import { getColaboradorLogado } from "@/lib/data/sessao";
import type { AppShellData } from "@/components/app-shell-data";

// Sem await: o shell renderiza na hora e os dados chegam por streaming.
// (Sessão inexistente já é redirecionada para /login pelo src/proxy.ts.)
export default function ColaboradorLayout({ children }: { children: ReactNode }) {
  const colaboradorAtual = getColaboradorLogado();
  const shell: AppShellData = {
    colaboradorAtual,
    colaboradores: getColaboradores(),
    formularios: getFormularios(),
    atribuicoesColaborador: colaboradorAtual.then((c) => getAtribuicoesByColaborador(c.id)),
  };

  return (
    <SidebarProvider>
      <AppSidebar perfil="colaborador" />
      <SidebarInset className="min-w-0 bg-canvas">
        <AppHeader perfil="colaborador" shell={shell} />
        <main className="flex flex-1 flex-col gap-8 p-4 sm:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
