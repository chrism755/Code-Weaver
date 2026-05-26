import Layout from "@/components/layout";
import { useGetProject, getGetProjectQueryKey, useUpdateProject, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, GitFork, Heart, Globe, Lock, Copy, ExternalLink, Clock } from "lucide-react";
import ProjectTypeIcon from "@/components/project-type-icon";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);

  const { data: project, isLoading } = useGetProject(params.id, {
    query: { enabled: !!params.id, queryKey: getGetProjectQueryKey(params.id) },
  });

  const updateProject = useUpdateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(params.id) });
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        setEditing(false);
      },
    },
  });

  const [editName, setEditName] = useState("");
  const [editPublic, setEditPublic] = useState(false);

  function startEdit() {
    setEditName(project?.name ?? "");
    setEditPublic(project?.isPublic ?? false);
    setEditing(true);
  }

  function saveEdit() {
    updateProject.mutate({ id: params.id, data: { name: editName, isPublic: editPublic } });
  }

  function copySubdomain() {
    if (project?.subdomain) {
      navigator.clipboard.writeText(`${project.subdomain}.replit.work.gd`);
      toast({ title: "Copied to clipboard" });
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 max-w-3xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Project not found</p>
          <Button className="mt-4" onClick={() => setLocation("/repls")} data-testid="button-back-repls">
            Back to Repls
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Back */}
        <button
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          onClick={() => setLocation("/repls")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Repls
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ProjectTypeIcon type={project.type} className="w-6 h-6 text-primary" />
            </div>
            <div>
              {editing ? (
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="h-8 text-lg font-bold"
                  data-testid="input-edit-name"
                />
              ) : (
                <h1 className="text-xl font-bold" data-testid="project-name">{project.name}</h1>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs capitalize">{project.type}</Badge>
                {project.language && <Badge variant="outline" className="text-xs">{project.language}</Badge>}
                {project.isPublic
                  ? <Badge variant="outline" className="text-xs"><Globe className="w-2.5 h-2.5 mr-1" />Public</Badge>
                  : <Badge variant="outline" className="text-xs"><Lock className="w-2.5 h-2.5 mr-1" />Private</Badge>
                }
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)} data-testid="button-cancel-edit">Cancel</Button>
                <Button size="sm" onClick={saveEdit} disabled={updateProject.isPending} data-testid="button-save-edit">
                  {updateProject.isPending ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={startEdit} data-testid="button-edit-project">Edit</Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Forks", value: project.forkCount, icon: GitFork },
            { label: "Likes", value: project.likeCount, icon: Heart },
            { label: "Updated", value: formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }), icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-sm font-semibold">{value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subdomain */}
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Deployment URL</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-muted/50 border border-border rounded-md px-3 py-2 text-foreground">
                {project.subdomain}.replit.work.gd
              </code>
              <Button size="sm" variant="outline" className="h-8" onClick={copySubdomain} data-testid="button-copy-subdomain">
                <Copy className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="outline" className="h-8" data-testid="button-open-project">
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visibility toggle in edit mode */}
        {editing && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Make public</Label>
                  <p className="text-xs text-muted-foreground">Visible in community</p>
                </div>
                <Switch checked={editPublic} onCheckedChange={setEditPublic} data-testid="switch-edit-public" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {project.description && (
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold mb-2">Description</h2>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
