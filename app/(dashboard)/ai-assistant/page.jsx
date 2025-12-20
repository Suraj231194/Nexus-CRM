"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Lightbulb, TrendingUp, Users, FileText, BarChart3, RefreshCw, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { toast } from "sonner";
const suggestedPrompts = [
  { icon: TrendingUp, text: "Analyze my pipeline health", category: "Analytics" },
  { icon: Users, text: "Find leads that need follow-up", category: "Leads" },
  { icon: FileText, text: "Draft a proposal for a new client", category: "Documents" },
  { icon: BarChart3, text: "Summarize this month's performance", category: "Reports" },
];
export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI sales assistant. I have access to your CRM data and can help you analyze trends, draft emails, or find leads.\n\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [contextData, setContextData] = useState("");
  const scrollAreaRef = useRef(null);
  // Fetch context data on mount
  useEffect(() => {
    const fetchData = async () => {
      const { data: deals } = await supabase.from("deals").select("*");
      const { data: leads } = await supabase.from("leads").select("*");
      const summary = `
      Current Date: ${new Date().toLocaleDateString()}
      
      CRM DATA CONTEXT:
      - Total Deals: ${deals?.length || 0}
      - Won Deals: ${deals?.filter(d => d.stage === 'won').length || 0}
      - Open Deals: ${deals?.filter(d => d.stage !== 'won' && d.stage !== 'lost').length || 0}
      - Total Pipeline Value: $${deals?.reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString()}
      
      RECENT DEALS:
      ${deals?.slice(0, 5).map(d => `- ${d.name} ($${d.value}, ${d.stage})`).join('\n')}
      
      RECENT LEADS:
      ${leads?.slice(0, 5).map(l => `- ${l.first_name} ${l.last_name} (${l.company})`).join('\n')}
      `;
      setContextData(summary);
    };
    fetchData();
  }, []);
  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);
  const handleSend = async () => {
    if (!input.trim())
      return;
    const apiKey = localStorage.getItem("gemini_api_key") || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      toast.error("Please configure your Gemini API Key in Settings > AI");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I need a Google Gemini API Key to function. Please go to **Settings > AI** to configure it."
      }]);
      return;
    }
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    try {
      // Dynamic model discovery
      let modelName = "gemini-1.5-flash";
      try {
        const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
        const modelsData = await modelsResponse.json();
        if (modelsData.models) {
          const validModel = modelsData.models.find((m) => m.supportedGenerationMethods?.includes("generateContent") &&
            (m.name.includes("flash") || m.name.includes("pro")));
          if (validModel) {
            modelName = validModel.name.replace("models/", "");
            console.log("Selected model:", modelName);
          }
        }
      }
      catch (e) {
        console.warn("Failed to list models, using default", e);
      }
      // Use v1beta as it supports more models and is generally more stable for new models
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{
                text: `
              System Instruction: You are a helpful AI Sales Assistant for a CRM called RevenueOS. 
              You have access to the following real-time data from the user's dashboard:
              ${contextData}
              
              Answer the user's question based on this data if relevant. Be concise, professional, and helpful.
              If the user asks to draft an email or proposal, do so.
              
              User Question: ${input}
              `
              }]
            }
          ]
        })
      });
      const data = await response.json();
      if (data.error) {
        console.error("Gemini API Error:", data.error);
        throw new Error(data.error.message || "Failed to generate response");
      }
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
    }
    catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `I encountered an error: ${error.message}. Please check your API Key in Settings.`
      }]);
    }
    finally {
      setIsTyping(false);
    }
  };
  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };
  return (<>
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">AI Sales Assistant</p>
              <p className="text-sm text-muted-foreground">Powered by Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setMessages([])}>
              <RefreshCw className="h-4 w-4" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message, index) => (<div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (<div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center mr-3 mt-1 shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>)}
              <div className={`max-w-2xl px-4 py-3 rounded-2xl ${message.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card border border-border rounded-bl-md"}`}>
                <div className={`text-sm whitespace-pre-wrap ${message.role === "user" ? "" : "text-foreground"}`} dangerouslySetInnerHTML={{
                  __html: message.content
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\n/g, "<br />"),
                }} />
              </div>
            </div>))}
            {isTyping && (<div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.1s]" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>)}
          </div>
        </ScrollArea>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (<div className="px-6 pb-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-chart-3" />
              <span className="text-sm text-muted-foreground">Suggested prompts</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt, index) => (<button key={index} onClick={() => handlePromptClick(prompt.text)} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-left">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <prompt.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{prompt.text}</p>
                  <p className="text-xs text-muted-foreground">{prompt.category}</p>
                </div>
              </button>))}
            </div>
          </div>
        </div>)}

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <Input placeholder="Ask me anything about your sales data..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} className="flex-1" />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2 max-w-3xl mx-auto">
            AI can analyze your CRM data, generate reports, and provide actionable insights.
          </p>
        </div>
      </div>
    </div>
  </>);
}
