"use client";

import { Bell, Search, Settings, HelpCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
export function AppHeader({ title, subtitle, actions }) {
  const { user } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);
  useEffect(() => {
    if (!user)
      return;
    const channel = supabase
      .channel("global-notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${user.id}`,
      }, () => {
        setHasUnread(true);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  return (<header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-6 py-4">
    <div>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary lg:hidden">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>
      {subtitle && (<p className="text-sm text-muted-foreground">{subtitle}</p>)}
    </div>

    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative hidden lg:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" placeholder="Search anything..." className="w-64 pl-9 bg-muted/50 border-transparent focus:bg-background focus:border-border" />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      {actions}

      {/* Quick actions */}
      <ModeToggle />
      <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
        <HelpCircle className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" className="text-muted-foreground relative" onClick={() => setHasUnread(false)}>
        <Bell className="h-4 w-4" />
        {hasUnread && (<span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />)}
      </Button>
      <Link href="/settings">
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  </header>);
}
