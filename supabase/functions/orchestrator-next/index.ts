import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const isAllowed =
    origin === "https://lovable.app" ||
    origin.endsWith(".lovable.app") ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:");

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "https://lovable.app",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  };
};

type NextResponse = {
  next_module: string;
  depth: number;
  reason: string;
  description?: string;
};

function safeNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function normalizeOverallScore(raw: unknown): number | null {
  const n = safeNumber(raw);
  if (n === null) return null;
  // Support either 0-1 or 0-100 storage.
  if (n <= 1) return n * 100;
  return n;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const authHeader = req.headers.get("Authorization") || "";
    const sb = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userErr,
    } = await sb.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Onboarding complete?
    const { data: onboarding } = await sb
      .from("user_onboarding")
      .select("completed_at")
      .eq("user_id", user.id)
      .maybeSingle();

    const onboardingCompleted = !!onboarding?.completed_at;

    // Latest interview metrics (journey or legacy) – deterministic input.
    const { data: metricsRows } = await sb
      .from("interview_metrics")
      .select("overall_score, created_at, session_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const latestMetrics = metricsRows?.[0];
    const latestOverall = normalizeOverallScore(latestMetrics?.overall_score);

    let decision: NextResponse;
    const inputSnapshot = {
      onboarding_completed: onboardingCompleted,
      latest_interview_overall_score: latestOverall,
      latest_interview_session_id: latestMetrics?.session_id ?? null,
    };

    if (!onboardingCompleted) {
      decision = {
        next_module: "onboarding",
        depth: 1,
        reason: "Onboarding is incomplete; complete it so the system can personalize your plan.",
        description: "Answer a few questions so StudyMate can route you intelligently.",
      };
    } else if (latestOverall === null) {
      decision = {
        next_module: "interview_journey",
        depth: 1,
        reason: "No baseline interview metrics yet; run Interview Journey to measure production-thinking patterns.",
        description: "Start a deterministic interview journey that scores real engineering thinking.",
      };
    } else if (latestOverall < 60) {
      decision = {
        next_module: "interview_journey",
        depth: 2,
        reason: "Interview score is below target; repeat Interview Journey with deeper prompts to improve weak areas.",
        description: "Go one level deeper (tradeoffs, failure modes, scalability) and improve your score.",
      };
    } else {
      decision = {
        next_module: "production_interview",
        depth: 1,
        reason: "Baseline metrics look strong; continue with regular mock interviews to maintain momentum.",
        description: "Practice more realistic questions and keep your streak going.",
      };
    }

    // Persist decision log (append-only)
    await sb.from("orchestrator_decisions").insert({
      user_id: user.id,
      input_snapshot: inputSnapshot,
      next_module: decision.next_module,
      depth: decision.depth,
      reason: decision.reason,
    });

    // Update user_state (best effort)
    await sb.from("user_state").upsert(
      {
        user_id: user.id,
        onboarding_completed: onboardingCompleted,
        last_module: decision.next_module,
        last_seen_at: new Date().toISOString(),
        last_interview_session_id: latestMetrics?.session_id ?? null,
        last_interview_overall_score: latestOverall,
      },
      { onConflict: "user_id" }
    );

    return new Response(JSON.stringify(decision), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("orchestrator-next error", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
