"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { iconesNavegacao } from "@/components/icones-navegacao";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { PerfilUsuario } from "@/lib/types";

const colaboradorItems = [
  { title: "Início", url: "/colaborador", icon: iconesNavegacao.painel },
  { title: "Meus formulários", url: "/colaborador/formularios", icon: iconesNavegacao.formularios },
];

const gestaoItems = [
  { title: "Painel", url: "/gestao", icon: iconesNavegacao.painel },
  { title: "Formulários", url: "/gestao/formularios", icon: iconesNavegacao.formularios },
  { title: "Colaboradores", url: "/gestao/colaboradores", icon: iconesNavegacao.colaboradores },
  { title: "Gestão de acessos", url: "/gestao/acessos", icon: iconesNavegacao.acessos },
  { title: "Relatórios", url: "/gestao/relatorios", icon: iconesNavegacao.relatorios },
];

export function AppSidebar({ perfil }: { perfil: PerfilUsuario }) {
  const items = perfil === "colaborador" ? colaboradorItems : gestaoItems;
  const rootUrl = perfil === "colaborador" ? "/colaborador" : "/gestao";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href={rootUrl} />}>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white p-1">
                <Image
                  src="/icon-logo.png"
                  alt=""
                  width={104}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-heading text-[14px] font-bold text-sidebar-foreground">
                  Formulários RH
                </span>
                <span className="text-[12px] text-sidebar-foreground/60">
                  {perfil === "colaborador" ? "Portal do colaborador" : "Painel de gestão"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* usePathname() só existe em runtime nas rotas dinâmicas: o
                  fallback é o mesmo menu, só sem o item ativo destacado. */}
              <Suspense fallback={<ItensMenu items={items} rootUrl={rootUrl} pathname={null} />}>
                <ItensMenuAtivos items={items} rootUrl={rootUrl} />
              </Suspense>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

type ItemMenu = (typeof gestaoItems)[number];

function ItensMenuAtivos({ items, rootUrl }: { items: ItemMenu[]; rootUrl: string }) {
  const pathname = usePathname();
  return <ItensMenu items={items} rootUrl={rootUrl} pathname={pathname} />;
}

function ItensMenu({
  items,
  rootUrl,
  pathname,
}: {
  items: ItemMenu[];
  rootUrl: string;
  pathname: string | null;
}) {
  return (
    <>
      {items.map((item) => {
        const isActive =
          pathname !== null &&
          (item.url === rootUrl
            ? pathname === item.url
            : pathname === item.url || pathname.startsWith(`${item.url}/`));
        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton isActive={isActive} tooltip={item.title} render={<Link href={item.url} />}>
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
