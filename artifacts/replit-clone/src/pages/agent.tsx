import { useState, useRef, useEffect } from "react";
import Layout from "@/components/layout";
import { useAgentChat, useListProjects, getListProjectsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "Build me a landing page with a hero and features section",
  "Create a REST API with authentication",
  "Add a dark mode toggle to my app",
  "Generate a dashboard with charts and stats",
];

export default function Agent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: projects } = useListProjects(undefined, { query: { queryKey: getListProjectsQueryKey() } });

  const agentChat = useAgentChat({
    mutation: {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
        setSuggestions(data.suggestions ?? []);
      },
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || !selectedProject) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setSuggestions([]);
    agentChat.mutate({
      data: {
        message: msg,
        projectId: selectedProject,
        history: messages.map(m => ({ role: m.role, content: m.content })),
      },
    });
  }

  return (
    <Layout>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold">AI Agent</h1>
            <p className="text-xs text-muted-foreground">Describe what you want to build</p>
          </div>
          <div className="ml-auto">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-52 h-8 text-xs" data-testid="select-project">
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                {(projects ?? []).map(p => (
                  <SelectItem key={p.id} value={p.id} data-testid={`project-option-${p.id}`}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-80 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">DevForge Agent</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Select a project and describe what you want to build. The AI will help you get started.
              </p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                {STARTER_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => { if (selectedProject) { setInput(prompt); } }}
                    className="text-left p-3 rounded-lg border border-border bg-card hover:border-primary/40 text-xs text-muted-foreground transition-colors"
                    data-testid={`starter-prompt-${prompt.slice(0, 20).replace(/\s/g, "-")}`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              {!selectedProject && (
                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Select a project above to get started
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")} data-testid={`message-${i}`}>
                  {msg.role === "assistant" && (
                    <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
                      <AvatarFallback className="bg-primary text-white text-xs">
                        <Bot className="w-3.5 h-3.5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    "max-w-lg rounded-xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  )}>
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
                      <AvatarFallback className="bg-secondary text-xs">
                        <User className="w-3.5 h-3.5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {agentChat.isPending && (
                <div className="flex gap-3">
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-white text-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-card border border-border rounded-xl px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </ScrollArea>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="px-6 py-2 flex items-center gap-2 flex-wrap border-t border-border">
            <span className="text-xs text-muted-foreground">Try:</span>
            {suggestions.map((s, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 text-xs"
                onClick={() => sendMessage(s)}
                data-testid={`suggestion-${i}`}
              >
                {s}
              </Badge>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Input
              placeholder={selectedProject ? "Describe what you want to build..." : "Select a project first..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              disabled={!selectedProject || agentChat.isPending}
              data-testid="input-agent-message"
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || !selectedProject || agentChat.isPending}
              data-testid="button-send-message"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
