"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Send, Paperclip, MoreVertical, Phone, Video } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
// Mock data for messages
const mockConversations = [
  {
    id: "1",
    name: "Sarah Chen",
    company: "Acme Corporation",
    lastMessage: "Thanks for the proposal! Let me review it with my team.",
    timestamp: "2m ago",
    unread: 2,
    starred: true,
    avatar: "SC",
  },
  {
    id: "2",
    name: "Mike Johnson",
    company: "TechStart Inc",
    lastMessage: "Can we schedule a demo for next week?",
    timestamp: "1h ago",
    unread: 0,
    starred: false,
    avatar: "MJ",
  },
  {
    id: "3",
    name: "Emily Davis",
    company: "GlobalTech Solutions",
    lastMessage: "I've attached the signed contract.",
    timestamp: "3h ago",
    unread: 1,
    starred: true,
    avatar: "ED",
  },
  {
    id: "4",
    name: "Alex Rivera",
    company: "DataFlow Systems",
    lastMessage: "Looking forward to our meeting tomorrow.",
    timestamp: "1d ago",
    unread: 0,
    starred: false,
    avatar: "AR",
  },
];
const mockMessages = [
  { id: "1", sender: "them", text: "Hi! I wanted to follow up on our discussion from last week.", time: "10:30 AM" },
  { id: "2", sender: "me", text: "Of course! I've prepared the proposal based on your requirements.", time: "10:32 AM" },
  { id: "3", sender: "me", text: "I'll send it over shortly. It includes the pricing for the enterprise package.", time: "10:33 AM" },
  { id: "4", sender: "them", text: "Perfect! That's exactly what we need. Can you also include the implementation timeline?", time: "10:35 AM" },
  { id: "5", sender: "me", text: "Absolutely. I'll add a detailed timeline with milestones and deliverables.", time: "10:38 AM" },
  { id: "6", sender: "them", text: "Thanks for the proposal! Let me review it with my team.", time: "10:45 AM" },
];
export default function Messages() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  // Fetch profiles (users) to chat with
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").neq("id", user?.id);
      if (error)
        throw error;
      return data;
    },
    enabled: !!user,
  });
  // Fetch messages between current user and selected profile
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["messages", selectedProfile?.id],
    queryFn: async () => {
      if (!selectedProfile || !user)
        return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedProfile.id}),and(sender_id.eq.${selectedProfile.id},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      if (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
      return data;
    },
    enabled: !!selectedProfile && !!user,
  });
  // Real-time subscription
  useEffect(() => {
    if (!user)
      return;
    const channel = supabase
      .channel("messages-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, () => refetchMessages())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=eq.${user.id}` }, () => refetchMessages())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => refetchMessages()) // listen for edits
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetchMessages]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProfile || !user)
      return;
    try {
      if (editingMessage) {
        // Update existing message
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase
          .from("messages")
          .update({ content: newMessage, is_edited: true })
          .eq("id", editingMessage.id);
        if (error)
          throw error;
        toast.success("Message updated");
        setEditingMessage(null);
      }
      else {
        // Insert new message
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from("messages").insert([
          {
            sender_id: user.id,
            receiver_id: selectedProfile.id,
            content: newMessage,
          },
        ]);
        if (error)
          throw error;
      }
      setNewMessage("");
      refetchMessages();
    }
    catch (error) {
      console.error("Error sending message:", error);
      toast.error(`Failed to send message: ${error.message || "Unknown error"}`);
    }
  };
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user || !selectedProfile)
      return;
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);
      if (uploadError)
        throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await supabase.from("messages").insert([
        {
          sender_id: user.id,
          receiver_id: selectedProfile.id,
          content: file.type.startsWith('image/') ? 'Sent an image' : 'Sent a file',
          attachment_url: publicUrl,
          attachment_type: file.type.startsWith('image/') ? 'image' : 'file'
        },
      ]);
      if (dbError)
        throw dbError;
      toast.success("File sent!");
      refetchMessages();
    }
    catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Upload failed: ${error.message}`);
    }
    finally {
      setUploading(false);
      if (fileInputRef.current)
        fileInputRef.current.value = '';
    }
  };
  const startEdit = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
  };
  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };
  // Filter profiles based on search
  const filteredProfiles = profiles.filter((p) => (p.full_name || "").toLowerCase().includes(search.toLowerCase()));
  return (<>
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Messages</h2>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search people..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredProfiles.map((profile) => (<button key={profile.id} onClick={() => { setSelectedProfile(profile); setEditingMessage(null); setNewMessage(""); }} className={`w-full p-3 rounded-lg text-left transition-colors ${selectedProfile?.id === profile.id
              ? "bg-primary/10 border border-primary/20"
              : "hover:bg-muted/50"}`}>
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {(profile.full_name || "??").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground flex items-center gap-1">
                      {profile.full_name || "Unknown User"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{profile.job_title || "Team Member"}</p>
                </div>
              </div>
            </button>))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedProfile ? (<>
          {/* Chat Header */}
          <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/20 text-primary">
                  {(selectedProfile.full_name || "??").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{selectedProfile.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedProfile.job_title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost">
                <Video className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.length === 0 ? (<div className="text-center text-muted-foreground py-10">
                No messages yet. Start the conversation!
              </div>) : (messages.map((message) => {
                const isMe = message.sender_id === user?.id;
                return (<div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group relative`}>
                  {isMe && (<div className="absolute top-2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(message)}>
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>)}
                  <div className={`max-w-md px-4 py-2 rounded-2xl ${isMe
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"} relative`}>
                    <p className="text-sm">
                      {message.content}
                      {message.is_edited && <span className="text-[10px] opacity-70 ml-1">(edited)</span>}
                    </p>
                    {message.attachment_url && message.attachment_type === 'image' && (<img src={message.attachment_url} alt="Attachment" className="mt-2 rounded-lg max-w-xs max-h-48 object-cover border border-border" />)}
                    {message.attachment_url && message.attachment_type === 'file' && (<a href={message.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 mt-2 p-2 bg-background/50 rounded hover:bg-background/80 transition-colors">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-xs underline text-blue-500">View Attachment</span>
                    </a>)}
                    <p className={`text-[10px] mt-1 text-right ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>);
              }))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border bg-card">
            {editingMessage && (<div className="flex items-center justify-between bg-muted/50 p-2 mb-2 rounded text-xs text-muted-foreground">
              <span>Editing message...</span>
              <button onClick={cancelEdit} className="hover:text-foreground">Cancel</button>
            </div>)}
            <div className="flex items-center gap-2 max-w-3xl mx-auto">
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />
              <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} className="flex-1" />
              <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim() || uploading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>) : (<div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Video className="h-16 w-16 mb-4 opacity-20" />
          <p>Select a conversation to start chatting</p>
        </div>)}
      </div>
    </div>
  </>);
}
