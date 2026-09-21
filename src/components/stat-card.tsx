import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendChip } from "@/components/trend-chip";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = false,
  trend,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent?: boolean;
  trend?: number;
}) {
  return (
    <Card className="group gap-0 rounded-2xl border-black/6 bg-white py-0 shadow-elevated transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated-lg">
      <CardContent className="flex flex-col gap-4 p-5">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            accent
              ? "bg-blue/10 text-blue"
              : "bg-paper text-graphite group-hover:bg-blue/8 group-hover:text-blue"
          )}
        >
          <Icon className="size-[18px]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[26px] leading-[1.2] font-semibold text-ink">
            {value}
          </span>
          <span className="text-[13px] text-graphite">{label}</span>
        </div>
        {trend !== undefined ? (
          <TrendChip value={trend} />
        ) : hint ? (
          <span className="text-[12px] text-stone">{hint}</span>
        ) : null}
      </CardContent>
    </Card>
  );
}
