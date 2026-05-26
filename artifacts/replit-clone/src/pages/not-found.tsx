import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
      <div>
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-6xl font-black mb-3 text-muted-foreground">404</h1>
        <h2 className="text-xl font-bold mb-2">Page not found</h2>
        <p className="text-sm text-muted-foreground mb-6">This page doesn't exist or was moved.</p>
        <div className="flex items-center gap-3 justify-center">
          <Button onClick={() => setLocation("/")} data-testid="button-go-home">Go home</Button>
          <Button variant="outline" onClick={() => history.back()} data-testid="button-go-back">Go back</Button>
        </div>
      </div>
    </div>
  );
}
