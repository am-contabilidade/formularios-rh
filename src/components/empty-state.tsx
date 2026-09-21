import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-black/8 bg-white px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-lg border border-black/8 bg-paper text-graphite">
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[16px] font-semibold text-ink">{title}</p>
        {description ? (
          <p className="max-w-sm text-[14px] text-graphite">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
