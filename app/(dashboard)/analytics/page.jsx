"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, TrendingDown, DollarSign, Users, Target, BarChart3 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend, } from "recharts";
import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
const COLORS = ["hsl(280 67% 60%)", "hsl(199 89% 48%)", "hsl(38 92% 50%)", "hsl(217 91% 60%)", "hsl(142 71% 45%)"];
export default function Analytics() {
  const queryClient = useQueryClient();
  const [isRealtime, setIsRealtime] = useState(false);
  // Fetch deals
  const { data: deals = [] } = useQuery({
    queryKey: ["deals-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deals").select("*");
      if (error)
        throw error;
      return data;
    },
  });
  // Fetch leads
  const { data: leads = [] } = useQuery({
    queryKey: ["leads-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*");
      if (error)
        throw error;
      return data;
    },
  });
  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("analytics-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => {
        queryClient.invalidateQueries({ queryKey: ["deals-analytics"] });
        toast.info("Deals updated");
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        queryClient.invalidateQueries({ queryKey: ["leads-analytics"] });
        toast.info("Leads updated");
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsRealtime(true);
        }
        else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setIsRealtime(false);
        }
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  // Calculate metrics
  const totalRevenue = deals.filter((d) => d.stage === "won").reduce((sum, d) => sum + Number(d.value || 0), 0);
  const wonDealsCount = deals.filter((d) => d.stage === "won").length;
  const avgDealSize = wonDealsCount > 0 ? totalRevenue / wonDealsCount : 0;
  const conversionRate = leads.length > 0 ? ((wonDealsCount / leads.length) * 100) : 0;
  const pipelineValue = deals.filter((d) => d.stage !== "won" && d.stage !== "lost").reduce((sum, d) => sum + Number(d.value || 0), 0);
  // Stage distribution for pie chart
  const stageData = [
    { name: "Lead", value: deals.filter((d) => d.stage === "lead").length },
    { name: "Qualified", value: deals.filter((d) => d.stage === "qualified").length },
    { name: "Proposal", value: deals.filter((d) => d.stage === "proposal").length },
    { name: "Negotiation", value: deals.filter((d) => d.stage === "negotiation").length },
    { name: "Won", value: deals.filter((d) => d.stage === "won").length },
  ].filter(d => d.value > 0);
  // Lead source distribution
  const leadSources = leads.reduce((acc, lead) => {
    const source = lead.source || "Unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  const sourceData = Object.entries(leadSources).map(([name, value]) => ({ name, value }));
  // Monthly trend data (Aggregated from real data)
  const monthlyData = deals
    .filter((d) => d.stage === "won" && d.created_at)
    .reduce((acc, deal) => {
      const date = new Date(deal.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      const existing = acc.find(d => d.month === month);
      if (existing) {
        existing.revenue += Number(deal.value || 0);
        existing.deals += 1;
      }
      else {
        acc.push({ month, revenue: Number(deal.value || 0), deals: 1 });
      }
      return acc;
    }, [])
    // Sort by month (simple sort, might need better logic for cross-year)
    .sort((a, b) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
  // Fallback for empty chart
  const chartData = monthlyData.length > 0 ? monthlyData : [
    { month: "No Data", revenue: 0, deals: 0 }
  ];
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };
  return (<>
    <AppHeader title="Analytics" subtitle="Business intelligence and performance insights" actions={<div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${isRealtime ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}`}>
        {isRealtime ? (<>
          <Wifi className="h-3 w-3 animate-pulse" />
          LIVE
        </>) : (<>
          <WifiOff className="h-3 w-3" />
          OFFLINE
        </>)}
      </div>
      <Select defaultValue="30d">
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>} />

    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">Real-time</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(avgDealSize)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">Real-time</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground">{conversionRate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Based on leads</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(pipelineValue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">Open deals</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(280 67% 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(280 67% 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(215 28% 17%)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)" }} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(222 47% 11%)", border: "1px solid hsl(215 28% 17%)", borderRadius: "8px" }} labelStyle={{ color: "hsl(210 40% 98%)" }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(280 67% 60%)" fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Deal Stage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stageData.length > 0 ? stageData : [{ name: "No Data", value: 1 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {(stageData.length > 0 ? stageData : [{ name: "No Data", value: 1 }]).map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(222 47% 11%)", border: "1px solid hsl(215 28% 17%)", borderRadius: "8px" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData.length > 0 ? sourceData : [{ name: "No Data", value: 0 }]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(215 28% 17%)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)" }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)" }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(222 47% 11%)", border: "1px solid hsl(215 28% 17%)", borderRadius: "8px" }} />
                  <Bar dataKey="value" fill="hsl(199 89% 48%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(215 28% 17%)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(222 47% 11%)", border: "1px solid hsl(215 28% 17%)", borderRadius: "8px" }} />
                  <Bar dataKey="deals" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </>);
}
