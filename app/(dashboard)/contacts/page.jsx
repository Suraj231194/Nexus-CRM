"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Plus, Search, Mail, Phone, Building2, Star, MoreVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
export default function Contacts() {
  const [search, setSearch] = useState("");
  const { data: contacts = [], refetch } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*, accounts(name)")
        .order("created_at", { ascending: false });
      if (error)
        throw error;
      return data;
    },
  });
  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("contacts-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  const filteredContacts = contacts.filter((contact) => `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    contact.email?.toLowerCase().includes(search.toLowerCase()));
  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  return (<>
    <AppHeader title="Contacts" subtitle={`${contacts.length} total contacts`} actions={<Button size="sm">
      <Plus className="h-4 w-4" />
      New Contact
    </Button>} />

    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground">Contact</TableHead>
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Job Title</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Phone</TableHead>
              <TableHead className="text-muted-foreground w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (<TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No contacts found</p>
              </TableCell>
            </TableRow>) : (filteredContacts.map((contact) => (<TableRow key={contact.id} className="border-border hover:bg-muted/50 cursor-pointer">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      {getInitials(contact.first_name, contact.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      {contact.first_name} {contact.last_name}
                      {contact.is_primary && (<Star className="h-3 w-3 fill-chart-3 text-chart-3" />)}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {contact.accounts?.name ? (<span className="flex items-center gap-1 text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  {contact.accounts.name}
                </span>) : (<span className="text-muted-foreground">—</span>)}
              </TableCell>
              <TableCell>
                {contact.job_title ? (<Badge variant="outline">{contact.job_title}</Badge>) : (<span className="text-muted-foreground">—</span>)}
              </TableCell>
              <TableCell>
                {contact.email ? (<a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-primary hover:underline">
                  <Mail className="h-3 w-3" />
                  {contact.email}
                </a>) : (<span className="text-muted-foreground">—</span>)}
              </TableCell>
              <TableCell>
                {contact.phone ? (<span className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {contact.phone}
                </span>) : (<span className="text-muted-foreground">—</span>)}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>)))}
          </TableBody>
        </Table>
      </div>
    </div>
  </>);
}
