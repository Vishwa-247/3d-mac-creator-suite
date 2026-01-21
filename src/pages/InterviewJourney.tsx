import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Turn = {
  role: "assistant" | "user";
  content: string;
  state?: string;
};

type JourneyMetrics = {
  overall_score: number;
  clarification_habit: number;
  structure: number;
  tradeoff_awareness: number;
  scalability_thinking: number;
  failure_awareness: number;
  adaptability: number;
};

const STATES = [
  "AWAITING_CLARIFICATION",
  "CORE_ANSWER",
  "FOLLOW_UP",
  "CURVEBALL",
  "REFLECTION",
  "COMPLETE",
] as const;

export default function InterviewJourney() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<JourneyMetrics | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canSend = !!message.trim() && !loading && state !== "COMPLETE";

  const currentIndex = useMemo(() => {
    if (!state) return 0;
    const idx = STATES.indexOf(state as any);
    return Math.max(0, idx);
  }, [state]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns.length]);

  useEffect(() => {
    // Demo-safe: auto-resume last session.
    const saved = localStorage.getItem("studymate_journey_session_id");
    if (saved) setSessionId(saved);
  }, []);

  const start = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("interview-journey-start", {
        body: {
          job_role: "Software Engineer",
          tech_stack: "React, Supabase",
          experience_level: "intermediate",
          mode: "production_thinking",
        },
      });
      if (error) throw error;

      setSessionId(data.session_id);
      localStorage.setItem("studymate_journey_session_id", data.session_id);
      setState(data.state);
      setTurns([{ role: "assistant", content: data.prompt, state: data.state }]);
      setMetrics(null);
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Couldn't start Interview Journey",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    if (!user || !sessionId || !canSend) return;
    const outgoing = message.trim();
    setMessage("");
    setTurns((t) => [...t, { role: "user", content: outgoing, state: state || undefined }]);

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("interview-journey-step", {
        body: { session_id: sessionId, message: outgoing },
      });
      if (error) throw error;

      setState(data.state);
      setTurns((t) => [...t, { role: "assistant", content: data.prompt, state: data.state }]);
      if (data.metrics) setMetrics(data.metrics);
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Message failed",
        description: e?.message || "Please retry.",
        variant: "destructive",
      });
      setMessage(outgoing);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    localStorage.removeItem("studymate_journey_session_id");
    setSessionId(null);
    setState(null);
    setTurns([]);
    setMessage("");
    setMetrics(null);
  };

  return (
    <Container>
      <header className="py-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Interview Journey</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deterministic, production-thinking interview flow with auditable turns + metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
        <section className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">State</CardTitle>
              <CardDescription>Where you are in the journey.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {STATES.map((s, idx) => (
                <div
                  key={s}
                  className={
                    "flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm " +
                    (idx === currentIndex ? "bg-muted/40" : "bg-background")
                  }
                >
                  <span className="text-foreground">{s.replace(/_/g, " ")}</span>
                  <span className="text-muted-foreground">{idx + 1}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session</CardTitle>
              <CardDescription>Start and run end-to-end.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">
                Session ID: <span className="text-foreground/80">{sessionId || "—"}</span>
              </div>
              <Button className="w-full" onClick={start} disabled={loading}>
                {loading && !sessionId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Start baseline journey
              </Button>
            </CardContent>
          </Card>

          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metrics</CardTitle>
                <CardDescription>Snapshot after completion.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Overall</span>
                  <span className="font-medium">{metrics.overall_score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Clarification</span>
                  <span className="font-medium">{metrics.clarification_habit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Structure</span>
                  <span className="font-medium">{metrics.structure}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tradeoffs</span>
                  <span className="font-medium">{metrics.tradeoff_awareness}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Scalability</span>
                  <span className="font-medium">{metrics.scalability_thinking}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Failures</span>
                  <span className="font-medium">{metrics.failure_awareness}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Adaptability</span>
                  <span className="font-medium">{metrics.adaptability}</span>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}
                >
                  Back to dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        <main className="lg:col-span-9 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transcript</CardTitle>
              <CardDescription>
                Each turn is stored in <code className="text-foreground/80">interview_turns</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {turns.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                  Click “Start baseline journey” to begin.
                </div>
              ) : (
                <div className="space-y-3 max-h-[55vh] overflow-auto pr-2">
                  {turns.map((t, idx) => (
                    <div
                      key={idx}
                      className={
                        "rounded-lg border border-border/60 p-3 " +
                        (t.role === "assistant" ? "bg-muted/20" : "bg-background")
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {t.role}
                        </p>
                        {t.state ? (
                          <p className="text-xs text-muted-foreground">{t.state.replace(/_/g, " ")}</p>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">{t.content}</p>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your response</CardTitle>
              <CardDescription>Enter to send, Shift+Enter for new line.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={state === "COMPLETE" ? "Session complete" : "Type your answer..."}
                disabled={!sessionId || loading || state === "COMPLETE"}
                rows={4}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {state ? `Current: ${state.replace(/_/g, " ")}` : "Not started"}
                </p>
                <Button onClick={send} disabled={!canSend} className="min-w-28">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </Container>
  );
}
