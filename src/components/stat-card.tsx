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
    <Card className="group gap-0 rounded-xl border-border bg-card py-0 shadow-elevated transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated-lg">
      <CardContent className="flex flex-col gap-4 p-5">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            accent
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground group-hover:bg-primary/8 group-hover:text-primary"
          )}
        >
          <Icon className="size-[18px]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-heading text-[26px] leading-[1.2] font-bold tracking-[-0.02em] text-foreground">
            {value}
          </span>
          <span className="text-[13px] text-muted-foreground">{label}</span>
        </div>
        {trend !== undefined ? (
          <TrendChip value={trend} />
        ) : hint ? (
          <span className="text-[12px] text-muted-foreground/80">{hint}</span>
        ) : null}
      </CardContent>
    </Card>
  );
}
