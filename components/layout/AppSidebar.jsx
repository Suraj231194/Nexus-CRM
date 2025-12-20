"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Building2, Kanban, FileText, BarChart3, Settings, Zap, TrendingUp, Activity, Target, Calendar, MessageSquare, ChevronDown, Sparkles, } from "lucide-react";
const navigation = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Activity", href: "/activity", icon: Activity },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Leads", href: "/leads", icon: Target },
      { label: "Accounts", href: "/accounts", icon: Building2 },
      { label: "Deals", href: "/deals", icon: Kanban },
      { label: "Pipeline", href: "/pipeline", icon: TrendingUp },
    ],
  },
  {
    title: "Engagement",
    items: [
      { label: "Tasks", href: "/tasks", icon: Calendar },
      { label: "Contracts", href: "/contracts", icon: FileText },
      { label: "Messages", href: "/messages", icon: MessageSquare },
    ],
  },
  {
    title: "AI & Insights",
    items: [
      { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
      { label: "Forecasts", href: "/forecasts", icon: Zap },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
export function AppSidebar() {
  const pathname = usePathname();
  return (<aside className="h-screen w-64 flex-shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border">
    {/* Logo */}
    <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
        <Zap className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-sidebar-foreground">Nexus CRM</h1>
        <p className="text-xs text-sidebar-foreground/60">Enterprise CRM</p>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {navigation.map((group) => (<div key={group.title} className="mb-6">
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          {group.title}
        </h3>
        <ul className="space-y-1">
          {group.items.map((item) => {
            const isActive = pathname === item.href;
            return (<li key={item.href}>
              <Link href={item.href} className={cn("nav-item", isActive && "nav-item-active")}>
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary/20 px-1.5 text-xs font-medium text-sidebar-primary">
                  {item.badge}
                </span>)}
              </Link>
            </li>);
          })}
        </ul>
      </div>))}
    </nav>

    {/* User Section */}
    <div className="border-t border-sidebar-border p-3">
      <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-sidebar-accent transition-colors cursor-pointer">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-foreground">
          JD
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
          <p className="text-xs text-sidebar-foreground/60 truncate">Sales Manager</p>
        </div>
        <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
      </div>
    </div>
  </aside>);
}
