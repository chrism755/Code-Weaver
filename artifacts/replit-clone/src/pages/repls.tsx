import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { useListProjects, getListProjectsQueryKey, useDeleteProject } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, GitFork, Heart, Clock, Trash2, Edit, Globe } from "lucide-react";
import ProjectTypeIcon from "@/components/project-type-icon";
import CreateProjectModal from "@/components/create-project-modal";
import { formatDistanceToNow } from "date-fns";

const FILTER_TYPES = [
  { id: undefined, label: "All" },
  { id: "website", label: "Website" },
  { id: "mobile", label: "Mobile" },
  { id: "game", label: "Game" },
  { id: "design", label: "Design" },
  { id: "slides", label: "Slides" },
  { id: "data-viz", label: "Data Viz" },
  { id: "animation", label: "Animation" },
  { id: "document", label: "Document" },
];

export default function Repls() {
  const [, setLocation] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useListProjects(
    { type: typeFilter, search: search || undefined },
    { query: { queryKey: getListProjectsQueryKey({ type: typeFilter, search: search || undefined }) } }
  );

  const deleteProject = useDeleteProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      },
    },
  });

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Repls</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{projects?.length ?? 0} projects</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} data-testid="button-create-repl">
            <Plus className="w-4 h-4 mr-2" />
            New Repl
          </Button>
        </div>

        {/* Search + filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search repls..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="input-search-repls"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_TYPES.map(({ id, label }) => (
              <Button
                key={label}
                size="sm"
                variant={typeFilter === id ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => setTypeFilter(id)}
                data-testid={`filter-${label.toLowerCase()}`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Projects grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)}
          </div>
        ) : (projects?.length ?? 0) === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <ProjectTypeIcon type="website" className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No projects found</p>
            <p className="text-xs text-muted-foreground mb-4">Create your first Repl to get started</p>
            <Button size="sm" onClick={() => setCreateOpen(true)} data-testid="button-empty-create">
              <Plus className="w-4 h-4 mr-2" /> Create Repl
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects!.map(project => (
              <div
                key={project.id}
                className="relative p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors cursor-pointer group"
                onClick={() => setLocation(`/projects/${project.id}`)}
                data-testid={`repl-card-${project.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                      <ProjectTypeIcon type={project.type} className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold leading-tight">{project.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{project.type}</div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100" data-testid={`repl-menu-${project.id}`}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); setLocation(`/projects/${project.id}`); }}>
                        <Edit className="w-4 h-4 mr-2" /> Open
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={e => { e.stopPropagation(); deleteProject.mutate({ id: project.id }); }}
                        data-testid={`delete-project-${project.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {project.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {project.isPublic && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        <Globe className="w-2.5 h-2.5 mr-1" /> Public
                      </Badge>
                    )}
                    {project.language && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0">{project.language}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{project.forkCount}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <CreateProjectModal open={createOpen} onOpenChange={setCreateOpen} />
    </Layout>
  );
}
