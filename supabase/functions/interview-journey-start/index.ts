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

type StartBody = {
  job_role: string;
  tech_stack: string;
  experience_level: string;
  mode?: string;
};

type Scenario = { id: string; title: string; prompt: string };

const SCENARIOS: Scenario[] = [
  {
    id: "cache_invalidation",
    title: "Cache invalidation incident",
    prompt:
      "You're on-call. A new release caused stale data for 10% of users. Before proposing a fix, what clarifying questions do you ask about the system and symptoms?",
  },
  {
    id: "payment_webhook",
    title: "Webhook reliability",
    prompt:
      "Your payment provider webhooks are sometimes duplicated or delayed. Before designing, what clarifying questions do you ask to understand constraints and failure modes?",
  },
  {
    id: "search_scale",
    title: "Search scaling",
    prompt:
      "Your search endpoint is timing out during peak traffic. Before suggesting changes, what clarifying questions do you ask about traffic patterns, infra, and SLAs?",
  },
];

function hashToIndex(seed: string, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % max;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const authHeader = req.headers.get("Authorization") || "";
    const sb = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
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

    const body: StartBody = await req.json();
    const job_role = (body.job_role || "Software Engineer").trim();
    const tech_stack = (body.tech_stack || "React").trim();
    const experience_level = (body.experience_level || "intermediate").trim();
    const mode = (body.mode || "production_thinking").trim();

    const idx = hashToIndex(`${user.id}:${job_role}`, SCENARIOS.length);
    const scenario = SCENARIOS[idx];

    const nowIso = new Date().toISOString();
    const journey_context = {
      scenario_id: scenario.id,
      scenario_title: scenario.title,
      clarification_asked: false,
      core_answer: "",
      follow_up: "",
      curveball: "",
    };

    const { data: sessionRow, error: insertErr } = await sb
      .from("interview_sessions")
      .insert({
        user_id: user.id,
        session_type: "journey",
        status: "active",
        job_role,
        tech_stack,
        experience_level,
        started_at: nowIso,
        journey_state: "AWAITING_CLARIFICATION",
        journey_version: 1,
        journey_mode: mode,
        journey_context,
        journey_last_step_at: nowIso,
        questions_data: [],
      })
      .select("id")
      .single();

    if (insertErr) throw insertErr;

    const session_id = sessionRow.id as string;

    await sb.from("interview_turns").insert({
      session_id,
      user_id: user.id,
      role: "assistant",
      state: "AWAITING_CLARIFICATION",
      content: scenario.prompt,
      metadata: { scenario_id: scenario.id, scenario_title: scenario.title },
    });

    return new Response(
      JSON.stringify({
        session_id,
        state: "AWAITING_CLARIFICATION",
        prompt: scenario.prompt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("interview-journey-start error", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
