import { CircleDashed, Clock, Lock, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusAcesso } from "@/lib/types";
import { statusAcessoLabel } from "@/lib/labels";

const statusStyles: Record<StatusAcesso, string> = {
  aguardando: "border-coral/25 bg-coral/10 text-coral",
  em_andamento: "border-marigold/50 bg-marigold/25 text-black",
  respondido: "border-blue bg-blue text-white",
  bloqueado: "border-black/8 bg-muted text-stone",
};

const statusIcons: Record<StatusAcesso, React.ComponentType<{ className?: string }>> = {
  aguardando: Clock,
  em_andamento: CircleDashed,
  respondido: CheckCheck,
  bloqueado: Lock,
};

export function StatusBadge({
  status,
  className,
}: {
  status: StatusAcesso;
  className?: string;
}) {
  const Icon = statusIcons[status];
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium tracking-[0.3px] uppercase whitespace-nowrap",
        statusStyles[status],
        className
      )}
    >
      <Icon className="size-3.5" />
      {statusAcessoLabel[status]}
    </span>
  );
}
