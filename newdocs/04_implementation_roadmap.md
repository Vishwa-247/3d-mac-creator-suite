# Agentic Platform Architecture - Complete Migration Plan

## Goal Description

Transform the existing StudyMate platform into a fully **agentic, cost-optimized career accelerator** by:

1. **Migrating from Supabase to MongoDB** for flexible, free-tier database hosting
2. **Replacing paid APIs with free alternatives** (Groq, Gemini Flash, local models)
3. **Implementing true agentic behavior** with memory, planning, and adaptation
4. **Building a comprehensive interview module** with ML-powered emotion detection and speech analysis
5. **Optimizing for speed** while maintaining quality through smart model selection

---

## 🎯 Core Requirements

### 0. 🔄 The "Lovable + Cursor" Hybrid Workflow
**We will use the best tool for each job:**

| Layer | Tool | Responsibility |
|-------|------|----------------|
| **Frontend UI** | **Lovable.dev** | Generates beautiful React/Tailwind UI, Components, and Animations. |
| **Backend & ML** | **Cursor (Me)** | Builds FastAPI backend, ML Agents, complex logic, and database schemas. |
| **Source of Truth** | **GitHub** | The bridge. Lovable pushes UI → GitHub → Cursor pulls. Cursor pushes Backend → GitHub → Lovable pulls. |

**The Sync Cycle:**
1.  **UI First**: You ask Lovable to "Create Interview Page". Lovable pushes to GitHub.
2.  **Pull**: You run `git pull` in Cursor. I see the new frontend code.
3.  **Logic Second**: I build the `POST /analyze` API to make that page work. I push to GitHub.
4.  **Bind**: You tell Lovable "Backend is ready, connect the button to `/api/analyze`".

---

### 1. Database Migration: Supabase → MongoDB

**Why MongoDB?**
- ✅ **Free Tier**: MongoDB Atlas offers 512MB storage free forever
- ✅ **Flexible Schema**: Perfect for evolving agentic data structures
- ✅ **Vector Search**: Built-in vector search for agent memory (Atlas Search)
- ✅ **Scalability**: Easy to scale as the platform grows

**Migration Strategy:**

| Current (Supabase) | New (MongoDB) | Migration Approach |
|-------------------|---------------|-------------------|
| PostgreSQL tables | MongoDB collections | Export to JSON → Import to MongoDB |
| pgvector for embeddings | Atlas Vector Search | Re-embed and index in MongoDB |
| Row Level Security | Application-level auth | Implement in FastAPI middleware |
| Realtime subscriptions | Change Streams | Use MongoDB Change Streams |

---

### 2. Free Tools & Services Stack

#### **AI Models (Speed vs Quality)**

| Use Case | Free Tool | Speed | Quality | Cost |
|----------|-----------|-------|---------|------|
| **Fast responses** (chat, quick generation) | **Groq** (Llama 3.1 70B) | ⚡⚡⚡ 500 tokens/sec | ⭐⭐⭐⭐ | FREE (60 req/min) |
| **Quality content** (courses, articles) | **Gemini 1.5 Flash** | ⚡⚡ 100 tokens/sec | ⭐⭐⭐⭐⭐ | FREE (15 req/min) |
| **Offline/Local** (privacy, no limits) | **Ollama** (Llama 3.1 8B) | ⚡ 20-50 tokens/sec | ⭐⭐⭐ | FREE (unlimited) |
| **Embeddings** | **Gemini Embedding** | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | FREE |

**Recommendation:**
- **Primary**: Groq for speed (chat, quick tasks)
- **Secondary**: Gemini Flash for quality (course generation)
- **Fallback**: Ollama for offline/unlimited use

#### **Code Execution**

| Tool | Free Tier | Pros | Cons |
|------|-----------|------|------|
| **Judge0 CE (Self-hosted)** | Unlimited | Full control, no API limits | Requires Docker setup |
| **Piston API** | 1000 executions/day | Easy integration | Rate limited |
| **Replit Code Execution** | Limited | Simple API | Unreliable for production |

**Recommendation**: Self-host Judge0 CE using Docker

#### **Speech-to-Text (Interview Module)**

| Tool | Free Tier | Quality |
|------|-----------|---------|
| **Whisper (OpenAI)** | Self-hosted unlimited | ⭐⭐⭐⭐⭐ |
| **Google Speech-to-Text** | 60 min/month | ⭐⭐⭐⭐ |
| **AssemblyAI** | 5 hours/month | ⭐⭐⭐⭐⭐ |

**Recommendation**: Self-host Whisper for unlimited free usage

#### **Text-to-Speech (Course Audio)**

| Tool | Free Tier | Quality |
|------|-----------|---------|
| **Coqui TTS** | Self-hosted unlimited | ⭐⭐⭐⭐ |
| **Google TTS** | 1M characters/month | ⭐⭐⭐⭐ |
| **ElevenLabs** | 10k characters/month | ⭐⭐⭐⭐⭐ |

**Recommendation**: Google TTS (generous free tier) + Coqui TTS fallback

---

## 🏗️ Agentic Architecture Design

### The Agentic Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                          │
│  (Upload resume, take quiz, request course, practice interview) │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EVENT ORCHESTRATOR                          │
│  (Redis Queue + Python Worker)                                   │
│  - Receives events: RESUME_UPLOADED, QUIZ_FAILED, etc.          │
│  - Dispatches to appropriate agent                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┼────────────┬────────────┐
                ▼            ▼            ▼            ▼
         ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
         │ Onboard  │ │ Learning │ │Interview │ │   DSA    │
         │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │
         └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
              │            │            │            │
              └────────────┴────────────┴────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   AGENT MEMORY       │
                  │  (MongoDB Vector DB) │
                  │  - Stores embeddings │
                  │  - Recalls context   │
                  └──────────────────────┘
```

### Key Agentic Principles

1. **Memory**: Every agent can read/write to shared memory
2. **Planning**: Agents create multi-step plans (e.g., 90-day roadmap)
3. **Execution**: Agents perform tasks autonomously (run code, analyze speech)
4. **Adaptation**: Agents modify behavior based on user performance
5. **Proactivity**: Agents initiate actions (reminders, suggestions)

---

## 📊 MongoDB Schema Design

### Collections Structure

#### **1. users**
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  created_at: Date,
  preferences: {
    learning_style: String, // "visual", "auditory", "kinesthetic"
    daily_goal_minutes: Number,
    notification_enabled: Boolean
  }
}
```

#### **2. agent_memory** (Vector Storage)
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  agent_type: String, // "resume", "learning", "interview", "dsa"
  memory_type: String, // "skill_gap", "failed_concept", "interview_mistake"
  content: String, // The actual text
  embedding: [Float], // 768-dimensional vector (Gemini Embedding)
  metadata: {
    source_id: ObjectId,
    timestamp: Date,
    importance: Number // 1-10 score
  },
  created_at: Date
}
```

**Index for Vector Search:**
```javascript
db.agent_memory.createIndex(
  { embedding: "vector" },
  { 
    name: "vector_index",
    vectorOptions: {
      dimensions: 768,
      similarity: "cosine"
    }
  }
)
```

#### **3. user_roadmaps**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  goal: String, // "Backend Developer", "ML Engineer"
  current_skills: [String],
  skill_gaps: [String],
  roadmap: {
    "30_days": [
      { task: String, completed: Boolean, deadline: Date }
    ],
    "60_days": [...],
    "90_days": [...]
  },
  progress_score: Number, // 0-100
  created_at: Date,
  updated_at: Date
}
```

#### **4. courses**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  title: String,
  topic: String,
  difficulty: String,
  status: String, // "generating", "published", "archived"
  chapters: [
    {
      chapter_id: ObjectId,
      title: String,
      content: String, // HTML
      order: Number,
      is_remediation: Boolean, // True if auto-generated for failed quiz
      parent_chapter_id: ObjectId // If remediation, links to original
    }
  ],
  flashcards: [...],
  mcqs: [...],
  coding_exercises: [...],
  created_at: Date
}
```

#### **5. interview_sessions**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  job_role: String,
  duration_seconds: Number,
  questions: [
    {
      question: String,
      user_answer: String,
      audio_url: String, // S3/Cloudinary link
      transcript: String,
      emotions_detected: [
        { timestamp: Number, emotion: String, confidence: Float }
      ],
      score: Number, // 0-100
      feedback: String
    }
  ],
  overall_score: Number,
  strengths: [String],
  weaknesses: [String],
  created_at: Date
}
```

#### **6. dsa_submissions**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  problem_id: ObjectId,
  code: String,
  language: String,
  test_results: [
    { input: String, expected: String, actual: String, passed: Boolean }
  ],
  execution_time_ms: Number,
  memory_kb: Number,
  passed: Boolean,
  created_at: Date
}
```

---

## 🤖 Interview Module - ML Architecture

### Components

#### **1. Emotion Detection (Real-time)**

**Technology Stack:**
- **Model**: Pre-trained CNN (from your existing `emotion-detection` agent)
- **Input**: Webcam feed (30 FPS)
- **Output**: Emotion labels + confidence scores every 1 second

**Flow:**
```
User's Webcam → Frontend captures frame → 
Send to /detect-emotion endpoint → 
CNN model inference → 
Return: { emotion: "confident", confidence: 0.87 } →
Store in interview_sessions.questions[].emotions_detected
```

**Existing Implementation:**
- ✅ You already have `backend/agents/emotion-detection/`
- ✅ Model is trained and ready
- 🔄 Need to integrate with interview flow

#### **2. Speech-to-Text (Answer Transcription)**

**Technology Stack:**
- **Model**: Whisper (OpenAI) - self-hosted
- **Input**: Audio recording of user's answer
- **Output**: Text transcript

**Setup:**
```bash
# Install Whisper
pip install openai-whisper

# Download model (one-time)
whisper --model medium.en --download
```

**API Endpoint:**
```python
@app.post("/interview/transcribe")
async def transcribe_answer(audio_file: UploadFile):
    # Save audio temporarily
    audio_path = f"/tmp/{audio_file.filename}"
    with open(audio_path, "wb") as f:
        f.write(await audio_file.read())
    
    # Transcribe with Whisper
    result = whisper.transcribe(audio_path, model="medium.en")
    
    return {"transcript": result["text"]}
```

#### **3. Answer Scoring (AI-powered)**

**Technology Stack:**
- **Model**: Groq (Llama 3.1 70B) for speed
- **Input**: Question + User's transcript
- **Output**: Score (0-100) + Feedback

**Prompt Template:**
```python
prompt = f"""
You are an expert interviewer for the role: {job_role}.

Question: {question}
Candidate's Answer: {transcript}

Evaluate the answer on:
1. Relevance (0-25)
2. Completeness (0-25)
3. Clarity (0-25)
4. Technical Accuracy (0-25)

Provide:
- Total Score (0-100)
- Strengths (bullet points)
- Areas for Improvement (bullet points)
- Suggested Better Answer (1-2 sentences)

Format as JSON:
{{
  "score": 75,
  "strengths": ["Clear structure", "Good example"],
  "improvements": ["Add metrics", "Mention edge cases"],
  "suggested_answer": "..."
}}
"""
```

#### **4. Behavioral Analysis (STAR Format Check)**

**Technology Stack:**
- **Model**: Groq (fast classification)
- **Input**: User's answer to behavioral question
- **Output**: STAR components detected

**Prompt:**
```python
prompt = f"""
Analyze if this answer follows the STAR format:
- Situation: Context/background
- Task: Your responsibility
- Action: What you did
- Result: Outcome/impact

Answer: {transcript}

Return JSON:
{{
  "has_situation": true/false,
  "has_task": true/false,
  "has_action": true/false,
  "has_result": true/false,
  "score": 0-100,
  "feedback": "..."
}}
"""
```

---

## ⚡ Speed Optimization Strategy

### Problem: API Keys vs Speed vs Cost

| Approach | Speed | Cost | Reliability |
|----------|-------|------|-------------|
| **10 API keys (current)** | ⚡⚡⚡ Fast (parallel) | 💰 Expensive | ⚠️ Key management hell |
| **Groq (free tier)** | ⚡⚡⚡ 500 tok/sec | 💚 FREE | ✅ 60 req/min limit |
| **Gemini Flash** | ⚡⚡ 100 tok/sec | 💚 FREE | ✅ 15 req/min limit |
| **Local Ollama** | ⚡ 20-50 tok/sec | 💚 FREE | ✅ Unlimited |

### Recommended Hybrid Approach

```python
# Smart model router
async def generate_content(prompt: str, priority: str):
    if priority == "speed":
        # Use Groq for fast responses (chat, quick tasks)
        return await groq_generate(prompt)
    
    elif priority == "quality":
        # Use Gemini Flash for quality content
        return await gemini_flash_generate(prompt)
    
    elif priority == "unlimited":
        # Use local Ollama when rate limits hit
        return await ollama_generate(prompt)
```

### Course Generation Optimization

**Current**: 10 parallel API calls → 40 seconds
**New**: Smart batching + Groq

```python
async def generate_course_optimized(topic: str):
    # Step 1: Generate outline (Groq - fast)
    outline = await groq_generate(f"Create outline for {topic}")
    
    # Step 2: Generate chapters in parallel (Groq - 60 req/min)
    # With 5 chapters, this is well within limits
    chapters = await asyncio.gather(*[
        groq_generate(f"Write chapter: {chapter_title}")
        for chapter_title in outline["chapters"]
    ])
    
    # Step 3: Generate supplementary content (Gemini Flash - quality)
    flashcards = await gemini_flash_generate(f"Create flashcards for {topic}")
    
    # Total time: ~20-30 seconds (faster than current!)
```

---

## 🎓 Interview Module - Complete Flow

### User Journey

1. **User selects job role** (e.g., "Backend Developer")
2. **Agent generates questions** based on role (Groq)
3. **User clicks "Start Interview"**
4. **For each question:**
   - Display question
   - Start webcam (emotion detection)
   - User speaks answer (record audio)
   - Send audio to Whisper (transcribe)
   - Send transcript to Groq (score + feedback)
   - Display emotions timeline + score
5. **End of interview:**
   - Overall score
   - Strengths/weaknesses summary
   - Save to `agent_memory` for future improvement

### Technical Implementation

#### **Frontend (React)**

```tsx
// InterviewSession.tsx
const [isRecording, setIsRecording] = useState(false);
const [emotions, setEmotions] = useState([]);

// Capture webcam frame every 1 second
useEffect(() => {
  const interval = setInterval(async () => {
    const frame = captureWebcamFrame();
    const result = await fetch('/api/detect-emotion', {
      method: 'POST',
      body: frame
    });
    const { emotion, confidence } = await result.json();
    setEmotions(prev => [...prev, { timestamp: Date.now(), emotion, confidence }]);
  }, 1000);
  
  return () => clearInterval(interval);
}, []);

// Record audio
const handleStartAnswer = () => {
  startAudioRecording();
  setIsRecording(true);
};

const handleStopAnswer = async () => {
  const audioBlob = stopAudioRecording();
  setIsRecording(false);
  
  // Transcribe
  const formData = new FormData();
  formData.append('audio', audioBlob);
  const transcript = await fetch('/api/interview/transcribe', {
    method: 'POST',
    body: formData
  }).then(r => r.json());
  
  // Score
  const score = await fetch('/api/interview/score', {
    method: 'POST',
    body: JSON.stringify({
      question: currentQuestion,
      transcript: transcript.text,
      emotions: emotions
    })
  }).then(r => r.json());
  
  // Display results
  showFeedback(score);
};
```

#### **Backend (FastAPI)**

```python
# interview-coach/main.py

@app.post("/interview/start")
async def start_interview(job_role: str, user_id: str):
    # Generate questions using Groq
    prompt = f"Generate 5 interview questions for {job_role}"
    questions = await groq_generate(prompt)
    
    # Create session
    session = {
        "user_id": user_id,
        "job_role": job_role,
        "questions": questions,
        "status": "in_progress"
    }
    result = await db.interview_sessions.insert_one(session)
    
    return {"session_id": str(result.inserted_id), "questions": questions}

@app.post("/interview/transcribe")
async def transcribe(audio: UploadFile):
    # Save audio
    audio_path = f"/tmp/{audio.filename}"
    with open(audio_path, "wb") as f:
        f.write(await audio.read())
    
    # Transcribe with Whisper
    result = whisper.transcribe(audio_path)
    
    return {"transcript": result["text"]}

@app.post("/interview/score")
async def score_answer(
    session_id: str,
    question: str,
    transcript: str,
    emotions: List[dict]
):
    # Score with Groq
    score_result = await groq_generate(scoring_prompt)
    
    # Analyze emotions
    emotion_summary = analyze_emotions(emotions)
    
    # Save to database
    await db.interview_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$push": {
            "questions": {
                "question": question,
                "transcript": transcript,
                "emotions": emotions,
                "score": score_result["score"],
                "feedback": score_result["feedback"]
            }
        }}
    )
    
    # Save to agent memory (for future improvement)
    if score_result["score"] < 60:
        await save_to_memory(
            user_id=session_id,
            agent_type="interview",
            memory_type="weak_area",
            content=f"Struggled with: {question}",
            metadata={"score": score_result["score"]}
        )
    
    return {
        "score": score_result["score"],
        "feedback": score_result["feedback"],
        "emotion_summary": emotion_summary
    }
```

---

## 🚀 Implementation Roadmap

### Phase 1: Database Migration (Week 1)
- [ ] Set up MongoDB Atlas free tier
- [ ] Create collections and indexes
- [ ] Migrate existing data from Supabase
- [ ] Update all database queries in backend

### Phase 2: AI Model Integration (Week 2)
- [ ] Set up Groq API integration
- [ ] Implement Gemini Flash fallback
- [ ] Set up local Ollama for unlimited use
- [ ] Create smart model router

### Phase 3: Interview Module (Week 3-4)
- [ ] Integrate existing emotion detection
- [ ] Set up Whisper for speech-to-text
- [ ] Build interview session flow (frontend + backend)
- [ ] Implement answer scoring with Groq
- [ ] Add STAR format analysis

### Phase 4: Agentic Features (Week 5-6)
- [ ] Build event orchestrator (Redis + worker)
- [ ] Implement agent memory system
- [ ] Add dynamic course adaptation
- [ ] Build accountability agent (daily reminders)

### Phase 5: Optimization (Week 7)
- [ ] Implement caching layer
- [ ] Add rate limiting
- [ ] Optimize API calls
- [ ] Performance testing

---

## 💰 Cost Analysis (Free Tier Limits)

| Service | Free Tier | Estimated Usage | Sufficient? |
|---------|-----------|-----------------|-------------|
| **MongoDB Atlas** | 512MB storage | ~100 users | ✅ Yes (for MVP) |
| **Groq** | 60 req/min | ~50 req/min peak | ✅ Yes |
| **Gemini Flash** | 15 req/min | ~10 req/min | ✅ Yes |
| **Google TTS** | 1M chars/month | ~500k chars/month | ✅ Yes |
| **Whisper (self-hosted)** | Unlimited | Unlimited | ✅ Yes |
| **Judge0 (self-hosted)** | Unlimited | Unlimited | ✅ Yes |

**Total Monthly Cost**: $0 (for up to 100-200 active users)

---

## 📋 User Review Required

> [!IMPORTANT]
> **Key Decisions Needed:**
> 
> 1. **MongoDB Migration**: Are you comfortable migrating from Supabase to MongoDB? This is a significant change but offers better flexibility and free tier.
> 
> 2. **Self-Hosting**: Are you willing to self-host Judge0 and Whisper using Docker? This gives unlimited usage but requires server setup.
> 
> 3. **Interview Module Priority**: Should we prioritize the interview module with ML (emotion + speech) or focus on other agentic features first?
> 
> 4. **Lovable Integration**: How do you want to integrate this with Lovable? Should we keep the frontend in this repo or separate it?

> [!WARNING]
> **Rate Limits**: While free tiers are generous, we need to implement:
> - Request queuing for peak times
> - Graceful degradation (fallback to slower models)
> - User-facing rate limit messages

---

## 🎯 Success Metrics

After implementation, the platform should achieve:

- ⚡ **Speed**: Course generation in < 30 seconds (down from 40s)
- 💰 **Cost**: $0/month for up to 200 users
- 🤖 **Agentic**: 5/5 pillars implemented (Memory, Planning, Execution, Adaptation, Proactivity)
- 🎤 **Interview**: Real-time emotion detection + speech analysis working
- 📊 **Accuracy**: Interview scoring within 10% of human evaluator

---

## 📁 Files to Modify

### Backend
- `backend/database/mongodb_client.py` (NEW) - MongoDB connection
- `backend/agents/*/main.py` - Update all database calls
- `backend/agents/interview-coach/main.py` - Add ML integration
- `backend/orchestrator/` (NEW) - Event-driven orchestrator
- `backend/requirements.txt` - Add new dependencies

### Frontend
- `src/lib/mongodb.ts` (NEW) - MongoDB client
- `src/components/interview/InterviewSession.tsx` (NEW)
- `src/components/interview/EmotionDetector.tsx` (NEW)
- All database query hooks - Update to MongoDB

### Infrastructure
- `docker-compose.yml` - Add MongoDB, Redis, Judge0, Whisper
- `.env.example` - Update with new service configs
