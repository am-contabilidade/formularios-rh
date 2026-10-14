import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cabeçalho das páginas (DESIGN.md): bloco branco com brilho azul sutil no
 * canto superior direito e o ícone da seção em marca d'água no canto inferior
 * direito. Os ícones vêm de `icones-navegacao.ts`, os mesmos do menu.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  icon: Icon,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border bg-card px-6 py-6 sm:px-8 sm:py-7",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-primary/10 blur-3xl"
      />
      {Icon ? (
        <Icon
          aria-hidden
          strokeWidth={1.5}
          className="pointer-events-none absolute -right-6 -bottom-10 -z-10 size-44 text-primary opacity-[0.07]"
        />
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          {eyebrow ? (
            <span className="inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.3px] text-muted-foreground uppercase">
              <span className="size-1.5 rounded-full bg-primary" />
              {eyebrow}
            </span>
          ) : null}
          <h1 className="font-heading text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-foreground">
            {title}
          </h1>
          {description ? (
            <div className="max-w-2xl text-[15px] leading-[1.5] text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
