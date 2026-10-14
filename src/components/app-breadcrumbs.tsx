"use client";

import { Fragment, Suspense, use, type ReactNode } from "react";
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
  label: ReactNode;
  href?: string;
}

/** Nome vindo do banco: só ele mostra skeleton; o resto do caminho é fixo. */
function NomeDinamico<T extends { id: string }>({
  lista,
  id,
  campo,
  padrao,
}: {
  lista: Promise<T[]>;
  id: string;
  campo: (item: T) => string;
  padrao: string;
}) {
  const item = use(lista).find((i) => i.id === id);
  return <>{item ? campo(item) : padrao}</>;
}

function dinamico<T extends { id: string }>(
  lista: Promise<T[]>,
  id: string,
  campo: (item: T) => string,
  padrao: string
) {
  return (
    <Suspense
      fallback={<span className="inline-block h-4 w-32 animate-pulse rounded-md bg-foreground/10 align-middle" />}
    >
      <NomeDinamico lista={lista} id={id} campo={campo} padrao={padrao} />
    </Suspense>
  );
}

function buildCrumbs(
  pathname: string,
  perfil: PerfilUsuario,
  colaboradores: Promise<Colaborador[]>,
  formularios: Promise<Formulario[]>
): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);

  if (perfil === "colaborador") {
    const crumbs: Crumb[] = [{ label: "Início", href: "/colaborador" }];
    if (segments[1] === "formularios") {
      crumbs.push({ label: "Meus formulários", href: "/colaborador/formularios" });
      const formularioId = segments[2];
      if (formularioId) {
        crumbs.push({
          label: dinamico(formularios, formularioId, (f) => f.titulo, "Formulário"),
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
      crumbs.push({
        label: dinamico(formularios, formularioId, (f) => f.titulo, "Formulário"),
        href: `/gestao/formularios/${formularioId}`,
      });
      if (segments[3] === "respostas") {
        const colaboradorId = segments[4];
        crumbs.push({
          label: colaboradorId
            ? dinamico(colaboradores, colaboradorId, (c) => c.nome, "Respostas")
            : "Respostas",
        });
      }
      if (segments[3] === "perguntas") crumbs.push({ label: "Perguntas" });
    }
  } else if (segments[1] === "colaboradores") {
    crumbs.push({ label: "Colaboradores" });
  } else if (segments[1] === "acessos") {
    crumbs.push({ label: "Gestão de acessos" });
  } else if (segments[1] === "relatorios") {
    crumbs.push({ label: "Relatórios" });
  }
  return crumbs;
}

/**
 * Em rotas dinâmicas o caminho só existe em runtime (usePathname): o fallback
 * mostra a raiz do perfil e um skeleton no lugar do resto da trilha.
 */
export function AppBreadcrumbs(props: {
  perfil: PerfilUsuario;
  colaboradores: Promise<Colaborador[]>;
  formularios: Promise<Formulario[]>;
}) {
  const raiz: Crumb =
    props.perfil === "colaborador"
      ? { label: "Início", href: "/colaborador" }
      : { label: "Painel", href: "/gestao" };
  return (
    <Suspense
      fallback={
        <Trilha
          crumbs={[
            raiz,
            {
              label: (
                <span className="inline-block h-4 w-40 animate-pulse rounded-md bg-foreground/10 align-middle" />
              ),
            },
          ]}
        />
      }
    >
      <TrilhaAtual {...props} />
    </Suspense>
  );
}

function TrilhaAtual({
  perfil,
  colaboradores,
  formularios,
}: {
  perfil: PerfilUsuario;
  colaboradores: Promise<Colaborador[]>;
  formularios: Promise<Formulario[]>;
}) {
  const pathname = usePathname();
  return <Trilha crumbs={buildCrumbs(pathname, perfil, colaboradores, formularios)} />;
}

function Trilha({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={index}>
              <BreadcrumbItem className="min-w-0">
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className="truncate text-[14px] font-medium text-foreground">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link href={crumb.href} />}
                    className="truncate text-[14px] text-muted-foreground"
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
