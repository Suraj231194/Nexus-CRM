"use client";

import { useEffect, useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { TopDeals } from "@/components/dashboard/TopDeals";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Target, TrendingUp, Plus, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Simulation Logic: Inject random deals when Live Mode is active
  useEffect(() => {
    let interval;
    if (isLiveMode && user?.id) {
      toast.info("Live Mode Active: Simulating real-time transactions...", { id: "live-mode-toast", duration: Infinity });

      interval = setInterval(async () => {
        const companies = ["Acme Corp", "Globex", "Soylent Corp", "Initech", "Stark Ind", "Wayne Ent"];
        const randomValue = Math.floor(Math.random() * 15000) + 2000;

        // Insert a "Won" deal to impact revenue immediately
        const { error } = await supabase.from("deals").insert({
          title: `Live Deal: ${companies[Math.floor(Math.random() * companies.length)]}`,
          value: randomValue,
          stage: "won",
          probability: 100,
          user_id: user.id,
          created_at: new Date().toISOString()
        });

        if (error) {
          console.error("Simulation error:", error);
          toast.error("Simulation paused due to error", { id: "live-mode-toast" });
          setIsLiveMode(false);
        }
      }, 5000); // New deal every 5 seconds
    } else {
      toast.dismiss("live-mode-toast");
    }

    return () => {
      clearInterval(interval);
      toast.dismiss("live-mode-toast");
    };
  }, [isLiveMode, user]);
  // Fetch deals with real-time updates
  const { data: deals = [], refetch: refetchDeals } = useQuery({
    queryKey: ["dashboard-deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("value", { ascending: false });
      if (error)
        throw error;
      return data;
    },
  });
  // Fetch leads with real-time updates
  const { data: leads = [], refetch: refetchLeads } = useQuery({
    queryKey: ["dashboard-leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*");
      if (error)
        throw error;
      return data;
    },
  });
  // Fetch activities with real-time updates
  const { data: activities = [], refetch: refetchActivities } = useQuery({
    queryKey: ["dashboard-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error)
        throw error;
      return data;
    },
  });
  // Fetch profiles for activity names
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error)
        throw error;
      return data;
    },
  });
  // Real-time subscriptions
  useEffect(() => {
    const dealsChannel = supabase
      .channel("dashboard-deals-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => {
        refetchDeals();
      })
      .subscribe();
    const leadsChannel = supabase
      .channel("dashboard-leads-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        refetchLeads();
      })
      .subscribe();
    const activitiesChannel = supabase
      .channel("dashboard-activities-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "activities" }, () => {
        refetchActivities();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(dealsChannel);
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, [refetchDeals, refetchLeads, refetchActivities]);
  // Calculate metrics from real data
  const totalRevenue = deals.filter(d => d.stage === "won").reduce((sum, d) => sum + Number(d.value || 0), 0);
  const activeDeals = deals.filter(d => d.stage !== "won" && d.stage !== "lost").length;
  const newLeads = leads.filter(l => l.status === "new").length;
  const wonDeals = deals.filter(d => d.stage === "won").length;
  const totalDeals = deals.length;
  const winRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;
  // Pipeline data for chart
  const pipelineData = [
    { stage: "Lead", value: deals.filter(d => d.stage === "lead").reduce((s, d) => s + Number(d.value || 0), 0), count: deals.filter(d => d.stage === "lead").length },
    { stage: "Qualified", value: deals.filter(d => d.stage === "qualified").reduce((s, d) => s + Number(d.value || 0), 0), count: deals.filter(d => d.stage === "qualified").length },
    { stage: "Proposal", value: deals.filter(d => d.stage === "proposal").reduce((s, d) => s + Number(d.value || 0), 0), count: deals.filter(d => d.stage === "proposal").length },
    { stage: "Negotiation", value: deals.filter(d => d.stage === "negotiation").reduce((s, d) => s + Number(d.value || 0), 0), count: deals.filter(d => d.stage === "negotiation").length },
    { stage: "Won", value: deals.filter(d => d.stage === "won").reduce((s, d) => s + Number(d.value || 0), 0), count: deals.filter(d => d.stage === "won").length },
  ];
  // Revenue data (Real data aggregation)
  const currentMonth = new Date().getMonth();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize monthly data
  const monthlyRevenue = new Array(12).fill(0);

  deals.forEach(deal => {
    if (deal.stage === "won" && deal.created_at) {
      const date = new Date(deal.created_at);
      const monthIndex = date.getMonth();
      // Only include if within the current calendar year or last 12 months logic
      // For simplicity/demo: map to the month index regardless of year (assuming < 1 year data)
      monthlyRevenue[monthIndex] += Number(deal.value || 0);
    }
  });

  const revenueData = months.slice(0, currentMonth + 1).map((month, index) => {
    // Target is arbitrarily set to 1.2x of actual or a fixed base if actual is 0
    const actual = monthlyRevenue[index];
    const target = Math.max(actual * 1.2, 50000);

    return {
      month,
      revenue: actual,
      target: Math.round(target),
    };
  });
  // Top deals
  const topDeals = deals
    .filter(d => d.stage !== "lost")
    .slice(0, 4)
    .map(deal => ({
      id: deal.id,
      name: deal.name,
      company: deal.description || "—",
      value: Number(deal.value || 0),
      stage: deal.stage,
      probability: deal.probability || 10,
      owner: "Sales Team",
    }));
  // Format activities for feed
  const formattedActivities = activities.map(activity => {
    const profile = profiles.find(p => p.id === activity.user_id);
    return {
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description || undefined,
      timestamp: new Date(activity.created_at).toLocaleString(),
      user: { name: profile?.full_name || "Team Member" },
    };
  });
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };
  return (<>
    <AppHeader title="Dashboard" subtitle={`Welcome back${user?.email ? `, ${user.email.split('@')[0]}` : ''}. Here's what's happening today.`} actions={<div className="flex items-center gap-2">
      <div className="flex items-center gap-3 bg-card border border-border px-3 py-1.5 rounded-lg mr-2">
        <Switch id="live-mode" checked={isLiveMode} onCheckedChange={setIsLiveMode} />
        <Label htmlFor="live-mode" className="text-sm font-medium cursor-pointer">Live Mode</Label>
      </div>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4" />
        Export
      </Button>
      <Button size="sm">
        <Plus className="h-4 w-4" />
        New Deal
      </Button>
    </div>} />

    <div className="p-6 space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Revenue" value={formatCurrency(totalRevenue)} change={12.5} changeLabel="vs last month" trend="up" icon={<DollarSign className="h-4 w-4" />} />
        <MetricCard title="Active Deals" value={activeDeals.toString()} change={8.2} changeLabel="vs last month" trend="up" icon={<Target className="h-4 w-4" />} />
        <MetricCard title="New Leads" value={newLeads.toString()} change={leads.length > 0 ? 5.3 : 0} changeLabel="vs last month" trend={leads.length > 0 ? "up" : "neutral"} icon={<Users className="h-4 w-4" />} />
        <MetricCard title="Win Rate" value={`${winRate}%`} change={5.4} changeLabel="vs last month" trend="up" icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
              <p className="text-sm text-muted-foreground">Monthly revenue vs target</p>
            </div>
          </div>
          <RevenueChart data={revenueData.length > 0 ? revenueData : [{ month: "Jan", revenue: 0, target: 50000 }]} />
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Pipeline by Stage</h3>
              <p className="text-sm text-muted-foreground">Total value per stage</p>
            </div>
          </div>
          <PipelineChart data={pipelineData} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Top Deals</h3>
              <p className="text-sm text-muted-foreground">Highest value opportunities</p>
            </div>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <TopDeals deals={topDeals.length > 0 ? topDeals : []} />
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Latest team updates</p>
            </div>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <ActivityFeed activities={formattedActivities.length > 0 ? formattedActivities : []} />
        </div>
      </div>
    </div>
  </>);
}
