import Layout from "@/components/layout";
import { useGetMe, getGetMeQueryKey, useUpdateMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Globe, Zap, Crown, Info } from "lucide-react";

interface ProfileForm {
  username: string;
  displayName: string;
  bio: string;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const { user: clerkUser } = useUser();
  const { data: user, isLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });

  const updateMe = useUpdateMe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
    },
  });

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<ProfileForm>({
    defaultValues: { username: "", displayName: "", bio: "" },
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username ?? "",
        displayName: user.displayName ?? "",
        bio: user.bio ?? "",
      });
    }
  }, [user, reset]);

  function onSubmit(data: ProfileForm) {
    updateMe.mutate({ data });
  }

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <Card className="mb-4">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={clerkUser?.imageUrl} />
                <AvatarFallback className="bg-primary text-white font-semibold">
                  {clerkUser?.firstName?.[0] ?? user?.username?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{user?.displayName || user?.username}</CardTitle>
                <CardDescription className="text-xs">{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium" htmlFor="username">Username</Label>
                  <Input id="username" {...register("username")} data-testid="input-username" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium" htmlFor="displayName">Display name</Label>
                  <Input id="displayName" {...register("displayName")} data-testid="input-display-name" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={2} placeholder="Tell the community about yourself..." {...register("bio")} data-testid="input-bio" />
              </div>
              <Button type="submit" disabled={!isDirty || updateMe.isPending} data-testid="button-save-profile">
                {updateMe.isPending ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Current plan</div>
                  <div className="text-xs text-muted-foreground">
                    {user?.plan === "pro" ? "DevForge Pro" : "Free tier"}
                  </div>
                </div>
              </div>
              <Badge variant={user?.plan === "pro" ? "default" : "secondary"} className="capitalize">
                {user?.plan ?? "free"}
              </Badge>
            </div>
            {user?.plan !== "pro" && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2 mb-4">
                  {["Unlimited projects", "Custom domains", "Priority support", "Advanced AI agent"].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Zap className="w-3 h-3 text-primary" />
                      {f}
                    </div>
                  ))}
                </div>
                <Button size="sm" data-testid="button-upgrade">
                  <Crown className="w-3.5 h-3.5 mr-1.5" />
                  Upgrade to Pro
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Subdomains */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold">Subdomains</div>
                <div className="text-xs text-muted-foreground">Each project gets a free subdomain</div>
              </div>
            </div>
            <div className="p-3 rounded-md bg-muted/50 border border-border">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  Your projects are available at <span className="font-mono text-foreground">projectname.replit.work.gd</span>.
                  To use a custom domain, point a CNAME record at <span className="font-mono text-foreground">cname.replit.work.gd</span> and configure it in your project settings.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
