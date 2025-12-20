"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
// Mock data
const initialStages = [
  {
    id: "lead",
    name: "Lead",
    color: "hsl(280 67% 60%)",
    deals: [
      { id: "d1", name: "Enterprise License", company: "Acme Corp", value: 125000, probability: 20, owner: "Sarah C.", daysInStage: 5 },
      { id: "d2", name: "Annual Subscription", company: "TechStart", value: 48000, probability: 15, owner: "Mike J.", daysInStage: 3 },
    ],
  },
  {
    id: "qualified",
    name: "Qualified",
    color: "hsl(199 89% 48%)",
    deals: [
      { id: "d3", name: "Platform Integration", company: "GlobalTech", value: 95000, probability: 40, owner: "Emily D.", daysInStage: 12 },
      { id: "d4", name: "Custom Development", company: "DataFlow", value: 180000, probability: 35, owner: "John B.", daysInStage: 8 },
      { id: "d5", name: "SaaS Migration", company: "CloudSys", value: 67000, probability: 45, owner: "Lisa M.", daysInStage: 6 },
    ],
  },
  {
    id: "proposal",
    name: "Proposal",
    color: "hsl(38 92% 50%)",
    deals: [
      { id: "d6", name: "Multi-year Contract", company: "InnovateCo", value: 320000, probability: 60, owner: "David W.", daysInStage: 15 },
      { id: "d7", name: "Expansion Deal", company: "NetWorks", value: 89000, probability: 55, owner: "Anna K.", daysInStage: 4 },
    ],
  },
  {
    id: "negotiation",
    name: "Negotiation",
    color: "hsl(217 91% 60%)",
    deals: [
      { id: "d8", name: "Enterprise Suite", company: "DigiPro", value: 450000, probability: 75, owner: "Chris L.", daysInStage: 22 },
      { id: "d9", name: "Annual Renewal", company: "MegaCorp", value: 156000, probability: 80, owner: "Sarah C.", daysInStage: 7 },
    ],
  },
  {
    id: "won",
    name: "Won",
    color: "hsl(142 71% 45%)",
    deals: [
      { id: "d10", name: "Pilot Program", company: "StartupXYZ", value: 35000, probability: 100, owner: "Mike J.", daysInStage: 1 },
    ],
  },
];
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};
function DealCard({ deal, stageColor }) {
  return (<div className="pipeline-card group">
    <div className="flex items-start justify-between gap-2 mb-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{deal.name}</p>
        <p className="text-sm text-muted-foreground truncate">{deal.company}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Edit Deal</DropdownMenuItem>
          <DropdownMenuItem>Add Activity</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold text-foreground tabular-nums">
          {formatCurrency(deal.value)}
        </span>
      </div>
      <Badge variant="outline" className="text-xs">
        {deal.probability}%
      </Badge>
    </div>

    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>{deal.owner}</span>
      <span>{deal.daysInStage}d in stage</span>
    </div>

    {/* Drag handle indicator */}
    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: stageColor }} />
  </div>);
}
function StageColumn({ stage }) {
  const totalValue = stage.deals.reduce((sum, deal) => sum + deal.value, 0);
  const avgProbability = stage.deals.length > 0
    ? Math.round(stage.deals.reduce((sum, deal) => sum + deal.probability, 0) / stage.deals.length)
    : 0;
  return (<div className="pipeline-stage min-h-[500px]">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
        <h3 className="font-semibold text-foreground">{stage.name}</h3>
        <Badge variant="secondary" className="text-xs">
          {stage.deals.length}
        </Badge>
      </div>
      <Button variant="ghost" size="icon-sm">
        <Plus className="h-4 w-4" />
      </Button>
    </div>

    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 pb-3 border-b border-border">
      <span>{formatCurrency(totalValue)}</span>
      <span>{avgProbability}% avg</span>
    </div>

    <div className="space-y-3 flex-1">
      {stage.deals.map((deal) => (<DealCard key={deal.id} deal={deal} stageColor={stage.color} />))}
    </div>
  </div>);
}
export default function Pipeline() {
  const [stages] = useState(initialStages);
  const totalValue = stages.reduce((sum, stage) => sum + stage.deals.reduce((s, d) => s + d.value, 0), 0);
  const totalDeals = stages.reduce((sum, stage) => sum + stage.deals.length, 0);
  const weightedValue = stages.reduce((sum, stage) => sum + stage.deals.reduce((s, d) => s + d.value * (d.probability / 100), 0), 0);
  return (<>
    <AppHeader title="Pipeline" subtitle={`${totalDeals} deals · ${formatCurrency(totalValue)} total · ${formatCurrency(weightedValue)} weighted`} actions={<Button size="sm">
      <Plus className="h-4 w-4" />
      New Deal
    </Button>} />

    <div className="p-6">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (<StageColumn key={stage.id} stage={stage} />))}
      </div>
    </div>
  </>);
}
