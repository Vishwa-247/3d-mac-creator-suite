# StudyMate 2.0 Implementation Plan

# Goal Description
Transform the existing StudyMate platform into an **Agentic Career Accelerator**. 
The goal is to shift from a "collection of tools" to a set of autonomous agents that proactively guide the user's career preparation.
Key novelty: **"My platform becomes your personal career agent."**

---

## 🤖 What Makes It "Agentic"? (The Core Philosophy)

**Tool-Based (Current State):**
> User clicks a button → System responds → User decides next step.

**Agentic (Target State):**
> User sets a goal → Agent **autonomously** analyzes, plans, executes, and adapts → Agent **proactively** suggests next steps.

### The 5 Pillars of an Agentic System
| Pillar | Description | Example in StudyMate 2.0 |
|--------|-------------|--------------------------|
| **1. Memory** | Agent remembers past interactions | Stores your resume gaps, failed quiz topics, interview mistakes in Vector DB |
| **2. Planning** | Agent creates multi-step plans | Generates a 90-day roadmap with milestones |
| **3. Execution** | Agent performs tasks autonomously | Runs your code, grades it, explains errors |
| **4. Adaptation** | Agent changes behavior based on feedback | If you fail a quiz, it generates easier content |
| **5. Proactivity** | Agent initiates actions without user prompt | "You haven't practiced DSA in 3 days. Here's a problem." |

---

## 🎯 Complete Agentic Feature List

### Feature 1: Agentic Onboarding (NEW)
| Aspect | Details |
|--------|---------|
| **What it does** | User uploads resume → Agent extracts skills, identifies gaps, generates a personalized 30/60/90-day roadmap. |
| **Why it's Agentic** | **Planning + Memory**. Agent creates a plan and stores your skill profile for all other agents to use. |
| **User Impact** | User no longer needs to manually figure out "what to learn next." The agent tells them. |
| **Tech** | Onboarding Agent → Resume Analyzer → LLM (Gemini) → `user_onboarding` table. |

### Feature 2: Long-Term Agent Memory (NEW)
| Aspect | Details |
|--------|---------|
| **What it does** | Stores embeddings of: resume chunks, failed quiz topics, interview mistakes, weak DSA patterns. |
| **Why it's Agentic** | **Memory**. This is the "brain" that lets agents recall your history. Without it, each interaction is stateless. |
| **User Impact** | The Interview Coach remembers you struggle with "STAR format." The DSA Agent knows you're weak at "Graph BFS." |
| **Tech** | Supabase `pgvector` extension → `agent_memory` table. |

### Feature 3: Dynamic/Adaptive Courses (UPGRADE)
| Aspect | Details |
|--------|---------|
| **What it does** | If user fails a quiz, agent auto-generates a "remediation" chapter. If user aces a topic, agent skips it. |
| **Why it's Agentic** | **Adaptation**. The course is not static; it changes based on your performance. |
| **User Impact** | User doesn't waste time on things they know. Gets extra help where they struggle. |
| **Tech** | Learning Agent listens to `QUIZ_FAILED` event → calls LLM → inserts new chapter. |

### Feature 4: Accountability Agent (NEW)
| Aspect | Details |
|--------|---------|
| **What it does** | Tracks daily progress. Sends reminders. Warns when falling behind. Predicts "time to job-readiness." |
| **Why it's Agentic** | **Proactivity**. Agent initiates contact, not the user. |
| **User Impact** | User stays on track without needing willpower. Gets a daily "score" and nudges. |
| **Tech** | Cron job → calculates `career_scores` → triggers notifications. |

### Feature 5: Code Execution Sandbox for DSA (UPGRADE)
| Aspect | Details |
|--------|---------|
| **What it does** | User writes code → Agent runs it securely → Returns pass/fail + performance metrics. |
| **Why it's Agentic** | **Execution**. Agent actually tests the code, not just reads it. |
| **User Impact** | Real coding practice, like LeetCode, but integrated with personalized feedback. |
| **Tech** | DSA Agent → Judge0 API (or self-hosted Docker sandbox). |

### Feature 6: Contextual Interview Coach (UPGRADE)
| Aspect | Details |
|--------|---------|
| **What it does** | Agent recalls your previous interview answers from memory. Asks follow-up questions targeting your weaknesses. |
| **Why it's Agentic** | **Memory + Adaptation**. It's not generic questions; it's questions crafted for *you*. |
| **User Impact** | Interview practice feels like a real mentor who knows your history. |
| **Tech** | Interview Agent → queries `agent_memory` for past transcripts → LLM crafts targeted questions. |

### Feature 7: Event-Driven Orchestrator (NEW)
| Aspect | Details |
|--------|---------|
| **What it does** | A central "brain" that listens to events (e.g., `RESUME_UPLOADED`, `QUIZ_FAILED`) and triggers the right agent. |
| **Why it's Agentic** | **This is the backbone**. Without an orchestrator, agents are just isolated tools. With it, they collaborate. |
| **User Impact** | Seamless experience. Uploading a resume automatically triggers roadmap generation, course suggestions, etc. |
| **Tech** | Redis Task Queue → Python Worker (Celery/Arq) → dispatches to agents. |

---

## 📊 Feature Impact Matrix (At a Glance)

| Feature | Memory | Planning | Execution | Adaptation | Proactivity |
|---------|:------:|:--------:|:---------:|:----------:|:-----------:|
| Agentic Onboarding | ✅ | ✅ | | | |
| Long-Term Memory | ✅ | | | | |
| Dynamic Courses | ✅ | | | ✅ | |
| Accountability Agent | ✅ | | | | ✅ |
| Code Execution (DSA) | | | ✅ | | |
| Contextual Interview | ✅ | | | ✅ | |
| Event Orchestrator | | | ✅ | | |

## User Review Required
> [!IMPORTANT]
> **Vector Database Selection**: We need to decide on a Vector DB (Pinecone, Weaviate, or pgvector if staying within Supabase). The user plan suggests Pinecone or Weaviate, but pgvector might be simpler if we want to keep the stack minimal.
> **Code Execution**: The plan suggests Judge0. We need to confirm if we are self-hosting Judge0 or using the API (API has costs, self-hosting requires Docker infra).

## Proposed Changes

## Detailed Technical Specification

### 1. Architecture: The Agentic Hub
We are moving from a **Proxy Pattern** (API Gateway -> Service) to an **Event-Driven Pattern** (API Gateway -> Orchestrator -> Service -> Memory).

- **Orchestrator (Redis)**:
  - **Task Queue**: `study_mate_tasks`
  - **Events**: `ONBOARDING_START`, `RESUME_ANALYZED`, `QUIZ_FAILED`, `INTERVIEW_COMPLETED`.
  - **Worker**: A Python service (`backend/orchestrator`) that listens to Redis and triggers the appropriate Agent via HTTP or internal function calls.

### 2. Database Schema (Supabase PostgreSQL)

#### **A. Vector Memory (`agent_memory`)**
This table acts as the long-term memory for the agents.
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE agent_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    agent_type VARCHAR(50) NOT NULL, -- e.g., 'resume', 'learning', 'interview'
    memory_type VARCHAR(50) NOT NULL, -- e.g., 'skill_gap', 'failed_concept', 'resume_chunk'
    content TEXT NOT NULL,            -- The text content (e.g., "User struggles with Dynamic Programming")
    embedding vector(1536),           -- Vector embedding from Gemini/Groq
    metadata JSONB,                   -- Extra context (e.g., {"timestamp": "...", "source_id": "..."})
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **B. Onboarding State (`user_onboarding`)**
Stores the generated career roadmap.
```sql
CREATE TABLE user_onboarding (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    skill_graph JSONB,      -- e.g., {"python": 80, "react": 40}
    weakness_map JSONB,     -- e.g., ["system_design", "graph_algorithms"]
    roadmap JSONB,          -- The 30/60/90 day plan structure
    status VARCHAR(50) DEFAULT 'processing', 
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **C. Accountability (`career_scores`)**
Tracks the user's daily "readiness" score.
```sql
CREATE TABLE career_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    date DATE DEFAULT CURRENT_DATE,
    resume_score INTEGER,
    interview_score INTEGER,
    dsa_score INTEGER,
    overall_readiness INTEGER, -- 0-100
    UNIQUE(user_id, date)
);
```

### 3. Service Workflows

#### **Workflow 1: Agentic Onboarding**
1. **User** uploads Resume + sets Goal ("Backend Dev").
2. **API Gateway** sends file to `Resume Analyzer`.
3. **Resume Analyzer** returns structured JSON (skills, missing keywords).
4. **API Gateway** pushes event `ONBOARDING_STARTED` to **Orchestrator**.
5. **Orchestrator** triggers **Onboarding Agent**:
   - Reads Resume Analysis.
   - Calls **LLM (Gemini)**: "Generate a 90-day roadmap for a user who knows X but misses Y keywords for 'Backend Dev'".
   - Saves Roadmap to `user_onboarding`.
   - Embeds the "Weaknesses" text and saves to `agent_memory`.

#### **Workflow 2: Dynamic Course Adaptation**
1. **User** fails a quiz (Score < 50%).
2. **Course Service** pushes event `QUIZ_FAILED` to **Orchestrator**.
3. **Orchestrator** triggers **Learning Agent**:
   - Queries `agent_memory` for past failures.
   - Calls **LLM**: "Generate a remediation chapter explaining 'Recursion' simply."
   - Inserts new content into `course_chapters`.

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
1. **Infrastructure**:
   - [ ] Enable `pgvector` on Supabase.
   - [ ] Set up Redis instance (Docker or Cloud) + python worker.
2. **Onboarding Agent**:
   - [ ] Create `backend/agents/onboarding-agent`.
   - [ ] Implement `POST /generate-roadmap` endpoint.
   - [ ] Implement "Resume to Roadmap" LLM prompt.
3. **Memory Integration**:
   - [ ] Update `Resume Analyzer` to save embeddings of resume summary to `agent_memory`.

### Phase 2: Core Loop (Weeks 3-4)
1. **Resume Monitor**: Cron job that checks `agent_memory` (User Skills) against new Job Descriptions.
2. **Learning Agent**: Implement "Dynamic" flag in courses and the "Remediation" workflow.

### Phase 3: Advanced (Weeks 5-6)
1. **DSA Agent**: Integrate Judge0 API for code execution.
2. **Interview Coach**: Add "Contextual Recall" (Agent remembers previous interview mistakes).

## Verification Plan

### Automated Tests
- Integration tests for the Orchestrator (task queuing and consumption).
- Unit tests for new Agent logic (e.g., scoring algorithms).

### Manual Verification
- **Onboarding Flow**: verification of the Roadmap generation from a sample resume.
- **Agent Loop**: verifying that a failing quiz triggers a new chapter generation (Learning Agent).
