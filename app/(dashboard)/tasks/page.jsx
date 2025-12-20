"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination";
import { Plus, Search, Calendar, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { formatDistanceToNow, isPast, isToday } from "date-fns";
export default function Tasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { data: tasks = [], refetch } = useQuery({
    queryKey: ["tasks", filter],
    queryFn: async () => {
      let query = supabase
        .from("activities")
        .select("*")
        .eq("type", "task")
        .order("due_date", { ascending: true });
      if (filter === "completed") {
        query = query.not("completed_at", "is", null);
      }
      else if (filter === "pending") {
        query = query.is("completed_at", null);
      }
      else if (filter === "overdue") {
        query = query.is("completed_at", null).lt("due_date", new Date().toISOString());
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
      .channel("tasks-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "activities" }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  const toggleComplete = useMutation({
    mutationFn: async ({ id, completed }) => {
      const { error } = await supabase
        .from("activities")
        .update({ completed_at: completed ? new Date().toISOString() : null })
        .eq("id", id);
      if (error)
        throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filteredTasks = tasks.filter((task) => task.title.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);
  const pendingCount = tasks.filter((t) => !t.completed_at).length;
  const overdueCount = tasks.filter((t) => !t.completed_at && t.due_date && isPast(new Date(t.due_date))).length;
  const getTaskStatus = (task) => {
    if (task.completed_at)
      return "completed";
    if (task.due_date && isPast(new Date(task.due_date)))
      return "overdue";
    if (task.due_date && isToday(new Date(task.due_date)))
      return "today";
    return "pending";
  };
  const statusConfig = {
    completed: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
    overdue: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
    today: { icon: Clock, color: "text-chart-3", bg: "bg-chart-3/10" },
    pending: { icon: Circle, color: "text-muted-foreground", bg: "bg-muted" },
  };
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium", // default
  });
  const createTask = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("activities").insert([
        {
          type: "task",
          title: newTask.title,
          description: newTask.description || null,
          due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
          // user_id is handled by RLS typically, or we should add it if needed explicitly. 
          // Assuming user_id is auto-added via auth.uid() default or trigger. 
          // If not, we might need: user_id: user?.id 
          user_id: user?.id
        },
      ]);
      if (error)
        throw error;
      setIsCreateOpen(false);
      setNewTask({ title: "", description: "", due_date: "", priority: "medium" });
      refetch();
    }
    catch (error) {
      console.error("Error creating task:", error);
    }
  };
  return (<>
    <AppHeader title="Tasks" subtitle={`${pendingCount} pending · ${overdueCount} overdue`} actions={<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your list.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={createTask} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input id="due_date" type="datetime-local" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>} />

    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All tasks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {paginatedTasks.length === 0 ? (<Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">Create your first task to get started</p>
            <Button>
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </CardContent>
        </Card>) : (<>
          {paginatedTasks.map((task) => {
            const status = getTaskStatus(task);
            const config = statusConfig[status];
            const StatusIcon = config.icon;
            return (<Card key={task.id} className="bg-card border-border hover:border-border/80 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox checked={!!task.completed_at} onCheckedChange={(checked) => toggleComplete.mutate({ id: task.id, completed: !!checked })} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className={`font-medium ${task.completed_at
                          ? "text-muted-foreground line-through"
                          : "text-foreground"}`}>
                          {task.title}
                        </h4>
                        {task.description && (<p className="text-sm text-muted-foreground mt-1">{task.description}</p>)}
                      </div>
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${config.bg}`}>
                        <StatusIcon className={`h-4 w-4 ${config.color}`} />
                      </div>
                    </div>
                    {task.due_date && (<div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className={status === "overdue"
                        ? "border-destructive/50 text-destructive"
                        : status === "today"
                          ? "border-chart-3/50 text-chart-3"
                          : ""}>
                        <Calendar className="h-3 w-3 mr-1" />
                        {status === "overdue"
                          ? `Overdue by ${formatDistanceToNow(new Date(task.due_date))}`
                          : status === "today"
                            ? "Due today"
                            : `Due ${formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}`}
                      </Badge>
                    </div>)}
                  </div>
                </div>
              </CardContent>
            </Card>);
          })}

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
        </>)}
      </div>
    </div>
  </>);
}
