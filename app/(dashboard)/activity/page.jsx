"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Phone, Mail, Calendar, FileText, CheckCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  task: CheckCircle,
};
const activityColors = {
  call: "bg-chart-2/20 text-chart-2",
  email: "bg-chart-3/20 text-chart-3",
  meeting: "bg-primary/20 text-primary",
  note: "bg-chart-4/20 text-chart-4",
  task: "bg-success/20 text-success",
};
export default function Activity() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { data: activities = [], refetch } = useQuery({
    queryKey: ["activities", filter],
    queryFn: async () => {
      let query = supabase.from("activities").select("*").order("created_at", { ascending: false });
      if (filter !== "all") {
        query = query.eq("type", filter);
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
      .channel("activities-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "activities" }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filteredActivities = activities.filter((activity) => activity.title.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);
  // State for new activity
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    type: "call",
    description: "",
    due_date: "",
  });
  const logActivity = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from("activities").insert([
        {
          title: newActivity.title,
          type: newActivity.type,
          description: newActivity.description,
          due_date: newActivity.due_date ? new Date(newActivity.due_date).toISOString() : null,
          user_id: user?.id,
        },
      ]);
      if (error)
        throw error;
      setIsLogOpen(false);
      setNewActivity({
        title: "",
        type: "call",
        description: "",
        due_date: "",
      });
      refetch();
    }
    catch (error) {
      console.error("Error logging activity:", error);
    }
  };
  return (<>
    <AppHeader title="Activity" subtitle="Track all sales activities and interactions" actions={<Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
          <DialogDescription>Record a new interaction or task.</DialogDescription>
        </DialogHeader>
        <form onSubmit={logActivity} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g., Call with John Doe" value={newActivity.title} onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={newActivity.type} onValueChange={(value) => setNewActivity({ ...newActivity, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="task">Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input id="description" value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date (Optional)</Label>
            <Input id="due_date" type="date" value={newActivity.due_date} onChange={(e) => setNewActivity({ ...newActivity, due_date: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsLogOpen(false)}>Cancel</Button>
            <Button type="submit">Log Activity</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>} />

    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search activities..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="call">Calls</SelectItem>
            <SelectItem value="email">Emails</SelectItem>
            <SelectItem value="meeting">Meetings</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {paginatedActivities.length === 0 ? (<Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No activities found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
            <Button onClick={() => setIsLogOpen(true)}>
              <Plus className="h-4 w-4" />
              Log Activity
            </Button>
          </CardContent>
        </Card>) : (<>
          {paginatedActivities.map((activity) => {
            const Icon = activityIcons[activity.type] || FileText;
            const colorClass = activityColors[activity.type] || "bg-muted text-muted-foreground";
            return (<Card key={activity.id} className="bg-card border-border hover:border-border/80 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-foreground">{activity.title}</h4>
                        {activity.description && (<p className="text-sm text-muted-foreground mt-1">{activity.description}</p>)}
                      </div>
                      <Badge variant="outline" className="capitalize shrink-0">
                        {activity.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                      {activity.due_date && (<span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(activity.due_date).toLocaleDateString()}
                      </span>)}
                      {activity.completed_at && (<Badge variant="success" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>);
          })}

          {/* Pagination */}
          {totalPages > 1 && (<Pagination>
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
          </Pagination>)}
        </>)}
      </div>
    </div>
  </>);
}
