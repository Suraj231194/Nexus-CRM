import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
export function MetricCard({ title, value, change, changeLabel, icon, trend = "neutral", className, }) {
    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
    const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";
    return (<div className={cn("metric-card group", className)}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {icon}
          </div>)}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        {(change !== undefined || changeLabel) && (<div className="flex items-center gap-1.5">
            <span className={cn("flex items-center gap-0.5 text-sm font-medium", trendColor)}>
              <TrendIcon className="h-3.5 w-3.5"/>
              {change !== undefined && `${change > 0 ? "+" : ""}${change}%`}
            </span>
            {changeLabel && (<span className="text-sm text-muted-foreground">{changeLabel}</span>)}
          </div>)}
      </div>
    </div>);
}
