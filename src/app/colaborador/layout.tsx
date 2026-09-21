import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/auth";
import {
  colaboradorAtualPlaceholder,
  getAtribuicoesByColaborador,
  getColaboradorById,
  getColaboradores,
  getFormularios,
} from "@/lib/data";
import type { AppShellData } from "@/components/app-shell-data";

// Dados vêm do banco a cada request — sem isso o Next pré-renderiza estas
// rotas como estáticas no build e elas congelam com os dados daquele momento.
export const dynamic = "force-dynamic";

export default async function ColaboradorLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const colaboradorAtual =
    (await getColaboradorById(session.user.id)) ?? colaboradorAtualPlaceholder;
  const [colaboradores, formularios, atribuicoesColaborador] = await Promise.all([
    getColaboradores(),
    getFormularios(),
    getAtribuicoesByColaborador(colaboradorAtual.id),
  ]);
  const shell: AppShellData = { colaboradorAtual, colaboradores, formularios, atribuicoesColaborador };

  return (
    <SidebarProvider>
      <AppSidebar perfil="colaborador" />
      <SidebarInset className="bg-app-wash">
        <AppHeader perfil="colaborador" shell={shell} />
        <main className="flex flex-1 flex-col gap-8 p-4 sm:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
