"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination";
import { Plus, Search, Building2, Globe, Phone, MapPin, Users, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
export default function Accounts() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const { data: accounts = [], refetch } = useQuery({
    queryKey: ["accounts", industryFilter],
    queryFn: async () => {
      let query = supabase.from("accounts").select("*").order("created_at", { ascending: false });
      if (industryFilter !== "all") {
        query = query.eq("industry", industryFilter);
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
      .channel("accounts-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "accounts" }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filteredAccounts = accounts.filter((account) => account.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, industryFilter]);
  const industries = [...new Set(accounts.map((a) => a.industry).filter(Boolean))];
  const formatCurrency = (value) => {
    if (!value)
      return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    industry: "",
    website: "",
    phone: "",
    city: "",
    state: "",
    annual_revenue: "",
    employee_count: "",
  });
  const createAccount = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("accounts").insert([
        {
          name: newAccount.name,
          industry: newAccount.industry || null,
          website: newAccount.website || null,
          phone: newAccount.phone || null,
          city: newAccount.city || null,
          state: newAccount.state || null,
          annual_revenue: newAccount.annual_revenue ? Number(newAccount.annual_revenue) : null,
          employee_count: newAccount.employee_count ? Number(newAccount.employee_count) : null,
        },
      ]);
      if (error)
        throw error;
      setIsCreateOpen(false);
      setNewAccount({
        name: "",
        industry: "",
        website: "",
        phone: "",
        city: "",
        state: "",
        annual_revenue: "",
        employee_count: "",
      });
      refetch();
    }
    catch (error) {
      console.error("Error creating account:", error);
    }
  };
  return (<>
    <AppHeader title="Accounts" subtitle={`${accounts.length} total accounts`} actions={<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>
            Enter the details of the company you want to add to your accounts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={createAccount} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" value={newAccount.industry} onChange={(e) => setNewAccount({ ...newAccount, industry: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={newAccount.website} onChange={(e) => setNewAccount({ ...newAccount, website: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={newAccount.phone} onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={newAccount.city} onChange={(e) => setNewAccount({ ...newAccount, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={newAccount.state} onChange={(e) => setNewAccount({ ...newAccount, state: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenue">Annual Revenue</Label>
              <Input id="revenue" type="number" value={newAccount.annual_revenue} onChange={(e) => setNewAccount({ ...newAccount, annual_revenue: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employees">Employees</Label>
              <Input id="employees" type="number" value={newAccount.employee_count} onChange={(e) => setNewAccount({ ...newAccount, employee_count: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>} />

    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search accounts..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((industry) => (<SelectItem key={industry} value={industry}>
              {industry}
            </SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* Accounts Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Industry</TableHead>
              <TableHead className="text-muted-foreground">Location</TableHead>
              <TableHead className="text-muted-foreground">Employees</TableHead>
              <TableHead className="text-muted-foreground">Revenue</TableHead>
              <TableHead className="text-muted-foreground">Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAccounts.length === 0 ? (<TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No accounts found</p>
              </TableCell>
            </TableRow>) : (paginatedAccounts.map((account) => (<TableRow key={account.id} className="border-border hover:bg-muted/50 cursor-pointer">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{account.name}</p>
                    {account.website && (<p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {account.website}
                    </p>)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {account.industry ? (<Badge variant="outline">{account.industry}</Badge>) : (<span className="text-muted-foreground">—</span>)}
              </TableCell>
              <TableCell>
                {account.city || account.state ? (<span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {[account.city, account.state].filter(Boolean).join(", ")}
                </span>) : (<span className="text-muted-foreground">—</span>)}
              </TableCell>
              <TableCell>
                {account.employee_count ? (<span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {account.employee_count.toLocaleString()}
                </span>) : (<span className="text-muted-foreground">—</span>)}
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1 text-foreground font-medium">
                  <DollarSign className="h-3 w-3 text-success" />
                  {formatCurrency(account.annual_revenue)}
                </span>
              </TableCell>
              <TableCell>
                {account.phone ? (<span className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {account.phone}
                </span>) : (<span className="text-muted-foreground">—</span>)}
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
