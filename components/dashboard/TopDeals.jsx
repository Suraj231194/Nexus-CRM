import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2 } from "lucide-react";
export function TopDeals({ deals }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(value);
    };
    return (<div className="space-y-4">
      {deals.map((deal, index) => (<div key={deal.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Building2 className="h-5 w-5"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-foreground truncate">
                {deal.name}
              </p>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(deal.value)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground truncate">
                {deal.company}
              </span>
              <span className="text-muted-foreground">•</span>
              <Badge variant={deal.stage} className="text-[10px]">
                {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={deal.probability} className="h-1.5 flex-1"/>
              <span className="text-xs text-muted-foreground tabular-nums">
                {deal.probability}%
              </span>
            </div>
          </div>
        </div>))}
    </div>);
}
