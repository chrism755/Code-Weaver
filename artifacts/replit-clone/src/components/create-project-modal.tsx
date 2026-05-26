import { useState } from "react";
import { useCreateProject, getListProjectsQueryKey, getGetMeQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Smartphone, Gamepad2, Layers, PresentationIcon, BarChart2, Zap, FileText, Table2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const PROJECT_TYPES = [
  { id: "website", label: "Website", desc: "Web app or site", icon: Globe },
  { id: "mobile", label: "Mobile", desc: "iOS & Android", icon: Smartphone },
  { id: "game", label: "Game", desc: "2D, 3D, browser", icon: Gamepad2 },
  { id: "design", label: "Design", desc: "Interactive canvas", icon: Layers },
  { id: "slides", label: "Slides", desc: "Presentations", icon: PresentationIcon },
  { id: "data-viz", label: "Data Viz", desc: "Charts & dashboards", icon: BarChart2 },
  { id: "animation", label: "Animation", desc: "Motion & 3D", icon: Zap },
  { id: "document", label: "Document", desc: "Live documents", icon: FileText },
  { id: "spreadsheet", label: "Spreadsheet", desc: "Programmable sheets", icon: Table2 },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProjectModal({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const createProject = useCreateProject({
    mutation: {
      onSuccess: (project) => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        onOpenChange(false);
        resetState();
        setLocation(`/projects/${project.id}`);
      },
    },
  });

  function resetState() {
    setStep(1);
    setSelectedType(null);
    setName("");
    setDescription("");
    setIsPublic(false);
  }

  function handleSubmit() {
    if (!selectedType || !name.trim()) return;
    createProject.mutate({
      data: { name: name.trim(), description, type: selectedType, isPublic },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetState(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="hover:text-foreground text-muted-foreground transition-colors" data-testid="button-back">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {step === 1 ? "Choose a project type" : "Configure your project"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {PROJECT_TYPES.map(({ id, label, desc, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setSelectedType(id); setStep(2); }}
                data-testid={`type-option-${id}`}
                className={cn(
                  "flex flex-col items-start gap-2 p-3 rounded-lg border text-left transition-all hover:border-primary/60",
                  selectedType === id ? "border-primary bg-primary/5" : "border-border bg-card"
                )}
              >
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-semibold">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-name" className="text-xs font-medium">Project name</Label>
              <Input
                id="project-name"
                placeholder={`my-${selectedType}-project`}
                value={name}
                onChange={e => setName(e.target.value)}
                data-testid="input-project-name"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-desc" className="text-xs font-medium">Description <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                id="project-desc"
                placeholder="What does this project do?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                data-testid="input-project-description"
              />
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <Label className="text-xs font-medium">Make public</Label>
                <p className="text-xs text-muted-foreground">Visible in community</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} data-testid="switch-is-public" />
            </div>
            {selectedType && name.trim() && (
              <p className="text-xs text-muted-foreground">
                Subdomain: <span className="font-mono text-foreground">{name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.replit.work.gd</span>
              </p>
            )}
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!name.trim() || createProject.isPending}
              data-testid="button-create-submit"
            >
              {createProject.isPending ? "Creating..." : "Create Repl"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
