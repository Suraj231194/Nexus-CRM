"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, Target, DollarSign, Calendar, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, } from "recharts";
const COLORS = ["hsl(280 67% 60%)", "hsl(199 89% 48%)", "hsl(38 92% 50%)", "hsl(142 71% 45%)"];
import { useState, useEffect, useMemo } from "react";
export default function Forecasts() {
  const { data: deals = [], refetch } = useQuery({
    queryKey: ["deals-forecast"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deals").select("*");
      if (error)
        throw error;
      return data;
    },
  });
  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("deals-forecast-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  // Calculate forecast metrics
  const pipelineValue = deals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const weightedPipeline = deals.reduce((sum, d) => sum + (Number(d.value || 0) * (d.probability || 0) / 100), 0);
  const closedWon = deals.filter(d => d.stage === "won").reduce((sum, d) => sum + Number(d.value || 0), 0);
  const quarterTarget = 1000000; // $1M target (adjusted for demo data scale)
  const progress = (closedWon / quarterTarget) * 100;
  // Monthly forecast data calculation
  const monthlyForecast = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIndex = new Date().getMonth();
    // Show last 5 months + next 1 month
    const startMonthIndex = Math.max(0, currentMonthIndex - 5);
    const visibleMonths = months.slice(startMonthIndex, currentMonthIndex + 2);
    return visibleMonths.map((month) => {
      // Find deals for this month
      // Note: This matches strictly by month name assumption. For production, compare Date objects.
      // Demo simplified: filter by month index
      const monthIndex = months.indexOf(month);
      const dealsInMonth = deals.filter(d => {
        const date = new Date(d.created_at);
        return date.getMonth() === monthIndex;
      });
      const actual = dealsInMonth.filter(d => d.stage === "won").reduce((sum, d) => sum + Number(d.value || 0), 0);
      const forecast = dealsInMonth.reduce((sum, d) => sum + (Number(d.value || 0) * (d.probability || 0) / 100), 0);
      // If no data, provide randomized "target" demo curve or just static
      return {
        month,
        actual: actual || 0,
        forecast: forecast || 0,
        target: quarterTarget / 12, // Linear monthly target
      };
    });
  }, [deals]);
  // Stage breakdown
  const stageBreakdown = [
    { stage: "Qualified", value: deals.filter(d => d.stage === "qualified").reduce((s, d) => s + Number(d.value || 0), 0), probability: 30 },
    { stage: "Proposal", value: deals.filter(d => d.stage === "proposal").reduce((s, d) => s + Number(d.value || 0), 0), probability: 50 },
    { stage: "Negotiation", value: deals.filter(d => d.stage === "negotiation").reduce((s, d) => s + Number(d.value || 0), 0), probability: 75 },
    { stage: "Commit", value: deals.filter(d => d.probability && d.probability >= 90).reduce((s, d) => s + Number(d.value || 0), 0), probability: 90 },
  ].filter(s => s.value > 0);
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };
  // Location and Weather State
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("Detecting location...");
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });
        // Fetch weather data
        try {
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
          const data = await response.json();
          setWeather(data);
          // Fetch location names
          try {
            const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            const geoData = await geoResponse.json();
            const city = geoData.city || geoData.locality || "";
            const district = geoData.principalSubdivision || "";
            const country = geoData.countryName || "";
            const parts = [city, district, country].filter(Boolean);
            setLocationName(parts.length > 0 ? parts.join(", ") : `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`);
          }
          catch (geoError) {
            console.error("Error fetching location name:", geoError);
            setLocationName(`${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`);
          }
        }
        catch (error) {
          console.error("Error fetching weather:", error);
          setLocationName("Location detected (Weather unavailable)");
        }
      }, (error) => {
        console.error("Error getting location:", error);
        setLocationName("Location access denied");
      });
    }
    else {
      setLocationName("Geolocation not supported");
    }
  }, []);
  return (<>
    <AppHeader title="Forecasts" subtitle="Revenue predictions and local insights" actions={<div className="flex items-center gap-2">
      <Select defaultValue="q4">
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="q1">Q1 2024</SelectItem>
          <SelectItem value="q2">Q2 2024</SelectItem>
          <SelectItem value="q3">Q3 2024</SelectItem>
          <SelectItem value="q4">Q4 2024</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>} />

    <div className="p-6 space-y-6">
      {/* Local Forecast Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              {weather?.current?.is_day === 1 ? (<Zap className="h-6 w-6 text-primary" />) : (<TrendingUp className="h-6 w-6 text-primary" />)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Local Market Conditions</h3>
              <p className="text-sm text-foreground/80 flex items-center gap-1">
                <Target className="h-3 w-3" />
                {locationName}
              </p>
            </div>
          </div>
          <div className="text-right">
            {weather ? (<>
              <p className="text-3xl font-bold text-foreground">
                {weather.current.temperature_2m}{weather.current_units.temperature_2m}
              </p>
              <p className="text-sm text-muted-foreground">
                H: {weather.daily.temperature_2m_max[0]}° L: {weather.daily.temperature_2m_min[0]}°
              </p>
            </>) : (<p className="text-sm text-muted-foreground">Loading forecast...</p>)}
          </div>
        </CardContent>
      </Card>

      {/* Quota Progress */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Quarterly Quota Progress</h3>
              <p className="text-sm text-muted-foreground">Q4 2024 · Ends Dec 31</p>
            </div>
            <Badge variant="outline" className="text-success border-success/30">
              <TrendingUp className="h-3 w-3 mr-1" />
              On Track
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(closedWon)}</p>
                <p className="text-sm text-muted-foreground">of {formatCurrency(quarterTarget)} target</p>
              </div>
              <p className="text-2xl font-bold text-primary">{progress.toFixed(0)}%</p>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Closed: {formatCurrency(closedWon)}</span>
              <span>Pipeline: {formatCurrency(pipelineValue)}</span>
              <span>Weighted: {formatCurrency(weightedPipeline)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Closed Won</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(closedWon)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Case</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(closedWon + pipelineValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Most Likely</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(closedWon + weightedPipeline)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gap to Quota</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(Math.max(0, quarterTarget - closedWon))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Forecast Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyForecast}>
                  <defs>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(280 67% 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(280 67% 60%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(215 28% 17%)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)" }} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(222 47% 11%)", border: "1px solid hsl(215 28% 17%)", borderRadius: "8px" }} labelStyle={{ color: "hsl(210 40% 98%)" }} />
                  <Area type="monotone" dataKey="forecast" stroke="hsl(280 67% 60%)" fill="url(#colorForecast)" strokeWidth={2} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="actual" stroke="hsl(142 71% 45%)" fill="url(#colorActual)" strokeWidth={2} />
                  <Area type="monotone" dataKey="target" stroke="hsl(215 20% 45%)" fill="transparent" strokeWidth={1} strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(215 28% 17%)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)" }} tickFormatter={(v) => formatCurrency(v)} />
                  <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)" }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(222 47% 11%)", border: "1px solid hsl(215 28% 17%)", borderRadius: "8px" }} formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {stageBreakdown.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stage Breakdown Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Forecast Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stageBreakdown.map((stage, index) => (<div key={stage.stage} className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">{stage.stage}</span>
                  <span className="text-muted-foreground">{stage.probability}% probability</span>
                </div>
                <div className="flex items-center justify-between">
                  <Progress value={stage.probability} className="flex-1 h-2 mr-4" />
                  <span className="font-semibold text-foreground min-w-24 text-right">
                    {formatCurrency(stage.value)}
                  </span>
                </div>
              </div>
            </div>))}
          </div>
        </CardContent>
      </Card>
    </div>
  </>);
}
