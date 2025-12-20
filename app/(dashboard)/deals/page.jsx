"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination";
import { Plus, Search, Briefcase, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
const stageColors = {
  lead: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  qualified: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  proposal: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  negotiation: "bg-primary/20 text-primary border-primary/30",
  won: "bg-success/20 text-success border-success/30",
  lost: "bg-destructive/20 text-destructive border-destructive/30",
};
const stageLabels = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};
export default function Deals() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const { data: deals = [], refetch } = useQuery({
    queryKey: ["deals", stageFilter],
    queryFn: async () => {
      let query = supabase.from("deals").select("*").order("created_at", { ascending: false });
      if (stageFilter !== "all") {
        query = query.eq("stage", stageFilter);
      }
      const { data, error } = await query;
      if (error)
        throw error;
      return data;
    },
  });
  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("deals-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filteredDeals = deals.filter((deal) => deal.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);
  const paginatedDeals = filteredDeals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, stageFilter]);
  const totalValue = deals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const avgProbability = deals.length > 0 ? deals.reduce((sum, d) => sum + (d.probability || 0), 0) / deals.length : 0;
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };
  // Create Deal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: "",
    value: "",
    stage: "qualified",
    probability: "30",
    closing_date: "",
  });
  const createDeal = async (e) => {
    e.preventDefault();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from("deals").insert([
        {
          name: newDeal.title,
          value: Number(newDeal.value),
          stage: newDeal.stage,
          probability: Number(newDeal.probability),
          expected_close_date: newDeal.closing_date ? new Date(newDeal.closing_date).toISOString() : null,
          priority: "medium", // Default
        },
      ]);
      if (error)
        throw error;
      setIsCreateOpen(false);
      setNewDeal({
        title: "",
        value: "",
        stage: "qualified",
        probability: "30",
        closing_date: "",
      });
      refetch();
    }
    catch (error) {
      console.error("Error creating deal:", error);
    }
  };
  return (<>
    <AppHeader title="Deals" subtitle={`${deals.length} deals · ${formatCurrency(totalValue)} total value`} actions={<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Deal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Deal</DialogTitle>
          <DialogDescription>
            Enter the details of the new deal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={createDeal} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Deal Title</Label>
            <Input id="title" value={newDeal.title} onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value ($)</Label>
              <Input id="value" type="number" value={newDeal.value} onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input id="probability" type="number" min="0" max="100" value={newDeal.probability} onChange={(e) => setNewDeal({ ...newDeal, probability: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stage">Stage</Label>
            <Select value={newDeal.stage} onValueChange={(value) => setNewDeal({ ...newDeal, stage: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="won">Closed Won</SelectItem>
                <SelectItem value="lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="closing_date">Expected Close Date</Label>
            <Input id="closing_date" type="date" value={newDeal.closing_date} onChange={(e) => setNewDeal({ ...newDeal, closing_date: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Deal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>} />

    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Deals</p>
              <p className="text-2xl font-bold text-foreground">{deals.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pipeline Value</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Probability</p>
              <p className="text-2xl font-bold text-foreground">{avgProbability.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search deals..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="negotiation">Negotiation</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deals Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground">Deal</TableHead>
              <TableHead className="text-muted-foreground">Value</TableHead>
              <TableHead className="text-muted-foreground">Stage</TableHead>
              <TableHead className="text-muted-foreground">Probability</TableHead>
              <TableHead className="text-muted-foreground">Close Date</TableHead>
              <TableHead className="text-muted-foreground">Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDeals.length === 0 ? (<TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No deals found</p>
              </TableCell>
            </TableRow>) : (paginatedDeals.map((deal) => (<TableRow key={deal.id} className="border-border hover:bg-muted/50 cursor-pointer">
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">{deal.name}</p>
                  {deal.description && (<p className="text-sm text-muted-foreground truncate max-w-xs">{deal.description}</p>)}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-foreground">{formatCurrency(Number(deal.value))}</span>
              </TableCell>
              <TableCell>
                <Badge className={stageColors[deal.stage] || "bg-muted text-muted-foreground"}>
                  {stageLabels[deal.stage] || deal.stage}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={deal.probability || 0} className="w-16 h-2" />
                  <span className="text-sm text-muted-foreground">{deal.probability}%</span>
                </div>
              </TableCell>
              <TableCell>
                {deal.expected_close_date ? (<span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(deal.expected_close_date).toLocaleDateString()}
                </span>) : (<span className="text-muted-foreground">—</span>)}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={deal.priority === "high"
                  ? "border-destructive/50 text-destructive"
                  : deal.priority === "medium"
                    ? "border-chart-3/50 text-chart-3"
                    : "border-muted-foreground/50 text-muted-foreground"}>
                  {deal.priority || "medium"}
                </Badge>
              </TableCell>
            </TableRow>)))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (<div className="py-4 border-t border-border">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (<PaginationItem key={i}>
                <PaginationLink isActive={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)} className="cursor-pointer">
                  {i + 1}
                </PaginationLink>
              </PaginationItem>))}

              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>)}
      </div>
    </div>
  </>);
}
