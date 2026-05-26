import { useState } from "react";
import Layout from "@/components/layout";
import { useListTemplates, getListTemplatesQueryKey, useCreateProject, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutTemplate, TrendingUp } from "lucide-react";
import ProjectTypeIcon from "@/components/project-type-icon";

const CATEGORIES = [
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

export default function Templates() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useListTemplates(
    { category },
    { query: { queryKey: getListTemplatesQueryKey({ category }) } }
  );

  const createProject = useCreateProject({
    mutation: {
      onSuccess: (project) => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        setLocation(`/projects/${project.id}`);
      },
    },
  });

  function useTemplate(template: { name: string; type: string; language?: string | null }) {
    createProject.mutate({
      data: {
        name: `${template.name} copy`,
        type: template.type,
        language: template.language ?? undefined,
        isPublic: false,
      },
    });
  }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Templates</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Start fast with a pre-configured template</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <LayoutTemplate className="w-4 h-4" />
            {templates?.length ?? 0} templates
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 flex-wrap mb-6">
          {CATEGORIES.map(({ id, label }) => (
            <Button
              key={label}
              size="sm"
              variant={category === id ? "default" : "outline"}
              className="h-8 text-xs"
              onClick={() => setCategory(id)}
              data-testid={`template-filter-${label.toLowerCase()}`}
            >
              {label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(templates ?? []).map(template => (
              <div
                key={template.id}
                className="group p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
                data-testid={`template-card-${template.id}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ProjectTypeIcon type={template.type} className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{template.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 capitalize">{template.category}</Badge>
                      {template.language && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">{template.language}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span>{template.popularity} uses</span>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => useTemplate(template)}
                    disabled={createProject.isPending}
                    data-testid={`use-template-${template.id}`}
                  >
                    Use template
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
