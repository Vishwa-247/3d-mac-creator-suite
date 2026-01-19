# StudyMate - Project Context

> **For Lovable AI**: Read this file FIRST to understand what this project is. Check Git commits after each session to track changes.

## What Is StudyMate?

An **agentic career preparation platform** that trains users to think in production by questioning, challenging, and adapting to their decisions.

**NOT** a course platform. **NOT** a mock interview app. A **thinking simulator** for real-world engineering & interviews.

## Core Problem We Solve

| Reality | Our Solution |
|---------|--------------|
| Colleges teach theory | System behaves like senior engineer |
| Platforms teach content | Forces user to think before answering |
| Interviews test decision-making | Adapts based on user decisions |
| Students jump to solutions | Questions and challenges assumptions |

## The 6 Modules

### 1. Agent Orchestrator (Brain)
- Stores user goal (role, focus)
- Tracks weaknesses across system
- Decides what user should do next
- **Key**: User does NOT control flow blindly

### 2. Interactive Course Generation
- Course behaves like a mentor
- Flow: Scenario → Why Question → Teaching → Failure Injection → Micro Check
- Branching based on thinking quality

### 3. Project Studio (Most Unique)
- 5 AI agents simulate software company workflow
- Agents: Idea Analyst → Research → System Design → UI/UX → Execution Planner
- **Key**: Agents may disagree

### 4. Production Thinking Interview
- NOT mock Q&A, real interviewer simulation
- Steps: Clarification → Core Answer → Follow-ups → Curveball → Reflection
- Metrics: Clarification Habit, Structure, Trade-off Awareness, Scalability, Failure Awareness, Adaptability

### 5. DSA Skill Mastery (Visualizer)
- Understanding code ≠ understanding algorithm
- Visual Run → Pause & Predict → Explanation → Pattern Mapping
- No compiler needed

### 6. Career Tracker
- Learning growth, Interview improvement, DSA mastery
- Trends > fake predictions

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Tailwind |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| Backend | Python FastAPI services |
| AI | Gemini API, Groq API |
| Connectors | Supabase MCP, Firecrawl MCP, ElevenLabs |

## What We Explicitly Removed

❌ Judge0 / Code execution  
❌ Docker sandbox  
❌ Live WebRTC  
❌ Mobile app  
❌ Social features  
❌ Notifications  
❌ Overengineering infra

## System Flow

```
User → Agent Orchestrator → Chooses Module → Module QUESTIONS User
→ User Responds → System Adapts & Gives Feedback → Career State Updates
→ Orchestrator Replans Next Action
```

This loop is the heart of the system.
