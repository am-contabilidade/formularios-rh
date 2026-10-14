import { CircleDashed, Clock, Lock, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusAcesso } from "@/lib/types";
import { statusAcessoLabel } from "@/lib/labels";
import { coresStatusAcesso } from "@/lib/cores-status";

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
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap",
        coresStatusAcesso[status].badge,
        className
      )}
    >
      <Icon className="size-3.5" />
      {statusAcessoLabel[status]}
    </span>
  );
}
