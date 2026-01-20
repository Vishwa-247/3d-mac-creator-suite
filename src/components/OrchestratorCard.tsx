/**
 * OrchestratorCard Component
 * Displays the "Recommended Next Step" from the Orchestrator v0.
 * Fetches the next module on mount and shows a CTA to navigate.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getNextModule } from "@/lib/api";
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
  color: string;
}> = {
  production_interview: { 
    route: "/mock-interview", 
    icon: Video,
    label: "Mock Interview",
    color: "text-purple-500"
  },
  interactive_course: { 
    route: "/course-generator", 
    icon: BookOpen,
    label: "Interactive Course",
    color: "text-blue-500"
  },
  dsa_practice: { 
    route: "/dsa-sheet", 
    icon: Code,
    label: "DSA Practice",
    color: "text-green-500"
  },
  resume_builder: { 
    route: "/resume-analyzer", 
    icon: FileText,
    label: "Resume Builder",
    color: "text-orange-500"
  },
  project_studio: { 
    route: "/course-generator", 
    icon: Briefcase,
    label: "Project Studio",
    color: "text-pink-500"
  },
  // Fallback
  default: { 
    route: "/dashboard", 
    icon: Bot,
    label: "Continue Learning",
    color: "text-primary"
  },
};

export default function OrchestratorCard({ userId }: OrchestratorCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<{
    next_module: string;
    reason: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    async function fetchRecommendation() {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getNextModule(userId);
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
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
      
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">AI Recommended Next Step</CardTitle>
              <Sparkles className="h-4 w-4 text-amber-500" />
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
              <div className={`p-3 rounded-lg bg-background shadow-sm ${moduleConfig.color}`}>
                <ModuleIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {moduleConfig.label}
                </p>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
