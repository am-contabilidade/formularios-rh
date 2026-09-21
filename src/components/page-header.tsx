import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-1.5">
        {eyebrow ? (
          <span className="text-[12px] font-medium tracking-[0.3px] text-graphite uppercase">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="text-[28px] leading-[1.2] font-semibold text-ink">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-[16px] leading-[1.5] text-graphite">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
