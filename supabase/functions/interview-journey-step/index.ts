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

type StepBody = {
  session_id: string;
  message: string;
};

type JourneyContext = {
  clarification_asked?: boolean;
  core_answer?: string;
  follow_up?: string;
  curveball?: string;
  scenario_title?: string;
  scenario_id?: string;
};

const ST_AWAITING = "AWAITING_CLARIFICATION";
const ST_CORE = "CORE_ANSWER";
const ST_FOLLOW = "FOLLOW_UP";
const ST_CURVEBALL = "CURVEBALL";
const ST_REFLECTION = "REFLECTION";
const ST_COMPLETE = "COMPLETE";

function hasClarification(message: string) {
  const m = message.toLowerCase();
  if (m.includes("?") && (m.includes("what") || m.includes("which") || m.includes("how") || m.includes("when") || m.includes("where"))) {
    return true;
  }
  return m.includes("clarif") || m.includes("assumption") || m.includes("constraints") || m.includes("sla");
}

function scoreKeywordHit(message: string, keywords: string[]) {
  const m = message.toLowerCase();
  let hits = 0;
  for (const k of keywords) if (m.includes(k)) hits++;
  return hits;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function computeMetrics(ctx: Required<JourneyContext>) {
  const clarification = ctx.clarification_asked ? 1 : 0;

  const structureHits = scoreKeywordHit(ctx.core_answer, ["first", "second", "third", "step", "approach", "plan", "tradeoff"]) +
    scoreKeywordHit(ctx.follow_up, ["next", "then", "finally", "monitor", "rollout"]);
  const structure = clamp01(structureHits / 6);

  const tradeoffHits =
    scoreKeywordHit(ctx.core_answer, ["tradeoff", "latency", "cost", "consistency", "availability", "throughput"]) +
    scoreKeywordHit(ctx.follow_up, ["tradeoff", "latency", "cost", "consistency", "availability", "throughput"]);
  const tradeoff = clamp01(tradeoffHits / 6);

  const scalabilityHits = scoreKeywordHit(ctx.core_answer, ["scale", "cache", "partition", "queue", "index", "load"]) +
    scoreKeywordHit(ctx.follow_up, ["scale", "cache", "partition", "queue", "index", "load"]);
  const scalability = clamp01(scalabilityHits / 6);

  const failureHits = scoreKeywordHit(ctx.core_answer, ["failure", "timeout", "retry", "fallback", "circuit", "idempot" ]) +
    scoreKeywordHit(ctx.follow_up, ["failure", "timeout", "retry", "fallback", "circuit", "idempot" ]) +
    scoreKeywordHit(ctx.curveball, ["failure", "timeout", "retry", "fallback", "circuit", "idempot" ]);
  const failure = clamp01(failureHits / 8);

  const adaptabilityHits = scoreKeywordHit(ctx.curveball, ["adapt", "switch", "rollback", "feature flag", "mitigate", "degrade"]) +
    scoreKeywordHit(ctx.follow_up, ["monitor", "alert", "rollback", "feature flag"]) ;
  const adaptability = clamp01(adaptabilityHits / 6);

  const clarification_habit = clarification;
  const overall = clamp01((clarification_habit + structure + tradeoff + scalability + failure + adaptability) / 6);

  // Store as 0-100 for demo readability.
  const toPct = (x: number) => Math.round(x * 100);
  return {
    clarification_habit: toPct(clarification_habit),
    structure: toPct(structure),
    tradeoff_awareness: toPct(tradeoff),
    scalability_thinking: toPct(scalability),
    failure_awareness: toPct(failure),
    adaptability: toPct(adaptability),
    overall_score: toPct(overall),
  };
}

function transition(state: string, message: string, ctx: JourneyContext) {
  const msg = message.trim();
  const nextCtx: JourneyContext = { ...ctx };

  if (state === ST_AWAITING) {
    nextCtx.clarification_asked = hasClarification(msg);
    return {
      next_state: ST_CORE,
      prompt:
        "Great. Now give your core answer: propose an approach, include data flow, and call out tradeoffs (latency/cost/consistency).",
      ctx: nextCtx,
      done: false,
    };
  }

  if (state === ST_CORE) {
    nextCtx.core_answer = msg;
    return {
      next_state: ST_FOLLOW,
      prompt:
        "Follow-up: how would you validate this in production (metrics, logging, rollout plan) and what could go wrong?",
      ctx: nextCtx,
      done: false,
    };
  }

  if (state === ST_FOLLOW) {
    nextCtx.follow_up = msg;
    return {
      next_state: ST_CURVEBALL,
      prompt:
        "Curveball: traffic doubles and a downstream dependency starts timing out. What do you change (quick mitigations + longer-term fix)?",
      ctx: nextCtx,
      done: false,
    };
  }

  if (state === ST_CURVEBALL) {
    nextCtx.curveball = msg;
    return {
      next_state: ST_REFLECTION,
      prompt:
        "Reflection: what would you do differently next time, and what assumptions were most risky?",
      ctx: nextCtx,
      done: false,
    };
  }

  if (state === ST_REFLECTION) {
    // We don't persist reflection text in ctx, but it's still captured in interview_turns.
    return {
      next_state: ST_COMPLETE,
      prompt: "Session complete. Generating your metrics...",
      ctx: nextCtx,
      done: true,
    };
  }

  return {
    next_state: ST_COMPLETE,
    prompt: "Session complete.",
    ctx: nextCtx,
    done: true,
  };
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

    const body: StepBody = await req.json();
    const session_id = body.session_id;
    const message = (body.message || "").trim();
    if (!session_id || !message) {
      return new Response(JSON.stringify({ error: "session_id and message required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: session, error: sessionErr } = await sb
      .from("interview_sessions")
      .select("id, user_id, journey_state, journey_context")
      .eq("id", session_id)
      .single();
    if (sessionErr) throw sessionErr;

    if (session.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentState = (session.journey_state || ST_AWAITING) as string;
    const ctx = (session.journey_context || {}) as JourneyContext;

    // Append user turn
    await sb.from("interview_turns").insert({
      session_id,
      user_id: user.id,
      role: "user",
      state: currentState,
      content: message,
      metadata: {},
    });

    const t = transition(currentState, message, ctx);
    const nowIso = new Date().toISOString();

    // Update session
    const update: any = {
      journey_state: t.next_state,
      journey_context: t.ctx,
      journey_last_step_at: nowIso,
    };
    if (t.next_state === ST_COMPLETE) {
      update.journey_completed_at = nowIso;
      update.status = "completed";
      update.completed_at = nowIso;
    }

    const { error: updErr } = await sb
      .from("interview_sessions")
      .update(update)
      .eq("id", session_id);
    if (updErr) throw updErr;

    // Append assistant turn
    await sb.from("interview_turns").insert({
      session_id,
      user_id: user.id,
      role: "assistant",
      state: t.next_state,
      content: t.prompt,
      metadata: {},
    });

    let metrics: any = null;
    if (t.next_state === ST_COMPLETE) {
      const fullCtx: Required<JourneyContext> = {
        clarification_asked: !!t.ctx.clarification_asked,
        core_answer: t.ctx.core_answer || "",
        follow_up: t.ctx.follow_up || "",
        curveball: t.ctx.curveball || "",
        scenario_id: t.ctx.scenario_id || "",
        scenario_title: t.ctx.scenario_title || "",
      };
      metrics = computeMetrics(fullCtx);
      await sb.from("interview_metrics").insert({
        user_id: user.id,
        session_id,
        journey_version: 1,
        ...metrics,
        notes: {},
      });
    }

    return new Response(
      JSON.stringify({
        session_id,
        state: t.next_state,
        prompt: t.prompt,
        done: t.done,
        metrics,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("interview-journey-step error", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
