# Course Agent — Deep Dive Implementation Plan

## 📊 Current State Analysis

### What Already Exists (Backend: `course-generation/main.py`)

| Feature | Status | Details |
|---------|--------|---------|
| **Parallel Generation** | ✅ Done | 10 API keys, async generation, ~40 seconds |
| **Chapters (Read Mode)** | ✅ Done | 5-7 chapters, HTML format, code examples |
| **Flashcards** | ✅ Done | 10 per course |
| **MCQs (Quizzes)** | ✅ Done | 10 per course, with explanations |
| **Word Games** | ✅ Done | 15 vocabulary words |
| **Articles** | ✅ Done | Deep dive, key takeaways, FAQ |
| **Audio Scripts (Listen Mode)** | ✅ Done | Short (5 min) + Long (20 min) scripts |
| **TTS (ElevenLabs)** | ⚠️ Partial | Configured, but may have API limits |
| **Resource Discovery** | ✅ Done | Brave Search integration |
| **Suggestions** | ✅ Done | 5 related topics |

### What's Missing (Agentic Features)

| Feature | Status | Why It's Needed |
|---------|--------|-----------------|
| **Dynamic/Adaptive Course** | ❌ Missing | Course doesn't change based on user performance |
| **Quiz Failure → Remediation** | ❌ Missing | No auto-generation of easier content when user fails |
| **User Progress Tracking (per-topic)** | ❌ Missing | Only course-level, not chapter-level |
| **Memory Integration** | ❌ Missing | Agent doesn't remember user's weak areas for future courses |
| **Loading-Time Engagement** | ❌ Missing | User just sees a progress bar, no engagement questions |
| **Practice Mode (Code Execution)** | ❌ Missing | No coding exercises with actual execution |

---

## 🏗️ Architecture: How It Currently Works

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend: CourseGenerator Page                             │
│  - User enters topic                                        │
│  - Calls POST /generate-course-parallel                     │
│  - Shows CourseGenerationStatus (polling for progress)      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  API Gateway (:8000)                                        │
│  POST /courses/generate-parallel → Forward to Course Svc    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Course Generation Service (:8008)                          │
│  1. Create course record in Supabase (status: "generating") │
│  2. Create job record                                       │
│  3. Return immediately to user                              │
│  4. Background Task: generate_in_parallel()                 │
│     └─ asyncio.gather(                                      │
│          generate_chapters(),                               │
│          generate_flashcards(),                             │
│          generate_mcqs(),                                   │
│          generate_articles(),                               │
│          generate_word_games(),                             │
│          generate_audio_scripts()                           │
│        )                                                    │
│  5. Update course status to "published"                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Upgrade Plan: Making It Agentic

### Upgrade 1: Loading-Time Engagement (P0 - Easy)

**Goal**: While the course is generating, show personality questions instead of a boring progress bar.

**Frontend Change** (`CourseGenerationStatus.tsx`):
```tsx
// Replace simple progress bar with engagement questions
const ENGAGEMENT_QUESTIONS = [
  { q: "How do you prefer to learn?", options: ["Reading", "Videos", "Hands-on"] },
  { q: "Are you a morning person?", options: ["Early Bird 🌅", "Night Owl 🦉"] },
  { q: "What's your learning goal?", options: ["Job prep", "Hobby", "Upskilling"] },
];

// Show one question per 20% progress
// Store answers in localStorage or send to backend
```

**Backend Change**: None needed initially. Store in localStorage for now, later save to `user_preferences` table.

**Effort**: 2-3 hours (Frontend only)

---

### Upgrade 2: Dynamic Course Adaptation (P1 - Medium)

**Goal**: If user fails a quiz (score < 50%), auto-generate a "remediation" chapter.

**New Database Tables**:
```sql
-- Track detailed progress per chapter
CREATE TABLE course_progress_detailed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    quiz_score INTEGER,          -- 0-100
    time_spent_seconds INTEGER,
    completed_at TIMESTAMPTZ,
    needs_remediation BOOLEAN DEFAULT FALSE
);

-- Track dynamically added remediation chapters
CREATE TABLE course_remediation_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL,
    original_chapter_id UUID NOT NULL,  -- Which chapter the user failed
    title VARCHAR(500),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**New Backend Endpoint** (`course-generation/main.py`):
```python
@app.post("/courses/{course_id}/chapters/{chapter_id}/remediation")
async def generate_remediation(course_id: str, chapter_id: str, user_id: str):
    """Generate a remediation chapter for a user who failed a quiz"""
    
    # 1. Get the original chapter content
    chapter = await get_chapter(chapter_id)
    
    # 2. Generate simpler content
    prompt = f"""The user failed a quiz on: {chapter['title']}.
    Generate a SIMPLER explanation of the same topic.
    - Use more examples
    - Shorter sentences
    - More analogies
    - Focus on the fundamentals"""
    
    content = await call_gemini_with_retry(prompt, service="chapter")
    
    # 3. Save remediation chapter
    await insert_to_supabase("course_remediation_chapters", [{
        "course_id": course_id,
        "original_chapter_id": chapter_id,
        "title": f"Let's Review: {chapter['title']}",
        "content": content
    }])
    
    # 4. Save to agent_memory (for future courses)
    await save_to_memory(user_id, "weak_topic", chapter['title'])
    
    return {"success": True}
```

**Frontend Change**: After quiz submission, if score < 50%, call the remediation endpoint and show the new chapter.

**Effort**: 1-2 days

---

### Upgrade 3: Memory Integration (P1 - Medium)

**Goal**: When generating a NEW course, check if the user has past weak areas and adjust the content.

**Flow**:
1. User requests new course on "Backend Development"
2. Agent queries `agent_memory` for this user
3. Finds: "User struggled with 'API Design' in previous course"
4. Adds extra emphasis on API Design in the new course

**Backend Change** (in `generate_in_parallel`):
```python
async def generate_in_parallel(course_id: str, topic: str, user_id: str):
    # NEW: Check for past weak areas
    weak_areas = await get_user_weak_areas(user_id)
    
    # Modify outline prompt to include weak areas
    prompt = f"""Create a course outline for: {topic}
    
    IMPORTANT: The user has struggled with these topics in the past:
    {', '.join(weak_areas)}
    
    Include extra content to reinforce understanding of these areas."""
```

**Effort**: 4-6 hours

---

### Upgrade 4: Practice Mode (P2 - Hard)

**Goal**: Add coding exercises to each chapter that users can actually run.

**Dependencies**: Judge0 API or self-hosted code execution

**New Database Table**:
```sql
CREATE TABLE course_coding_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    title VARCHAR(500),
    description TEXT,
    starter_code TEXT,
    solution_code TEXT,
    test_cases JSONB,  -- [{"input": "...", "expected_output": "..."}]
    language VARCHAR(50) DEFAULT 'python'
);
```

**Backend Endpoint**:
```python
@app.post("/courses/exercises/{exercise_id}/run")
async def run_exercise(exercise_id: str, user_code: str):
    """Execute user code via Judge0"""
    exercise = await get_exercise(exercise_id)
    
    # Submit to Judge0
    result = await judge0_submit(
        code=user_code,
        language=exercise['language'],
        test_cases=exercise['test_cases']
    )
    
    return {
        "passed": result['all_passed'],
        "results": result['test_results'],
        "feedback": await generate_feedback(user_code, exercise, result)
    }
```

**Effort**: 2-3 days (requires Judge0 setup)

---

## 📋 Implementation Priority

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 🔴 P0 | Loading-Time Engagement (Frontend) | 2-3 hours | High - UX |
| 🟡 P1 | Dynamic Course Adaptation (Quiz → Remediation) | 1-2 days | High - Agentic |
| 🟡 P1 | Memory Integration (Weak Areas) | 4-6 hours | High - Agentic |
| 🟢 P2 | Practice Mode (Code Execution) | 2-3 days | Medium - Feature |

---

## 🎯 What Makes This "Agentic"

| Before (Current) | After (Upgraded) |
|------------------|------------------|
| User generates a course → Same course for everyone | User generates a course → Agent checks past weak areas → Personalized course |
| User fails a quiz → Nothing happens | User fails a quiz → Agent auto-generates easier content |
| User waits during generation → Boring | User waits → Engaged with personality questions → Data used for personalization |
| User finishes a course → Agent forgets | User finishes → Agent remembers weak/strong areas for future courses |

---

## 📁 Files to Modify

| File | Changes |
|------|---------|
| `backend/agents/course-generation/main.py` | Add remediation endpoint, memory integration |
| `src/components/course/CourseGenerationStatus.tsx` | Add engagement questions |
| `src/components/course/CourseLayout.tsx` | Add remediation chapter display |
| `supabase/migrations/` | New tables: `course_progress_detailed`, `course_remediation_chapters` |
