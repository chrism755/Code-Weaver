import { useGetMe, getGetMeQueryKey, useGetDashboardStats, getGetDashboardStatsQueryKey, useGetRecentActivity, getGetRecentActivityQueryKey, useListProjects, getListProjectsQueryKey, useCreateProject } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Code2, FolderGit2, GitFork, Activity, ArrowRight, Clock } from "lucide-react";
import CreateProjectModal from "@/components/create-project-modal";
import ProjectTypeIcon from "@/components/project-type-icon";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const { data: user, isLoading: userLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });
  const { data: projects, isLoading: projectsLoading } = useListProjects(undefined, { query: { queryKey: getListProjectsQueryKey() } });

  const pinnedProjects = projects?.filter(p => p.isPinned) ?? [];
  const recentProjects = projects?.slice(0, 4) ?? [];

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {userLoading ? (
              <Skeleton className="h-8 w-48 mb-1" />
            ) : (
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.displayName || user?.username || "Developer"}
              </h1>
            )}
            <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening with your projects</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} data-testid="button-create-project">
            <Plus className="w-4 h-4 mr-2" />
            New Repl
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Projects", value: stats?.totalProjects, icon: Code2, loading: statsLoading },
            { label: "Public Projects", value: stats?.publicProjects, icon: FolderGit2, loading: statsLoading },
            { label: "Total Forks", value: stats?.totalForks, icon: GitFork, loading: statsLoading },
            { label: "Recent Activity", value: stats?.recentActivity, icon: Activity, loading: statsLoading },
          ].map(({ label, value, icon: Icon, loading }) => (
            <Card key={label} data-testid={`stat-card-${label.toLowerCase().replace(/ /g, "-")}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{value ?? 0}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Recent Projects */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Projects</h2>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setLocation("/repls")} data-testid="link-view-all-repls">
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-2">
              {projectsLoading
                ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
                : recentProjects.length === 0
                ? (
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <Code2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No projects yet</p>
                      <Button size="sm" className="mt-3" onClick={() => setCreateOpen(true)} data-testid="button-create-first-project">
                        Create your first Repl
                      </Button>
                    </CardContent>
                  </Card>
                )
                : recentProjects.map(project => (
                  <div
                    key={project.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/40 cursor-pointer transition-colors group"
                    onClick={() => setLocation(`/projects/${project.id}`)}
                    data-testid={`project-card-${project.id}`}
                  >
                    <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ProjectTypeIcon type={project.type} className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{project.name}</span>
                        {project.isPublic && <Badge variant="secondary" className="text-xs px-1.5 py-0">Public</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">{project.type} {project.language ? `• ${project.language}` : ""}</div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Activity feed */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Activity</h2>
            <div className="space-y-2">
              {activityLoading
                ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
                : (activity?.length ?? 0) === 0
                ? (
                  <div className="text-xs text-muted-foreground text-center py-6">No recent activity</div>
                )
                : activity!.map(item => (
                  <div key={item.id} className="p-2.5 rounded-md border border-border bg-card" data-testid={`activity-${item.id}`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 capitalize">{item.type}</Badge>
                      <span className="text-xs text-muted-foreground truncate">{item.projectName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      <CreateProjectModal open={createOpen} onOpenChange={setCreateOpen} />
    </Layout>
  );
}
