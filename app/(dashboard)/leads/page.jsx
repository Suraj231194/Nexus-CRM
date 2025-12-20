"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Download, MoreHorizontal, ArrowUpDown, Mail, Phone, Building2, } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination";
const statusColors = {
  new: "info",
  contacted: "warning",
  qualified: "success",
  unqualified: "destructive",
  converted: "default",
};
export default function Leads() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // New Lead State
  const [iscreateOpen, setIsCreateOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    source: "Website",
  });
  const { data: leads = [], refetch, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching leads:", error);
        return [];
      }
      return data;
    },
  });
  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("leads-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  const createLead = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("leads").insert([
        {
          first_name: newLead.firstName,
          last_name: newLead.lastName,
          email: newLead.email,
          phone: newLead.phone,
          company: newLead.company,
          job_title: newLead.jobTitle,
          source: newLead.source,
          status: "new",
          score: 0,
        },
      ]);
      if (error)
        throw error;
      setIsCreateOpen(false);
      setNewLead({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        jobTitle: "",
        source: "Website",
      });
      refetch();
    }
    catch (error) {
      console.error("Error creating lead:", error);
    }
  };
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((lead) => (lead.name || "").toLowerCase().includes(searchLower) ||
        (lead.company || "").toLowerCase().includes(searchLower) ||
        (lead.email || "").toLowerCase().includes(searchLower));
    }
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }
    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = (a.name || "").localeCompare(b.name || "");
      }
      else if (sortBy === "score") {
        comparison = (a.score || 0) - (b.score || 0);
      }
      else {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return filtered;
  }, [leads, search, statusFilter, sortBy, sortOrder]);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }
    else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };
  return (<>
    <AppHeader title="Leads" subtitle={`${filteredLeads.length} leads total`} actions={<div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4" />
        Export
      </Button>
      <Dialog open={iscreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the details of the new lead to track.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createLead} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={newLead.firstName} onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={newLead.lastName} onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={newLead.company} onChange={(e) => setNewLead({ ...newLead, company: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" value={newLead.jobTitle} onChange={(e) => setNewLead({ ...newLead, jobTitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select value={newLead.source} onValueChange={(value) => setNewLead({ ...newLead, source: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Cold Call">Cold Call</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Lead</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>} />

    <div className="p-6 space-y-4">
      {/* Filters and Table rendering... */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="unqualified">Unqualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort("name")} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Lead
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort("score")} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Score
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Source
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="border-b border-border last:border-0">
                  <td colSpan={7} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-muted-foreground">Loading leads...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLeads.map((lead) => (<tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                      {(lead.name || "?")[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {lead.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{lead.job_title}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {lead.phone}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{lead.company}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={statusColors[lead.status] || "default"}>
                    {(lead.status || "new").charAt(0).toUpperCase() + (lead.status || "new").slice(1)}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${lead.score || 0}%` }} />
                    </div>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {lead.score || 0}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-muted-foreground">{lead.source}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Lead</DropdownMenuItem>
                      <DropdownMenuItem>Convert to Deal</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="py-4 border-t border-border">
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
        </div>
      </div>
    </div>
  </>);
}
