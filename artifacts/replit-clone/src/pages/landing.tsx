import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, Smartphone, Gamepad2, Layers, PresentationIcon, BarChart2, FileText, Table2, Zap, Globe, Users, ArrowRight } from "lucide-react";

const PROJECT_TYPES = [
  { icon: Globe, label: "Websites", desc: "Deploy full-stack web apps" },
  { icon: Smartphone, label: "Mobile", desc: "Cross-platform with Expo" },
  { icon: Gamepad2, label: "Games", desc: "2D, 3D, and browser games" },
  { icon: Layers, label: "Design", desc: "Interactive design canvases" },
  { icon: PresentationIcon, label: "Slides", desc: "Beautiful presentations" },
  { icon: BarChart2, label: "Data Viz", desc: "Interactive dashboards" },
  { icon: Code2, label: "Animation", desc: "Motion graphics and 3D" },
  { icon: FileText, label: "Documents", desc: "Live coding documents" },
  { icon: Table2, label: "Spreadsheets", desc: "Programmable spreadsheets" },
];

const FEATURES = [
  { title: "Zero Setup", desc: "Start coding in seconds. No installs, no config, no friction." },
  { title: "AI Agent", desc: "Describe what you want to build and watch it come to life." },
  { title: "Free Subdomains", desc: "Every project gets a free subdomain on replit.work.gd." },
  { title: "Fork Anything", desc: "See something you like? Fork it and make it yours." },
  { title: "Any Language", desc: "Python, Node, TypeScript, Go, Rust — all supported." },
  { title: "Custom Domains", desc: "Point your own domain to any project you deploy." },
];

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-foreground tracking-tight">DevForge</span>
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/sign-in")} data-testid="button-login">
            Log in
          </Button>
          <Button size="sm" onClick={() => setLocation("/sign-up")} data-testid="button-signup">
            Get started free
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <Badge variant="secondary" className="mb-6 text-xs font-medium px-3 py-1">
          Now with AI Agent
        </Badge>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 max-w-4xl leading-none">
          Build anything.
          <br />
          <span className="text-primary">Ship everywhere.</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl leading-relaxed">
          DevForge is the cloud workspace for developers. Create websites, mobile apps, games, data visualizations, and more — without touching your local machine.
        </p>
        <div className="flex items-center gap-3">
          <Button size="lg" className="h-12 px-8 text-base font-semibold" onClick={() => setLocation("/sign-up")} data-testid="button-cta-primary">
            Start building for free
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base" onClick={() => setLocation("/community")} data-testid="button-cta-community">
            Browse community
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No credit card required</p>
      </section>

      {/* Project types grid */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-3">Build anything you can imagine</h2>
        <p className="text-muted-foreground text-center mb-10 text-sm">Every project type supported out of the box</p>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
          {PROJECT_TYPES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group" data-testid={`type-card-${label.toLowerCase()}`}>
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-card/50 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">Everything you need</h2>
          <p className="text-muted-foreground text-center mb-10 text-sm">Powerful tools designed for modern development</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ title, desc }) => (
              <div key={title} className="p-5 rounded-lg border border-border bg-card">
                <h3 className="font-semibold text-sm mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: "100K+", label: "Projects built" },
            { value: "50K+", label: "Developers" },
            { value: "99.9%", label: "Uptime" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-primary">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to build?</h2>
          <p className="text-muted-foreground mb-8 text-sm">Join thousands of developers shipping faster with DevForge.</p>
          <Button size="lg" className="h-12 px-10 text-base font-semibold" onClick={() => setLocation("/sign-up")} data-testid="button-footer-cta">
            Create free account
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span>DevForge</span>
          </div>
          <span>replit.work.gd • Free subdomains for every project</span>
        </div>
      </footer>
    </div>
  );
}
