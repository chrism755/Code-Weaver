import { useState } from "react";
import Layout from "@/components/layout";
import { useListPublicProjects, getListPublicProjectsQueryKey, useForkProject, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, GitFork, Heart, Globe, Users } from "lucide-react";
import ProjectTypeIcon from "@/components/project-type-icon";
import { formatDistanceToNow } from "date-fns";

const TYPE_FILTERS = [
  { id: undefined, label: "All" },
  { id: "website", label: "Website" },
  { id: "mobile", label: "Mobile" },
  { id: "game", label: "Game" },
  { id: "slides", label: "Slides" },
  { id: "data-viz", label: "Data Viz" },
];

export default function Community() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useListPublicProjects(
    { type: typeFilter, search: search || undefined },
    { query: { queryKey: getListPublicProjectsQueryKey({ type: typeFilter, search: search || undefined }) } }
  );

  const forkProject = useForkProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      },
    },
  });

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Community</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Explore and fork projects from the community</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-4 h-4" />
            {projects?.length ?? 0} projects
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search community projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="input-search-community"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {TYPE_FILTERS.map(({ id, label }) => (
              <Button
                key={label}
                size="sm"
                variant={typeFilter === id ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => setTypeFilter(id)}
                data-testid={`community-filter-${label.toLowerCase()}`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-44 rounded-lg" />)}
          </div>
        ) : (projects?.length ?? 0) === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No public projects yet</p>
            <p className="text-xs text-muted-foreground">Be the first to share your project with the community</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects!.map(project => (
              <div
                key={project.id}
                className="p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors group"
                data-testid={`community-card-${project.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                      <ProjectTypeIcon type={project.type} className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{project.name}</div>
                      <div className="text-xs text-muted-foreground">by @{project.username ?? "unknown"}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{project.type}</Badge>
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{project.forkCount}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{project.likeCount}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => forkProject.mutate({ id: project.id })}
                    data-testid={`fork-project-${project.id}`}
                  >
                    <GitFork className="w-3 h-3 mr-1.5" />
                    Fork
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
