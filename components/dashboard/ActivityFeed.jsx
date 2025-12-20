import { cn } from "@/lib/utils";
import { Phone, Mail, Calendar, FileText, MessageSquare, DollarSign, UserPlus, CheckCircle2, } from "lucide-react";
const activityIcons = {
    call: Phone,
    email: Mail,
    meeting: Calendar,
    note: FileText,
    message: MessageSquare,
    deal: DollarSign,
    lead: UserPlus,
    task: CheckCircle2,
};
const activityColors = {
    call: "bg-info/15 text-info",
    email: "bg-primary/15 text-primary",
    meeting: "bg-warning/15 text-warning",
    note: "bg-muted text-muted-foreground",
    message: "bg-chart-4/15 text-chart-4",
    deal: "bg-success/15 text-success",
    lead: "bg-chart-4/15 text-chart-4",
    task: "bg-success/15 text-success",
};
export function ActivityFeed({ activities }) {
    return (<div className="space-y-4">
      {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];
            return (<div key={activity.id} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colorClass)}>
              <Icon className="h-4 w-4"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.title}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>
              {activity.description && (<p className="text-sm text-muted-foreground truncate mt-0.5">
                  {activity.description}
                </p>)}
              <p className="text-xs text-muted-foreground mt-1">
                by {activity.user.name}
              </p>
            </div>
          </div>);
        })}
    </div>);
}
