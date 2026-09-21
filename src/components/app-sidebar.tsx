"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";

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
  { title: "Início", url: "/colaborador", icon: LayoutDashboard },
  { title: "Meus formulários", url: "/colaborador/formularios", icon: ClipboardList },
];

const gestaoItems = [
  { title: "Painel", url: "/gestao", icon: LayoutDashboard },
  { title: "Formulários", url: "/gestao/formularios", icon: ClipboardList },
  { title: "Colaboradores", url: "/gestao/colaboradores", icon: Users },
  { title: "Gestão de acessos", url: "/gestao/acessos", icon: ShieldCheck },
];

export function AppSidebar({ perfil }: { perfil: PerfilUsuario }) {
  const pathname = usePathname();
  const items = perfil === "colaborador" ? colaboradorItems : gestaoItems;
  const rootUrl = perfil === "colaborador" ? "/colaborador" : "/gestao";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href={rootUrl} />}>
              <div className="flex size-8 shrink-0 items-center justify-center">
                <Image
                  src="/icon-logo.png"
                  alt=""
                  width={104}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-[14px] font-semibold text-ink">
                  Formulários RH
                </span>
                <span className="text-[12px] text-graphite">
                  {perfil === "colaborador" ? "Portal do colaborador" : "Painel de gestão"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  item.url === rootUrl
                    ? pathname === item.url
                    : pathname === item.url || pathname.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.url} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
