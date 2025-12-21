"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Building2,
  Kanban,
  FileText,
  BarChart3,
  Settings,
  Zap,
  TrendingUp,
  Activity,
  Target,
  Calendar,
  MessageSquare,
  ChevronDown,
  Sparkles,
  LogOut,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TestRunnerDialog } from "@/components/system/TestRunnerDialog";
import { FlaskConical } from "lucide-react";

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
  const { user, signOut } = useAuth();

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const displayInitials = getInitials(displayName);

  return (
    <aside className="h-screen w-64 flex-shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border">
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
        {navigation.map((group) => (
          <div key={group.title} className="mb-6">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn("nav-item", isActive && "nav-item-active")}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary/20 px-1.5 text-xs font-medium text-sidebar-primary">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {process.env.NODE_ENV !== 'production' && (
          <TestRunnerDialog>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors">
              <FlaskConical className="h-3.5 w-3.5" />
              <span>Verfify System</span>
            </button>
          </TestRunnerDialog>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-sidebar-accent transition-colors cursor-pointer group">
              <Avatar className="h-8 w-8 rounded-full border border-sidebar-border">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-sidebar-primary/10 text-sidebar-primary text-xs">
                  {displayInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-sidebar-foreground truncate group-hover:text-sidebar-accent-foreground">
                  {displayName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate group-hover:text-sidebar-accent-foreground/80">
                  {displayEmail}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground/80" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

