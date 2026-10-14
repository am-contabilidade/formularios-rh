import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrendChip({ value, className }: { value: number; className?: string }) {
  if (value === 0) {
    return (
      <span className={cn("text-[12px] font-medium text-muted-foreground/80", className)}>Estável</span>
    );
  }

  const positivo = value > 0;
  const Icon = positivo ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[12px] font-medium",
        positivo ? "text-foreground" : "text-destructive",
        className
      )}
    >
      <Icon className="size-3.5" />
      {positivo ? "+" : ""}
      {value}%
    </span>
  );
}
