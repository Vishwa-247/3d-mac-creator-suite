/**
 * OrchestratorCard Component
 * Displays the "Recommended Next Step" from the Orchestrator v0.
 * Fetches the next module on mount and shows a CTA to navigate.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowRight, 
  Bot, 
  Loader2, 
  Video, 
  BookOpen, 
  Code, 
  FileText, 
  Briefcase,
  AlertCircle,
  Sparkles
} from "lucide-react";

interface OrchestratorCardProps {
  userId: string;
}

// Map orchestrator modules to frontend routes and icons
const MODULE_CONFIG: Record<string, { 
  route: string; 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}> = {
  production_interview: { 
    route: "/mock-interview", 
    icon: Video,
    label: "Mock Interview",
  },
  interview_journey: {
    route: "/interview-journey",
    icon: Video,
    label: "Interview Journey",
  },
  onboarding: {
    route: "/onboarding",
    icon: Bot,
    label: "Onboarding",
  },
  interactive_course: { 
    route: "/course-generator", 
    icon: BookOpen,
    label: "Interactive Course",
  },
  dsa_practice: { 
    route: "/dsa-sheet", 
    icon: Code,
    label: "DSA Practice",
  },
  resume_builder: { 
    route: "/resume-analyzer", 
    icon: FileText,
    label: "Resume Builder",
  },
  project_studio: { 
    route: "/course-generator", 
    icon: Briefcase,
    label: "Project Studio",
  },
  // Fallback
  default: { 
    route: "/dashboard", 
    icon: Bot,
    label: "Continue Learning",
  },
};

export default function OrchestratorCard({ userId }: OrchestratorCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<{
    next_module: string;
    reason: string;
    description?: string;
    depth?: number;
  } | null>(null);

  const [decisionLog, setDecisionLog] = useState<any[]>([]);
  const [logLoading, setLogLoading] = useState(false);

  useEffect(() => {
    async function fetchRecommendation() {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.functions.invoke("orchestrator-next", {
          body: { user_id: userId },
        });
        if (error) throw error;
        setRecommendation(data);
      } catch (err: any) {
        console.error("Failed to fetch orchestrator recommendation:", err);
        setError("Couldn't fetch your next step. Try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendation();
  }, [userId]);

  const moduleConfig = recommendation 
    ? (MODULE_CONFIG[recommendation.next_module] || MODULE_CONFIG.default)
    : MODULE_CONFIG.default;

  const ModuleIcon = moduleConfig.icon;

  const depthLabel = useMemo(() => {
    const d = recommendation?.depth ?? 1;
    return d > 1 ? `Depth ${d}` : "Baseline";
  }, [recommendation?.depth]);

  const loadDecisionLog = async () => {
    if (!userId) return;
    setLogLoading(true);
    try {
      const { data, error } = await supabase
        .from("orchestrator_decisions")
        .select("id, next_module, depth, reason, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      setDecisionLog(data || []);
    } catch (e) {
      console.error("Failed to load decision log:", e);
      setDecisionLog([]);
    } finally {
      setLogLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <Loader2 className="h-10 w-10 text-primary animate-spin relative z-10" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground font-medium">
            AI Orchestrator analyzing your progress...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-destructive mb-3" />
          <p className="text-sm text-destructive">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-2 border-primary/20 shadow-lg relative">
      
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">AI Recommended Next Step</CardTitle>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <CardDescription className="text-xs">
              Personalized by your Orchestrator
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {recommendation && (
          <>
            {/* Module Badge */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
              <div className="p-3 rounded-lg bg-background shadow-sm text-primary">
                <ModuleIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground">
                  {moduleConfig.label}
                </p>
                  <span className="text-xs text-muted-foreground">{depthLabel}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {recommendation.description || recommendation.reason}
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 border-l-4 border-primary/50">
              <span className="font-medium text-foreground">Why this?</span>{" "}
              {recommendation.reason}
            </div>

            {/* CTA Button */}
            <Button asChild className="w-full gap-2 font-medium" size="lg">
              <Link to={moduleConfig.route}>
                Start {moduleConfig.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full" onClick={loadDecisionLog}>
                  View decision log
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Orchestrator decision log</DialogTitle>
                  <DialogDescription>
                    Audit trail of recent routing decisions for this user.
                  </DialogDescription>
                </DialogHeader>

                {logLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : decisionLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No decisions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {decisionLog.map((d) => (
                      <div key={d.id} className="rounded-lg border border-border/60 p-3 bg-muted/20">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">
                            {MODULE_CONFIG[d.next_module]?.label || d.next_module}
                          </p>
                          <p className="text-xs text-muted-foreground">Depth {d.depth}</p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{d.reason}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(d.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}
