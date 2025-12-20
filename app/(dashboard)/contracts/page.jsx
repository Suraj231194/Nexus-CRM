"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Plus, Search, FileText, Calendar, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
// Mock data for contracts (can be connected to Supabase later)
const mockContracts = [
  {
    id: "1",
    title: "Enterprise License Agreement",
    company: "Acme Corporation",
    value: 450000,
    status: "active",
    startDate: "2024-01-15",
    endDate: "2025-01-14",
    type: "Annual",
  },
  {
    id: "2",
    title: "SaaS Subscription",
    company: "TechStart Inc",
    value: 120000,
    status: "pending",
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    type: "Annual",
  },
  {
    id: "3",
    title: "Professional Services",
    company: "GlobalTech Solutions",
    value: 85000,
    status: "expired",
    startDate: "2023-06-01",
    endDate: "2024-05-31",
    type: "Project",
  },
  {
    id: "4",
    title: "Support Agreement",
    company: "DataFlow Systems",
    value: 36000,
    status: "active",
    startDate: "2024-02-01",
    endDate: "2025-01-31",
    type: "Annual",
  },
  {
    id: "5",
    title: "Implementation Contract",
    company: "InnovateCo",
    value: 200000,
    status: "draft",
    startDate: "2024-04-01",
    endDate: "2024-09-30",
    type: "Project",
  },
];
const statusConfig = {
  active: { label: "Active", color: "bg-success/20 text-success border-success/30", icon: CheckCircle },
  pending: { label: "Pending", color: "bg-chart-3/20 text-chart-3 border-chart-3/30", icon: Clock },
  expired: { label: "Expired", color: "bg-destructive/20 text-destructive border-destructive/30", icon: XCircle },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-muted", icon: FileText },
};
export default function Contracts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredContracts = mockContracts.filter((contract) => {
    const matchesSearch = contract.title.toLowerCase().includes(search.toLowerCase()) ||
      contract.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalValue = mockContracts.filter(c => c.status === "active").reduce((sum, c) => sum + c.value, 0);
  const activeCount = mockContracts.filter(c => c.status === "active").length;
  const pendingCount = mockContracts.filter(c => c.status === "pending").length;
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };
  return (<>
    <AppHeader title="Contracts" subtitle={`${activeCount} active contracts · ${formatCurrency(totalValue)} value`} actions={<Button size="sm">
      <Plus className="h-4 w-4" />
      New Contract
    </Button>} />

    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold text-foreground">{mockContracts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Value</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contracts..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["all", "active", "pending", "draft", "expired"].map((status) => (<Button key={status} variant={statusFilter === status ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(status)} className="capitalize">
            {status === "all" ? "All" : status}
          </Button>))}
        </div>
      </div>

      {/* Contracts Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground">Contract</TableHead>
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Value</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Duration</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContracts.length === 0 ? (<TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No contracts found</p>
              </TableCell>
            </TableRow>) : (filteredContracts.map((contract) => {
              const config = statusConfig[contract.status];
              const StatusIcon = config.icon;
              return (<TableRow key={contract.id} className="border-border hover:bg-muted/50 cursor-pointer">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{contract.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{contract.company}</TableCell>
                <TableCell>
                  <span className="font-semibold text-foreground">{formatCurrency(contract.value)}</span>
                </TableCell>
                <TableCell>
                  <Badge className={config.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{contract.type}</Badge>
                </TableCell>
              </TableRow>);
            }))}
          </TableBody>
        </Table>
      </div>
    </div>
  </>);
}
