"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Colaborador, Formulario, PerfilUsuario } from "@/lib/types";

interface Crumb {
  label: string;
  href?: string;
}

function buildCrumbs(
  pathname: string,
  perfil: PerfilUsuario,
  colaboradores: Colaborador[],
  formularios: Formulario[]
): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);

  if (perfil === "colaborador") {
    const crumbs: Crumb[] = [{ label: "Início", href: "/colaborador" }];
    if (segments[1] === "formularios") {
      crumbs.push({ label: "Meus formulários", href: "/colaborador/formularios" });
      const formularioId = segments[2];
      if (formularioId) {
        const formulario = formularios.find((f) => f.id === formularioId);
        crumbs.push({
          label: formulario?.titulo ?? "Formulário",
          href: `/colaborador/formularios/${formularioId}`,
        });
        if (segments[3] === "responder") crumbs.push({ label: "Responder" });
        if (segments[3] === "sucesso") crumbs.push({ label: "Sucesso" });
      }
    }
    return crumbs;
  }

  const crumbs: Crumb[] = [{ label: "Painel", href: "/gestao" }];
  if (segments[1] === "formularios") {
    crumbs.push({ label: "Formulários", href: "/gestao/formularios" });
    const formularioId = segments[2];
    if (formularioId) {
      const formulario = formularios.find((f) => f.id === formularioId);
      crumbs.push({
        label: formulario?.titulo ?? "Formulário",
        href: `/gestao/formularios/${formularioId}`,
      });
      if (segments[3] === "respostas") {
        const colaboradorId = segments[4];
        const colaborador = colaboradorId
          ? colaboradores.find((c) => c.id === colaboradorId)
          : undefined;
        crumbs.push({ label: colaborador?.nome ?? "Respostas" });
      }
    }
  } else if (segments[1] === "colaboradores") {
    crumbs.push({ label: "Colaboradores" });
  } else if (segments[1] === "acessos") {
    crumbs.push({ label: "Gestão de acessos" });
  }
  return crumbs;
}

export function AppBreadcrumbs({
  perfil,
  colaboradores,
  formularios,
}: {
  perfil: PerfilUsuario;
  colaboradores: Colaborador[];
  formularios: Formulario[];
}) {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname, perfil, colaboradores, formularios);

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              <BreadcrumbItem className="min-w-0">
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className="truncate text-[14px] font-medium text-ink">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link href={crumb.href} />}
                    className="truncate text-[14px] text-graphite"
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
