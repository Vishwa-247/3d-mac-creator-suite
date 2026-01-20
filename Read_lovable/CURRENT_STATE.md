# StudyMate - Current State

> **For Lovable AI**: This file is updated after each implementation phase. Check Git commits for code-level changes.

**Last Updated**: 2026-01-20  
**Updated By**: Antigravity AI  
**Phase**: Phase 1 Complete (Onboarding + Orchestrator v0 Integration)

---

## ✅ Phase 1: Foundation - COMPLETED

### What Was Built (Jan 20, 2026)

#### 1. User Onboarding Flow
**Files Created:**
- `src/pages/Onboarding.tsx` - 5-step wizard with custom input support
- `src/hooks/useOnboardingGuard.ts` - Onboarding completion check
- `supabase/migrations/20260120_user_onboarding.sql` - Database table

**Features:**
- ✅ 5 personalization questions (role, focus, experience, hours, learning mode)
- ✅ Custom input option for all questions (user can type their own answers)
- ✅ Progress bar with step indicators
- ✅ Modern UI matching app theme (Electric Indigo primary)
- ✅ Saved to Supabase with RLS policies
- ✅ Global onboarding gate in `ProtectedRoute`
- ✅ Redirects incomplete users to `/onboarding`

#### 2. Orchestrator v0 Integration
**Files Created:**
- `src/components/OrchestratorCard.tsx` - AI recommendation display

**Files Modified:**
- `src/pages/Dashboard.tsx` - Added OrchestratorCard at top
- `src/components/ProtectedRoute.tsx` - Added onboarding gate logic
- `src/App.tsx` - Added `/onboarding` route

**Features:**
- ✅ Dashboard shows "Recommended Next Step" from Orchestrator
- ✅ Calls `localhost:8011` via Gateway (`localhost:8000`)
- ✅ Module-to-route mapping (interview → `/mock-interview`, etc.)
- ✅ Premium UI with loading/error states
- ✅ "Start" button navigates to recommended module

#### 3. Database
- ✅ `user_onboarding` table created with RLS
- ✅ Stores: `target_role`, `primary_focus`, `experience_level`, `hours_per_week`, `learning_mode`, `completed_at`
- ✅ **Migration Status**: File created, **needs to be applied** via `npx supabase db push`

---

## What's Built & Working

### ✅ Frontend (React + TypeScript)
- **Onboarding**: 5-step wizard with custom inputs ⭐ NEW
- **Auth page**: Supabase authentication working
- **Dashboard**: Layout + OrchestratorCard integration ⭐ UPDATED
- **Course Generator**: UI complete, connects to backend
- **Mock Interview**: Full UI with WebSocket support
- **Resume Analyzer**: UI complete
- **DSA Sheet**: Basic listing page

**Location**: `src/pages/`, `src/components/`

### ✅ Backend Services (Python FastAPI)

| Service | Port | Status | Location |
|---------|------|--------|----------|
| **Gateway** | 8000 | ✅ Working | `backend/gateway/` |
| **Orchestrator** | 8011 | ✅ v0 (Rules) | `backend/orchestrator/` ⭐ INTEGRATED |
| Course Generation | 8001 | ✅ Working | `backend/agents/course-generation/` |
| Interview Coach | 8002 | ✅ Working | `backend/agents/interview-coach/` |
| Profile Service | - | ✅ Working | `backend/agents/profile-service/` |

**Orchestrator v0:**
- Uses deterministic rules from `user_state` table
- Returns `{ next_module, reason, description }`
- No memory/LLM yet (Phase 2)

### ✅ Database (Supabase)
- 27 migrations (26 existing + 1 new `user_onboarding`)
- Tables: users, courses, interviews, user_state, **user_onboarding** ⭐ NEW
- Edge functions deployed

---

## What's NOT Built (Critical Gaps)

### 🟡 Module 1: Agent Orchestrator
- **Current**: ✅ Rules-based v0 integrated into Dashboard
- **Missing**: Memory (Zep), LLM-based decisions, behavioral adaptation
- **Needs**: Phase 2 - Zep integration for persistent state

### 🔴 Module 2: Interactive Courses
- **Current**: Dumps content in chapters
- **Missing**: Question → Decision → Explanation flow
- **Needs**: Scenario-first generation, answer branching

### 🔴 Module 3: Project Studio
- **Current**: Does not exist
- **Missing**: All 5 agents (PM, Designer, BE, FE, QA)
- **Needs**: Multi-agent framework (CrewAI Flow pattern)

### 🟡 Module 4: Production Interviews
- **Current**: Q&A with basic evaluation
- **Missing**: Clarification detection, follow-ups, curveballs
- **Needs**: Parlant-style journey pattern

### 🔴 Module 5: DSA Visualizer
- **Current**: Empty folder
- **Missing**: Visualization, pause/predict, pattern mapping
- **Needs**: Frontend component + algorithm state machine

### 🟡 Module 6: Career Tracker
- **Current**: Basic stats on dashboard
- **Missing**: Trend analysis, weakness detection
- **Needs**: Historical tracking, adaptive recommendations

---

## Patterns Available (from ai-engineering-hub)

See `Read_lovable/patterns/` for implementation patterns:
1. `zep_memory_pattern.md` - User memory across sessions
2. `parlant_journey_pattern.md` - Multi-step flows with branching
3. `agentic_rag_pattern.md` - Document + web fallback
4. `database_memory_pattern.md` - Session history in DB
5. `book_writer_flow_pattern.md` - Multi-agent coordination
6. `corrective_rag_pattern.md` - Self-correcting answers
7. `eval_observability_pattern.md` - Behavioral metrics

---

## Architecture Notes

### User Flow (Phase 1)
```
Login → Check Onboarding → /onboarding if incomplete
  ↓ (complete 5 steps + save)
Dashboard → OrchestratorCard → Fetch next_module
  ↓ (click "Start")
Navigate to module route
```

### Orchestrator Call Chain
```
Dashboard.tsx → getNextModule(userId) → Gateway (localhost:8000/api/next)
  ↓
Orchestrator (localhost:8011) → rules.py → user_state table
  ↓
Returns: { next_module, reason, description }
  ↓
OrchestratorCard displays + navigates
```

---

## Next Actions

**Immediate** (Before Demo):
1. ⚠️ Apply migration: `npx supabase db push`
2. ⚠️ Start backend services (Gateway + Orchestrator)
3. ✅ Test onboarding flow
4. ✅ Test orchestrator card on dashboard
5. 📸 Take screenshots for presentation

**Phase 2** (After Demo):
1. Add Zep Memory to Orchestrator (upgrade to v1)
2. Expand orchestrator rules based on `interview_metrics`
3. Implement Parlant journeys in Interview module
4. Add evaluation observability pipeline
5. Build Interactive Course module with question branching

**Blocked On**: User testing + feedback from demo
