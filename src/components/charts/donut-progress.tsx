import { cn } from "@/lib/utils";

export function DonutProgress({
  value,
  size = 72,
  strokeWidth = 6,
  color = "var(--primary)",
  trackColor = "var(--muted)",
  label,
  showBadge = false,
  className,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  showBadge?: boolean;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  const cx = size / 2;
  const cy = size / 2;
  const angleRad = (clamped / 100) * 2 * Math.PI - Math.PI / 2;
  const badgeX = cx + radius * Math.cos(angleRad);
  const badgeY = cy + radius * Math.sin(angleRad);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeDasharray="1 7"
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>

      {showBadge && clamped > 0 ? (
        <div
          className="absolute z-10 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-primary-foreground shadow-elevated"
          style={{ left: badgeX, top: badgeY, transform: "translate(-50%, -50%)" }}
        >
          <span className="size-1.5 rounded-full bg-white/80" />
          {Math.round(clamped)}%
        </div>
      ) : null}

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[16px] font-semibold text-foreground">
          {Math.round(clamped)}%
        </span>
        {label ? (
          <span className="text-[10px] tracking-[0.3px] text-muted-foreground/80 uppercase">{label}</span>
        ) : null}
      </div>
    </div>
  );
}
